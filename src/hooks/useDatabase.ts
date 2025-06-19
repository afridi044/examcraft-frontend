// React Hooks for Database Operations
// Provides easy-to-use hooks with React Query integration

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { db } from "@/lib/database";
import type {
  CreateTopicInput,
  CreateQuestionInput,
  CreateQuestionOptionInput,
  CreateQuizInput,
  UpdateUserInput,
  UpdateQuizInput,
} from "@/types/database";

// =============================================
// Optimized Query Keys with better structure
// =============================================

export const QUERY_KEYS = {
  // User queries
  users: ["users"] as const,
  currentUser: () => [...QUERY_KEYS.users, "current"] as const,
  user: (id: string) => [...QUERY_KEYS.users, id] as const,

  // Topics with better grouping
  topics: ["topics"] as const,
  allTopics: () => [...QUERY_KEYS.topics, "all"] as const,
  topic: (id: string) => [...QUERY_KEYS.topics, id] as const,
  topicsWithProgress: (userId: string) =>
    [...QUERY_KEYS.topics, "progress", userId] as const,

  // Questions with smart filtering
  questions: ["questions"] as const,
  questionList: (filters?: object) =>
    [...QUERY_KEYS.questions, "list", filters] as const,
  question: (id: string) => [...QUERY_KEYS.questions, id] as const,

  // Quizzes
  quizzes: ["quizzes"] as const,
  userQuizzes: (userId: string) =>
    [...QUERY_KEYS.quizzes, "user", userId] as const,
  quiz: (id: string) => [...QUERY_KEYS.quizzes, id] as const,
  quizWithQuestions: (id: string) =>
    [...QUERY_KEYS.quizzes, id, "questions"] as const,

  // Exams
  exams: ["exams"] as const,
  userExams: (userId: string) => [...QUERY_KEYS.exams, "user", userId] as const,
  exam: (id: string) => [...QUERY_KEYS.exams, id] as const,
  examWithQuestions: (id: string) =>
    [...QUERY_KEYS.exams, id, "questions"] as const,
  examSessions: (userId: string) =>
    [...QUERY_KEYS.exams, "sessions", userId] as const,

  // Flashcards
  flashcards: ["flashcards"] as const,
  userFlashcards: (userId: string) =>
    [...QUERY_KEYS.flashcards, "user", userId] as const,
  flashcardsDue: (userId: string) =>
    [...QUERY_KEYS.flashcards, "due", userId] as const,

  // Analytics with better caching
  analytics: ["analytics"] as const,
  dashboardStats: (userId: string) =>
    [...QUERY_KEYS.analytics, "dashboard", userId] as const,
  recentActivity: (userId: string) =>
    [...QUERY_KEYS.analytics, "activity", userId] as const,
  topicProgress: (userId: string) =>
    [...QUERY_KEYS.analytics, "progress", userId] as const,

  // Answers
  answers: ["answers"] as const,
  userAnswers: (userId: string, filters?: object) =>
    [...QUERY_KEYS.answers, userId, filters] as const,
} as const;

// =============================================
// Optimized User Hooks
// =============================================

export function useCurrentUser() {
  return useQuery({
    queryKey: QUERY_KEYS.currentUser(),
    queryFn: () => db.users.getCurrentUser(),
    select: (response) => response.data,
    staleTime: 10 * 60 * 1000, // 10 minutes - user data doesn't change often
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    retry: 1, // Only retry once for auth-related queries
    refetchOnWindowFocus: false,
    // Enable background refetch for critical user data
    refetchInterval: 15 * 60 * 1000, // 15 minutes
  });
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.user(userId),
    queryFn: () => db.users.getUserById(userId),
    select: (response) => response.data,
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserInput }) =>
      db.users.updateUser(userId, data),
    onSuccess: (response, { userId }) => {
      if (response.success) {
        // Optimized cache invalidation
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user(userId) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.currentUser() });
      }
    },
  });
}

// =============================================
// Optimized Topic Hooks
// =============================================

export function useTopics() {
  return useQuery({
    queryKey: QUERY_KEYS.allTopics(),
    queryFn: () => db.topics.getAllTopics(),
    select: (response) => response.data || [],
    staleTime: 15 * 60 * 1000, // 15 minutes - topics don't change frequently
    gcTime: 30 * 60 * 1000,
  });
}

export function useTopic(topicId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.topic(topicId),
    queryFn: () => db.topics.getTopicById(topicId),
    select: (response) => response.data,
    enabled: !!topicId,
    staleTime: 10 * 60 * 1000,
  });
}

