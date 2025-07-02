// React Hooks for Database Operations
// Provides easy-to-use hooks with React Query integration

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { db } from "@/lib/database";
import { optimizedAnalyticsService } from "@/lib/optimized-analytics";
import type {
  CreateTopicInput,
  CreateQuestionInput,
  CreateQuestionOptionInput,
  CreateQuizInput,
  CreateExamInput,
  CreateFlashcardInput,
  CreateUserAnswerInput,
  UpdateUserInput,
  UpdateQuizInput,
  UpdateFlashcardInput,
} from "@/types/database";

// =============================================
// Query Keys
// =============================================

export const QUERY_KEYS = {
  // User
  currentUser: ["user", "current"] as const,
  user: (id: string) => ["user", id] as const,

  // Topics
  topics: () => ["topics"] as const,
  topic: (id: string) => ["topic", id] as const,
  topicsWithProgress: (userId: string) =>
    ["topics", "progress", userId] as const,

  // Questions
  questions: (filters?: {
    topicId?: string;
    difficulty?: number;
    questionType?: string;
    limit?: number;
  }) => ["questions", filters] as const,
  question: (id: string) => ["question", id] as const,

  // Quizzes
  userQuizzes: (userId: string) => ["quizzes", "user", userId] as const,
  quiz: (id: string) => ["quiz", id] as const,
  quizWithQuestions: (id: string) => ["quiz", "questions", id] as const,

  // Exams
  userExams: (userId: string) => ["exams", "user", userId] as const,
  exam: (id: string) => ["exam", id] as const,
  examWithQuestions: (id: string) => ["exam", "questions", id] as const,
  examSessions: (userId: string) => ["exam-sessions", userId] as const,

  // Flashcards
  userFlashcards: (userId: string) => ["flashcards", "user", userId] as const,
  flashcardsDue: (userId: string) => ["flashcards", "due", userId] as const,

  // Analytics
  dashboardStats: (userId: string) =>
    ["analytics", "dashboard", userId] as const,
  recentActivity: (userId: string) =>
    ["analytics", "activity", userId] as const,
  topicProgress: (userId: string) => ["analytics", "progress", userId] as const,

  // Answers
  userAnswers: (
    userId: string,
    filters?: {
      quizId?: string;
      sessionId?: string;
      topicId?: string;
    }
  ) => ["answers", userId, filters] as const,
} as const;

// =============================================
// User Hooks
// =============================================

export function useCurrentUser() {
  return useQuery({
    queryKey: QUERY_KEYS.currentUser,
    queryFn: () => db.users.getCurrentUser(),
    select: (response) => response.data,
    staleTime: 10 * 60 * 1000, // 10 minutes - user data changes infrequently
    gcTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
    retry: 1, // Only retry once to prevent infinite loops
    refetchOnWindowFocus: false, // Don't refetch when window regains focus
  });
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.user(userId),
    queryFn: () => db.users.getUserById(userId),
    select: (response) => response.data,
    enabled: !!userId,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserInput }) =>
      db.users.updateUser(userId, data),
    onSuccess: (response, { userId }) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user(userId) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.currentUser });
      }
    },
  });
}

// =============================================
// Topic Hooks
// =============================================

export function useTopics() {
  return useQuery({
    queryKey: QUERY_KEYS.topics(),
    queryFn: () => db.topics.getAllTopics(),
    select: (response) => response.data || [],
    staleTime: 15 * 60 * 1000, // 15 minutes - topics change rarely
  });
}

export function useTopic(topicId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.topic(topicId),
    queryFn: () => db.topics.getTopicById(topicId),
    select: (response) => response.data,
    enabled: !!topicId,
  });
}

export function useTopicsWithProgress(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.topicsWithProgress(userId),
    queryFn: () => db.topics.getTopicsWithProgress(userId),
    select: (response) => response.data || [],
    enabled: !!userId,
  });
}

export function useCreateTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTopicInput) => db.topics.createTopic(data),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.topics() });
      }
    },
  });
}

// =============================================
// Question Hooks
// =============================================

export function useQuestions(filters?: {
  topicId?: string;
  difficulty?: number;
  questionType?: string;
  limit?: number;
}) {
  return useQuery({
    queryKey: QUERY_KEYS.questions(filters),
    queryFn: () => db.questions.getQuestionsWithOptions(filters),
    select: (response) => response.data || [],
    staleTime: 10 * 60 * 1000, // 10 minutes - questions change infrequently
  });
}

export function useQuestion(questionId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.question(questionId),
    queryFn: () => db.questions.getQuestionById(questionId),
    select: (response) => response.data,
    enabled: !!questionId,
  });
}

