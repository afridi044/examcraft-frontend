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
  topics: ["topics"] as const,
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
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
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
    queryKey: QUERY_KEYS.topics,
    queryFn: () => db.topics.getAllTopics(),
    select: (response) => response.data || [],
    staleTime: 10 * 60 * 1000, // 10 minutes
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
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.topics });
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
    staleTime: 5 * 60 * 1000, // 5 minutes
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
  });
}

export function useQuizWithQuestions(quizId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.quizWithQuestions(quizId),
    queryFn: () => db.quizzes.getQuizWithQuestions(quizId),
    select: (response) => response.data,
    enabled: !!quizId,
  });
}

export function useCreateQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateQuizInput) => db.quizzes.createQuiz(data),
    onSuccess: (response, variables) => {
      if (response.success) {
        // Invalidate user quizzes
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.userQuizzes(variables.user_id),
        });
        // Invalidate dashboard stats to reflect new quiz count
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.dashboardStats(variables.user_id),
        });
        // Invalidate recent activity to show quiz creation
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.recentActivity(variables.user_id),
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
    onSuccess: (response) => {
      if (response.success) {
        // Invalidate all quiz-related queries
        queryClient.invalidateQueries({ queryKey: ["quizzes"] });
        queryClient.invalidateQueries({ queryKey: ["quiz-attempts"] });
        // Invalidate dashboard stats and activity for all users (we don't have userId here)
        queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey[0] === "dashboardStats" ||
            query.queryKey[0] === "recentActivity" ||
            query.queryKey[0] === "topicProgress",
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
    staleTime: 30 * 1000, // 30 seconds - shorter stale time for more frequent updates
    refetchOnWindowFocus: true, // Refetch when window gains focus (when navigating back)
    refetchOnMount: true, // Always refetch on mount
    // FIXED: Return loading state when userId is not available
    placeholderData: undefined, // Don't use placeholder data to maintain proper loading state
  });
}

export function useFlashcardsDue(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.flashcardsDue(userId),
    queryFn: () => db.flashcards.getFlashcardsDueForReview(userId),
    select: (response) => response.data || [],
    enabled: !!userId,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

export function useCreateFlashcard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFlashcardInput) =>
      db.flashcards.createFlashcard(data),
    onSuccess: (response, variables) => {
      if (response.success) {
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.userFlashcards(variables.user_id),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.flashcardsDue(variables.user_id),
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
    onSuccess: (response) => {
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ["flashcards"] });
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
        queryClient.invalidateQueries({ queryKey: ["flashcards"] });
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
        // Invalidate relevant queries
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.userAnswers(variables.user_id),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.dashboardStats(variables.user_id),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.recentActivity(variables.user_id),
        });
        queryClient.invalidateQueries({
          queryKey: QUERY_KEYS.topicProgress(variables.user_id),
        });
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
// Analytics Hooks
// =============================================

export function useDashboardStats(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.dashboardStats(userId),
    queryFn: () => db.analytics.getDashboardStats(userId),
    select: (response) => response.data,
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes - longer stale time for dashboard stats
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false, // Disable to reduce unnecessary requests
    refetchOnMount: false, // Only refetch when data is stale
    retry: 1, // Reduce retries for faster failure handling
    refetchInterval: false, // No automatic refetching
  });
}

export function useRecentActivity(userId: string, limit: number = 10) {
  return useQuery({
    queryKey: QUERY_KEYS.recentActivity(userId),
    queryFn: () => db.analytics.getRecentActivity(userId, limit),
    select: (response) => response.data || [],
    enabled: !!userId,
    staleTime: 3 * 60 * 1000, // 3 minutes - longer stale time for activity
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false, // Disable to reduce unnecessary requests
    refetchOnMount: false, // Only refetch when data is stale
    retry: 1, // Reduce retries for faster failure handling
    refetchInterval: false, // No automatic refetching
  });
}

export function useTopicProgress(userId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.topicProgress(userId),
    queryFn: () => db.analytics.getTopicProgress(userId),
    select: (response) => response.data || [],
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnWindowFocus: false, // Disable to reduce unnecessary requests
    refetchOnMount: false, // Only refetch when data is stale
    retry: 1, // Reduce retries for faster failure handling
    refetchInterval: false, // No automatic refetching
  });
}

// =============================================
// Compound Hooks (Multiple Operations)
// =============================================

export function useDashboardData(userId: string) {
  // Always call hooks in the same order
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

    return {
      stats,
      recentActivity,
      topicProgress,
      isLoading:
        stats.isLoading || recentActivity.isLoading || topicProgress.isLoading,
      isError: stats.isError || recentActivity.isError || topicProgress.isError,
      error: stats.error || recentActivity.error || topicProgress.error,
    };
  }, [userId, stats, recentActivity, topicProgress, emptyState]);
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

  return (userId: string) => {
    // Invalidate all user-related queries
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
    (userId: string) => {
      // Prefetch commonly used data
      queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.dashboardStats(userId),
        queryFn: () => db.analytics.getDashboardStats(userId),
        staleTime: 2 * 60 * 1000,
      });

      queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.userQuizzes(userId),
        queryFn: () => db.quizzes.getUserQuizzes(userId),
        staleTime: 5 * 60 * 1000,
      });

      queryClient.prefetchQuery({
        queryKey: QUERY_KEYS.topics,
        queryFn: () => db.topics.getAllTopics(),
        staleTime: 10 * 60 * 1000,
      });
    },
    [queryClient]
  );
}