export function useTopicsWithProgress(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.topicsWithProgress(userId),
    queryFn: () => db.topics.getTopicsWithProgress(userId),
    select: (response) => response.data || [],
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // Progress data should be fresher
  });
}

export function useCreateTopic() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTopicInput) => db.topics.createTopic(data),
    onSuccess: (response) => {
      if (response.success) {
        // More targeted cache invalidation
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.topics });
      }
    },
  });
}

// =============================================
// Optimized Question Hooks
// =============================================

export function useQuestions(filters?: {
  topicId?: string;
  difficulty?: number;
  questionType?: string;
  limit?: number;
}) {
  // Memoize the filters to prevent unnecessary re-fetches
  const memoizedFilters = useMemo(
    () => filters,
    [
      filters?.topicId,
      filters?.difficulty,
      filters?.questionType,
      filters?.limit,
    ]
  );

  return useQuery({
    queryKey: QUERY_KEYS.questionList(memoizedFilters),
    queryFn: () => db.questions.getQuestionsWithOptions(memoizedFilters),
    select: (response) => response.data || [],
    staleTime: 5 * 60 * 1000,
    // Enable background refetch for question lists
    refetchOnMount: true,
  });
}

export function useQuestion(questionId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.question(questionId),
    queryFn: () => db.questions.getQuestionById(questionId),
    select: (response) => response.data,
    enabled: !!questionId,
    staleTime: 10 * 60 * 1000, // Individual questions are stable
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
        // Invalidate question lists but keep individual questions cached
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.questions,
          exact: false,
        });
      }
    },
  });
}

// =============================================
// Simplified Quiz Hooks with Better Performance
// =============================================

export function useUserQuizzes(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.userQuizzes(userId),
    queryFn: () => db.quizzes.getUserQuizzes(userId),
    select: (response) => response.data || [],
    enabled: !!userId,
    staleTime: 3 * 60 * 1000, // 3 minutes for user-specific data
  });
}

export function useQuizWithQuestions(quizId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.quizWithQuestions(quizId),
    queryFn: () => db.quizzes.getQuizWithQuestions(quizId),
    select: (response) => response.data,
    enabled: !!quizId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateQuizInput) => db.quizzes.createQuiz(data),
    onSuccess: (response, variables) => {
      if (response.success && variables.user_id) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.userQuizzes(variables.user_id),
        });
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
        // Update specific quiz cache
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quiz(quizId) });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.quizWithQuestions(quizId),
        });
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
        // Remove from all quiz-related caches
        queryClient.removeQueries({ queryKey: QUERY_KEYS.quiz(quizId) });
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.quizzes });
      }
    },
  });
}

// =============================================
// Simplified Analytics Hooks
// =============================================

export function useDashboardStats(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.dashboardStats(userId),
    queryFn: () => db.analytics.getDashboardStats(userId),
    select: (response) => response.data,
    enabled: !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes for dashboard stats
    // Background refresh for live data
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRecentActivity(userId: string, limit: number = 10) {
  return useQuery({
    queryKey: [...QUERY_KEYS.recentActivity(userId), limit],
    queryFn: () => db.analytics.getRecentActivity(userId, limit),
    select: (response) => response.data || [],
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute for recent activity
  });
}

export function useTopicProgress(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.topicProgress(userId),
    queryFn: () => db.analytics.getTopicProgress(userId),
    select: (response) => response.data || [],
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes for topic progress
  });
}

// =============================================
// Utility Hooks for Better Performance
// =============================================

// Prefetch commonly used data
export function usePrefetchUserData() {
  const queryClient = useQueryClient();

  return useCallback(
    (userId: string) => {
      // Prefetch user's commonly accessed data
      queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.userQuizzes(userId),
        queryFn: () => db.quizzes.getUserQuizzes(userId),
        staleTime: 3 * 60 * 1000,
      });

      queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.dashboardStats(userId),
        queryFn: () => db.analytics.getDashboardStats(userId),
        staleTime: 2 * 60 * 1000,
      });
    },
    [queryClient]
  );
}

// Invalidate all user-related data efficiently
export function useInvalidateUserData() {
  const queryClient = useQueryClient();

  return useCallback(
    (userId: string) => {
      // Group invalidations for better performance
      const invalidationPromises = [
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.userQuizzes(userId),
        }),
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.userExams(userId),
        }),
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.dashboardStats(userId),
        }),
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.recentActivity(userId),
        }),
      ];

      return Promise.all(invalidationPromises);
    },
    [queryClient]
  );
}