export function useCreateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      question,
      options,
    }: {
      question: CreateQuestionInput;
      options: CreateQuestionOptionInput[];
    }) => db.questions.createQuestionWithOptions(question, options),
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ["questions"] });
      }
    },
  });
}

// =============================================
// Quiz Hooks
// =============================================

export function useUserQuizzes(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.userQuizzes(userId),
    queryFn: () => db.quizzes.getUserQuizzes(userId),
    select: (response) => response.data || [],
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes - reasonable for user content
    refetchOnWindowFocus: false, // Disabled for better performance
    refetchOnMount: false, // Only refetch when data is stale
  });
}

export function useQuizWithQuestions(quizId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.quizWithQuestions(quizId),
    queryFn: () => db.quizzes.getQuizWithQuestions(quizId),
    select: (response) => response.data,
    enabled: !!quizId,
    staleTime: 10 * 60 * 1000, // 10 minutes - quizzes don't change often during taking
    refetchOnWindowFocus: false, // Don't refetch when user comes back from another tab
    refetchOnMount: false, // Only refetch when data is stale
    placeholderData: (previousData) => previousData, // Keep showing previous data while refetching
    gcTime: 30 * 60 * 1000, // 30 minutes cache time
  });
}

export function useCreateQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateQuizInput) => db.quizzes.createQuiz(data),
    onSuccess: (response, variables) => {
      if (response.success) {
        // Only invalidate user-specific queries to avoid unnecessary refetches
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.userQuizzes(variables.user_id),
        });
        // Selectively invalidate dashboard stats only for this user
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.dashboardStats(variables.user_id),
        });
        // Don't invalidate recent activity immediately - let it update naturally
      }
    },
  });
}

export function useUpdateQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quizId, data }: { quizId: string; data: UpdateQuizInput }) =>
      db.quizzes.updateQuiz(quizId, data),
    onSuccess: (response, { quizId }) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quiz(quizId) });
        queryClient.invalidateQueries({ queryKey: ["quizzes"] });
      }
    },
  });
}

export function useDeleteQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (quizId: string) => db.quizzes.deleteQuiz(quizId),
    onSuccess: (response, quizId) => {
      if (response.success) {
        // More targeted invalidation - only invalidate quiz lists, not all related data
        queryClient.invalidateQueries({
          queryKey: ["quizzes"],
          type: "all",
        });
        // Only invalidate quiz attempts if we have the specific quiz
        queryClient.removeQueries({
          queryKey: ["quiz", quizId],
          type: "all",
        });
      }
    },
  });
}

// =============================================
// Exam Hooks
// =============================================

export function useUserExams(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.userExams(userId),
    queryFn: () => db.exams.getUserExams(userId),
    select: (response) => response.data || [],
    enabled: !!userId,
  });
}

export function useExamWithQuestions(examId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.examWithQuestions(examId),
    queryFn: () => db.exams.getExamWithQuestions(examId),
    select: (response) => response.data,
    enabled: !!examId,
  });
}

export function useCreateExam() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExamInput) => db.exams.createExam(data),
    onSuccess: (response, variables) => {
      if (response.success) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.userExams(variables.user_id),
        });
      }
    },
  });
}

export function useExamSessions(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.examSessions(userId),
    queryFn: () => db.exams.getUserExamSessions(userId),
    select: (response) => response.data || [],
    enabled: !!userId,
  });
}

// =============================================
// Flashcard Hooks
// =============================================

export function useUserFlashcards(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.userFlashcards(userId),
    queryFn: () => db.flashcards.getUserFlashcards(userId),
    select: (response) => response.data || [],
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute - more responsive for flashcard progress updates
    refetchOnWindowFocus: true, // Re-enable to catch updates when returning from study sessions
    refetchOnMount: true, // Re-enable to ensure fresh data when component mounts
    placeholderData: undefined, // Don't use placeholder data to maintain proper loading state
    gcTime: 5 * 60 * 1000, // 5 minutes cache time
  });
}

export function useFlashcardsDue(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.flashcardsDue(userId),
    queryFn: () => db.flashcards.getFlashcardsDueForReview(userId),
    select: (response) => response.data || [],
    enabled: !!userId,
    staleTime: 30 * 1000, // 30 seconds - very responsive for due items
    refetchOnWindowFocus: true, // Re-enable to catch updates
    refetchInterval: false, // Disabled automatic refetching for better performance
    gcTime: 2 * 60 * 1000, // 2 minutes cache time
  });
}

