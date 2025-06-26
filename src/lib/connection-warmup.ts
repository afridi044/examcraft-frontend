// Connection warmup and preloading system for ExamCraft
// Designed to eliminate first-click slowness by warming up connections and prefetching critical data

import { supabase } from "./supabase";
import { QueryClient } from "@tanstack/react-query";
import { db } from "./database";
import { optimizedAnalyticsService } from "./optimized-analytics";
import { QUERY_KEYS } from "@/hooks/useDatabase";

interface WarmupOptions {
  warmupConnection?: boolean;
  prefetchCriticalData?: boolean;
  userId?: string;
}

/**
 * Warms up the Supabase connection to eliminate cold start latency
 */
export async function warmupSupabaseConnection(): Promise<void> {
  try {
    // Simple ping to establish connection pool
    const startTime = performance.now();
    
    // Use a lightweight query to warm up the connection
    await supabase.from('users').select('count').limit(1).maybeSingle();
    
    // Also warm up via health endpoint if available
    if (typeof window !== 'undefined') {
      fetch('/api/health', { 
        method: 'GET',
        cache: 'no-cache',
      }).catch(() => {
        // Silently ignore fetch errors - this is just warmup
      });
    }
    
    const duration = performance.now() - startTime;
    console.log(`Supabase connection warmed up in ${duration.toFixed(2)}ms`);
  } catch (error) {
    // Silently handle errors - warmup is optional
    console.warn('Connection warmup failed:', error);
  }
}

/**
 * Prefetches critical user data to eliminate first-click delay
 */
export async function prefetchCriticalUserData(
  queryClient: QueryClient,
  userId: string
): Promise<void> {
  if (!userId) return;

  try {
    const startTime = performance.now();

    // Prefetch the most commonly accessed data in parallel
    const prefetchPromises = [
      // User profile data
      queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.currentUser,
        queryFn: () => db.users.getCurrentUser(),
        staleTime: 5 * 60 * 1000, // 5 minutes
      }),

      // Dashboard data (optimized batch)
      queryClient.prefetchQuery({
        queryKey: [...QUERY_KEYS.dashboardStats(userId), 'batch'],
        queryFn: () => optimizedAnalyticsService.getAllDashboardData(userId),
        staleTime: 2 * 60 * 1000, // 2 minutes
      }),

      // Topics (commonly accessed across the app)
      queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.topics,
        queryFn: () => db.topics.getAllTopics(),
        staleTime: 15 * 60 * 1000, // 15 minutes
      }),

      // User's flashcards (frequently accessed)
      queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.userFlashcards(userId),
        queryFn: () => db.flashcards.getUserFlashcards(userId),
        staleTime: 5 * 60 * 1000, // 5 minutes
      }),

      // User's quizzes (frequently accessed)
      queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.userQuizzes(userId),
        queryFn: () => db.quizzes.getUserQuizzes(userId),
        staleTime: 5 * 60 * 1000, // 5 minutes
      }),
    ];

    await Promise.allSettled(prefetchPromises);
    
    const duration = performance.now() - startTime;
    console.log(`Critical data prefetched in ${duration.toFixed(2)}ms`);
  } catch (error) {
    console.warn('Critical data prefetch failed:', error);
  }
}

/**
 * Background warmup of secondary data to improve subsequent navigation
 */
export async function prefetchSecondaryData(
  queryClient: QueryClient,
  userId: string
): Promise<void> {
  if (!userId) return;

  // Use setTimeout to defer this until after critical rendering
  setTimeout(async () => {
    try {
      const prefetchPromises = [
        // Flashcards due for review
        queryClient.prefetchQuery({
          queryKey: QUERY_KEYS.flashcardsDue(userId),
          queryFn: () => db.flashcards.getFlashcardsDueForReview(userId),
          staleTime: 2 * 60 * 1000, // 2 minutes
        }),

        // Recent activity details
        queryClient.prefetchQuery({
          queryKey: QUERY_KEYS.recentActivity(userId),
          queryFn: () => db.analytics.getRecentActivity(userId, 10),
          staleTime: 2 * 60 * 1000, // 2 minutes
        }),

        // Topic progress
        queryClient.prefetchQuery({
          queryKey: QUERY_KEYS.topicProgress(userId),
          queryFn: () => db.analytics.getTopicProgress(userId),
          staleTime: 5 * 60 * 1000, // 5 minutes
        }),
      ];

      await Promise.allSettled(prefetchPromises);
      console.log('Secondary data prefetched in background');
    } catch (error) {
      console.warn('Secondary data prefetch failed:', error);
    }
  }, 100); // Small delay to not block critical rendering
}

/**
 * Complete warmup system that combines connection warmup and data prefetching
 */
export async function performCompleteWarmup(
  queryClient: QueryClient,
  options: WarmupOptions = {}
): Promise<void> {
  const {
    warmupConnection = true,
    prefetchCriticalData = true,
    userId
  } = options;

  try {
    const promises = [];

    // Warm up connection
    if (warmupConnection) {
      promises.push(warmupSupabaseConnection());
    }

    // Prefetch critical data if user is authenticated
    if (prefetchCriticalData && userId) {
      promises.push(prefetchCriticalUserData(queryClient, userId));
    }

    // Wait for critical operations
    await Promise.allSettled(promises);

    // Start background prefetching
    if (userId) {
      prefetchSecondaryData(queryClient, userId);
    }

  } catch (error) {
    console.warn('Complete warmup failed:', error);
  }
}

/**
 * Lightweight connection test to verify Supabase is ready
 */
export async function testConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('users').select('count').limit(1).maybeSingle();
    return !error;
  } catch {
    return false;
  }
}

/**
 * Proactive warmup that runs on app initialization
 */
export function initializeAppWarmup(queryClient: QueryClient): void {
  // Start connection warmup immediately
  warmupSupabaseConnection();

  // Listen for auth state changes to trigger user-specific prefetching
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      // Get user ID from session
      try {
        const response = await db.users.getCurrentUser();
        if (response.success && response.data) {
          const userId = response.data.user_id;
          
          // Perform user-specific warmup
          performCompleteWarmup(queryClient, {
            warmupConnection: false, // Already warmed up
            prefetchCriticalData: true,
            userId,
          });
        }
      } catch (error) {
        console.warn('Failed to get user ID for warmup:', error);
      }
    }
  });
}