export function useCreateFlashcard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFlashcardInput) =>
      db.flashcards.createFlashcard(data),
    onSuccess: (response, variables) => {
      if (response.success) {
        // Immediate invalidation for real-time updates
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.userFlashcards(variables.user_id),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.flashcardsDue(variables.user_id),
        });

        // Also invalidate dashboard data for updated stats
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.dashboardStats(variables.user_id),
        });
      }
    },
  });
}

export function useUpdateFlashcard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      flashcardId,
      data,
    }: {
      flashcardId: string;
      data: UpdateFlashcardInput;
    }) => db.flashcards.updateFlashcard(flashcardId, data),
    onSuccess: (response, { flashcardId, data }) => {
      if (response.success) {
        // Invalidate all flashcard-related queries for immediate updates
        queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey.includes("flashcards") &&
            (query.queryKey.includes("user") || query.queryKey.includes("due")),
        });
      }
    },
  });
}

export function useDeleteFlashcard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (flashcardId: string) =>
      db.flashcards.deleteFlashcard(flashcardId),
    onSuccess: (response) => {
      if (response.success) {
        // Immediately invalidate all flashcard-related queries for real-time updates
        queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey.includes("flashcards") &&
            (query.queryKey.includes("user") || query.queryKey.includes("due")),
        });

        // Also invalidate dashboard stats as flashcard count changed
        queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey.includes("dashboard") ||
            query.queryKey.includes("analytics"),
        });
      }
    },
  });
}

// =============================================
// Answer Hooks
// =============================================

export function useSubmitAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserAnswerInput) => db.answers.submitAnswer(data),
    onSuccess: (response, variables) => {
      if (response.success) {
        // More selective invalidation - only update what's actually affected
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.userAnswers(variables.user_id),
        });
        // Dashboard stats will update naturally on next view
        // Don't invalidate immediately to avoid unnecessary requests
      }
    },
  });
}

export function useUserAnswers(
  userId: string,
  filters?: {
    quizId?: string;
    sessionId?: string;
    topicId?: string;
  }
) {
  return useQuery({
    queryKey: QUERY_KEYS.userAnswers(userId, filters),
    queryFn: () => db.answers.getUserAnswers(userId, filters),
    select: (response) => response.data || [],
    enabled: !!userId,
  });
}

// =============================================
// Analytics Hooks (OPTIMIZED & LEGACY)
// =============================================

// NEW: OPTIMIZED BATCH DASHBOARD HOOK - Use this for best performance
export function useOptimizedDashboard(userId: string) {
  return useQuery({
    queryKey: [...QUERY_KEYS.dashboardStats(userId), "batch"],
    queryFn: () => optimizedAnalyticsService.getAllDashboardData(userId),
    enabled: !!userId, // Only fetch when we have a userId
    staleTime: 2 * 60 * 1000, // 2 minutes - more reasonable for dashboard data
    gcTime: 10 * 60 * 1000, // 10 minutes cache time
    refetchOnWindowFocus: false, // Disabled for better performance
    refetchOnMount: false, // Only refetch when data is stale
    retry: 1,
    refetchInterval: false,
    // Show cached data immediately while fetching fresh data
    placeholderData: (previousData) => previousData,
    select: (data) => ({
      stats: data.stats.data,
      recentActivity: data.recentActivity.data || [],
      topicProgress: data.topicProgress.data || [],
      isLoading: false,
      isError:
        !data.stats.success ||
        !data.recentActivity.success ||
        !data.topicProgress.success,
      error:
        data.stats.error ||
        data.recentActivity.error ||
        data.topicProgress.error,
    }),
  });
}

// LEGACY: Individual hooks - still using optimized backend but separate React Query calls
export function useDashboardStats(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.dashboardStats(userId),
    queryFn: () => db.analytics.getDashboardStats(userId),
    select: (response) => response.data,
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes for instant loading
    refetchOnWindowFocus: false,
    retry: 1,
    refetchInterval: false,
    // Show cached data immediately while fetching fresh data
    placeholderData: (previousData, previousQuery) => previousData,
  });
}

export function useRecentActivity(userId: string, limit: number = 10) {
  return useQuery({
    queryKey: QUERY_KEYS.recentActivity(userId),
    queryFn: () => db.analytics.getRecentActivity(userId, limit),
    select: (response) => response.data || [],
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes for instant loading
    refetchOnWindowFocus: false,
    retry: 1,
    refetchInterval: false,
    // Show cached data immediately while fetching fresh data
    placeholderData: (previousData, previousQuery) => previousData,
  });
}

export function useTopicProgress(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.topicProgress(userId),
    queryFn: () => db.analytics.getTopicProgress(userId),
    select: (response) => response.data || [],
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes for instant loading
    refetchOnWindowFocus: false,
    retry: 1,
    refetchInterval: false,
    // Show cached data immediately while fetching fresh data
    placeholderData: (previousData, previousQuery) => previousData,
  });
}

// =============================================
// Compound Hooks (Multiple Operations)
// =============================================

export function useDashboardData(
  userId: string,
  useOptimized: boolean = false
) {
  // OPTIMIZED VERSION: Single batched call
  const optimizedResult = useOptimizedDashboard(userId);

  // LEGACY VERSION: Individual hooks (for backward compatibility)
  const stats = useDashboardStats(userId);
  const recentActivity = useRecentActivity(userId);
  const topicProgress = useTopicProgress(userId);

  // Create a stable empty state object to prevent re-renders
  const emptyState = useMemo(
    () => ({
      stats: { data: null, isLoading: false, isError: false, error: null },
      recentActivity: {
        data: [],
        isLoading: false,
        isError: false,
        error: null,
      },
      topicProgress: {
        data: [],
        isLoading: false,
        isError: false,
        error: null,
      },
      isLoading: false,
      isError: false,
      error: null,
    }),
    []
  );

  return useMemo(() => {
    // If no userId, return empty state
    if (!userId) {
      return emptyState;
    }

    // Use optimized version if requested
    if (useOptimized) {
      return {
        stats: {
          data: optimizedResult.data?.stats,
          isLoading: optimizedResult.isLoading,
          isError: optimizedResult.isError,
          error: optimizedResult.error,
        },
        recentActivity: {
          data: optimizedResult.data?.recentActivity || [],
          isLoading: optimizedResult.isLoading,
          isError: optimizedResult.isError,
          error: optimizedResult.error,
        },
        topicProgress: {
          data: optimizedResult.data?.topicProgress || [],
          isLoading: optimizedResult.isLoading,
          isError: optimizedResult.isError,
          error: optimizedResult.error,
        },
        isLoading: optimizedResult.isLoading,
        isError: optimizedResult.isError,
        error: optimizedResult.error,
      };
    }

    // Legacy version: separate hooks
    return {
      stats,
      recentActivity,
      topicProgress,
      isLoading:
        stats.isLoading || recentActivity.isLoading || topicProgress.isLoading,
      isError: stats.isError || recentActivity.isError || topicProgress.isError,
      error: stats.error || recentActivity.error || topicProgress.error,
    };
  }, [
    userId,
    useOptimized,
    optimizedResult,
    stats,
    recentActivity,
    topicProgress,
    emptyState,
  ]);
}

export function useUserContent(userId: string) {
  const quizzes = useUserQuizzes(userId);
  const exams = useUserExams(userId);
  const flashcards = useUserFlashcards(userId);

  return {
    quizzes,
    exams,
    flashcards,
    isLoading: quizzes.isLoading || exams.isLoading || flashcards.isLoading,
    isError: quizzes.isError || exams.isError || flashcards.isError,
    error: quizzes.error || exams.error || flashcards.error,
  };
}

// =============================================
// Utility Hooks
// =============================================

export function useInvalidateUserData() {
  const queryClient = useQueryClient();

  return useCallback(
    (userId: string) => {
      // Only invalidate essential dashboard data, not everything
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.dashboardStats(userId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.recentActivity(userId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.topicProgress(userId),
      });
      // FIXED: Also invalidate flashcard data for real-time updates
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.userFlashcards(userId),
      });
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.flashcardsDue(userId),
      });
    },
    [queryClient]
  );
}

// More targeted invalidation for specific operations
export function useInvalidateAllUserData() {
  const queryClient = useQueryClient();

  return (userId: string) => {
    // Invalidate all user-related queries (use sparingly)
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userQuizzes(userId) });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userExams(userId) });
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.userFlashcards(userId),
    });
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.dashboardStats(userId),
    });
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.recentActivity(userId),
    });
    queryClient.invalidateQueries({
      queryKey: QUERY_KEYS.topicProgress(userId),
    });
    queryClient.invalidateQueries({ queryKey: QUERY_KEYS.userAnswers(userId) });
  };
}

export function usePrefetchUserData() {
  const queryClient = useQueryClient();

  return useCallback(
    async (userId: string) => {
      if (!userId) return;

      // All existing prefetch promises...
      const prefetchPromises = [
        // Dashboard data
        queryClient.prefetchQuery({
          queryKey: QUERY_KEYS.dashboardStats(userId),
          queryFn: () => db.analytics.getDashboardStats(userId),
          staleTime: 2 * 60 * 1000,
        }),
        queryClient.prefetchQuery({
          queryKey: QUERY_KEYS.recentActivity(userId),
          queryFn: () => db.analytics.getRecentActivity(userId, 10),
          staleTime: 1 * 60 * 1000,
        }),
        queryClient.prefetchQuery({
          queryKey: QUERY_KEYS.topicProgress(userId),
          queryFn: () => db.analytics.getTopicProgress(userId),
          staleTime: 5 * 60 * 1000,
        }),

        // Create pages data
        queryClient.prefetchQuery({
          queryKey: QUERY_KEYS.topics(),
          queryFn: () => db.topics.getTopics(),
          staleTime: 10 * 60 * 1000,
        }),
        queryClient.prefetchQuery({
          queryKey: QUERY_KEYS.userFlashcards(userId),
          queryFn: () => db.flashcards.getUserFlashcards(userId),
          staleTime: 1 * 60 * 1000,
        }),

        // Quiz history data
        queryClient.prefetchQuery({
          queryKey: ["user-quiz-attempts", userId],
          queryFn: () => db.quizzes.getUserQuizAttempts(userId),
          staleTime: 2 * 60 * 1000,
        }),
      ];

      // Use Promise.allSettled to handle any individual failures gracefully
      await Promise.allSettled(prefetchPromises);
    },
    [queryClient]
  );
}

// Add specific quiz prefetching functions
export function usePrefetchQuizPages() {
  const queryClient = useQueryClient();

  const prefetchQuizTake = useCallback(
    (quizId: string) => {
      if (!quizId) return;

      queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.quizWithQuestions(quizId),
        queryFn: () => db.quizzes.getQuizWithQuestions(quizId),
        staleTime: 10 * 60 * 1000,
      });
    },
    [queryClient]
  );

  const prefetchQuizReview = useCallback(
    (quizId: string, userId: string) => {
      if (!quizId || !userId) return;

      queryClient.prefetchQuery({
        queryKey: ["quiz-review", quizId, userId],
        queryFn: async () => {
          const url = `/api/quiz/review/${quizId}?userId=${userId}`;
          const response = await fetch(url);

          if (!response.ok) {
            throw new Error(`Failed to fetch review data: ${response.status}`);
          }

          return response.json();
        },
        staleTime: 5 * 60 * 1000,
      });
    },
    [queryClient]
  );

  const prefetchQuizHistory = useCallback(
    (userId: string) => {
      if (!userId) return;

      queryClient.prefetchQuery({
        queryKey: ["user-quiz-attempts", userId],
        queryFn: async () => {
          const response = await fetch(`/api/quiz/user-attempts/${userId}`);
          if (!response.ok) {
            throw new Error("Failed to fetch quiz attempts");
          }
          return response.json();
        },
        staleTime: 5 * 60 * 1000,
      });
    },
    [queryClient]
  );

  return { prefetchQuizTake, prefetchQuizReview, prefetchQuizHistory };
}

// Specific prefetch functions for different pages
export function usePrefetchCreatePages() {
  const queryClient = useQueryClient();

  return useCallback(async () => {
    try {
      // Prefetch topics for create pages - this is the main data they need
      await queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.topics(),
        queryFn: () => db.topics.getTopics(),
        staleTime: 15 * 60 * 1000,
      });
    } catch (error) {
      console.warn("Create pages prefetch failed:", error);
    }
  }, [queryClient]);
}

// Quiz Attempts (for quiz history page)
export function useUserQuizAttempts(userId: string) {
  return useQuery({
    queryKey: ["user-quiz-attempts", userId],
    queryFn: async () => {
      if (!userId) {
        return [];
      }

      const response = await fetch(`/api/quiz/user-attempts/${userId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch quiz attempts");
      }

      return response.json();
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // Increased to 5 minutes - quiz attempts don't change frequently
    gcTime: 15 * 60 * 1000, // Increased cache time
    refetchOnWindowFocus: false,
    refetchOnMount: false, // Don't refetch on mount if we have cached data
    retry: 1,
    refetchInterval: false,
    // Show cached data immediately while fetching fresh data
    placeholderData: (previousData) => previousData,
  });
}

// Add new hook for quiz review data with React Query optimization
export function useQuizReview(quizId: string, userId: string) {
  return useQuery({
    queryKey: ["quiz-review", quizId, userId],
    queryFn: async () => {
      const url = `/api/quiz/review/${quizId}?userId=${userId}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch review data: ${response.status}`);
      }

      return response.json();
    },
    enabled: !!(quizId && userId),
    staleTime: 5 * 60 * 1000, // 5 minutes - review data is relatively static
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    placeholderData: (previousData) => previousData,
    gcTime: 15 * 60 * 1000, // 15 minutes cache time
  });
}
