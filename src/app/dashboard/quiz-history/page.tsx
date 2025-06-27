"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Trophy,
  Clock,
  Calendar,
  Target,
  BookOpen,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Play,
  Pause,
  CircleDot,
  AlertCircle,
  Trash2,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useCurrentUser,
  useDeleteQuiz,
  useInvalidateUserData,
  useUserQuizAttempts,
  usePrefetchCreatePages,
  usePrefetchQuizPages,
} from "@/hooks/useDatabase";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "react-hot-toast";

interface QuizAttempt {
  quiz_id: string;
  title: string;
  created_at: string;
  completed_at?: string | null;
  status: "completed" | "incomplete" | "not_attempted" | "empty";
  total_questions: number;
  answered_questions?: number;
  correct_answers: number;
  score_percentage: number;
  time_spent_minutes: number;
  topic_name?: string;
  completion_status: string;
}

export default function QuizHistoryPage() {
  const { user, loading } = useAuth();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const deleteQuizMutation = useDeleteQuiz();
  const invalidateUserData = useInvalidateUserData();
  const prefetchCreatePages = usePrefetchCreatePages();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { prefetchQuizTake, prefetchQuizReview } = usePrefetchQuizPages();

  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "score" | "title">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterBy, setFilterBy] = useState<
    "all" | "completed" | "incomplete" | "not_attempted" | "passed" | "failed"
  >("all");
  const [showFilters, setShowFilters] = useState(false);
  const [deletingQuizId, setDeletingQuizId] = useState<string | null>(null);

  // Use the database user_id
  const userId = currentUser?.user_id || "";

  // Redirect to landing page if not authenticated and not loading
  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [loading, user, router]);

  // Only invalidate data if it's stale or on explicit user action
  // Removed automatic invalidation on mount for better performance

  // OPTIMIZED: Use the new optimized hook instead of direct fetch
  const {
    data: quizAttempts,
    isLoading: loadingAttempts,
    error,
  } = useUserQuizAttempts(userId);

  // IMPROVED: More efficient loading logic - show cached data immediately if available
  const isAuthLoading =
    loading ||
    (loading === false && user && userLoading) ||
    (loading === false && user && !currentUser);

  // Only show loading if we have no data at all and we're actually loading
  const isDataLoading = userId && loadingAttempts && !quizAttempts;

  // Show loading screen only when absolutely necessary
  const showLoadingScreen = isAuthLoading || isDataLoading;

  // For safer data access with defaults - show cached data immediately
  const safeQuizAttempts = quizAttempts || [];

  // OPTIMIZED: Memoize the expensive calculations with better dependency array
  const { stats, filteredAttempts } = useMemo(() => {
    if (!safeQuizAttempts?.length) {
      return {
        stats: {
          totalQuizzes: 0,
          completedQuizzes: 0,
          incompleteQuizzes: 0,
          passedQuizzes: 0,
          averageScore: 0,
          averageTime: 0,
          passRate: 0,
        },
        filteredAttempts: [],
      };
    }

    // Calculate statistics in a single pass with simpler logic
    let totalQuizzes = 0;
    let completedQuizzes = 0;
    let incompleteQuizzes = 0;
    let totalScore = 0;
    let totalTime = 0;
    let passedQuizzes = 0;

    // Pre-filter for search to avoid repeated calculations
    const searchLower = searchTerm.toLowerCase();
    const searchFiltered = searchTerm
      ? safeQuizAttempts.filter(
          (attempt: QuizAttempt) =>
            attempt.title.toLowerCase().includes(searchLower) ||
            attempt.topic_name?.toLowerCase().includes(searchLower)
        )
      : safeQuizAttempts;

    for (const attempt of searchFiltered) {
      totalQuizzes++;

      if (attempt.status === "completed") {
        completedQuizzes++;
        totalScore += attempt.score_percentage;
        totalTime += attempt.time_spent_minutes;
        if (attempt.score_percentage >= 70) passedQuizzes++;
      } else if (attempt.status === "incomplete") {
        incompleteQuizzes++;
        totalScore += attempt.score_percentage;
      }
    }

    const stats = {
      totalQuizzes,
      completedQuizzes,
      incompleteQuizzes,
      passedQuizzes,
      averageScore:
        completedQuizzes + incompleteQuizzes > 0
          ? Math.round(totalScore / (completedQuizzes + incompleteQuizzes))
          : 0,
      averageTime:
        completedQuizzes > 0 ? Math.round(totalTime / completedQuizzes) : 0,
      passRate:
        completedQuizzes > 0
          ? Math.round((passedQuizzes / completedQuizzes) * 100)
          : 0,
    };

    // Simplified filtering and sorting
    const filteredAttempts = searchFiltered
      .filter((attempt: QuizAttempt) => {
        // Status filter
        if (filterBy === "all") return true;
        if (filterBy === attempt.status) return true;
        if (
          filterBy === "passed" &&
          attempt.status === "completed" &&
          attempt.score_percentage >= 70
        )
          return true;
        if (
          filterBy === "failed" &&
          attempt.status === "completed" &&
          attempt.score_percentage < 70
        )
          return true;

        return false;
      })
      .sort((a: QuizAttempt, b: QuizAttempt) => {
        let comparison = 0;

        switch (sortBy) {
          case "date":
            comparison =
              new Date(a.completed_at || a.created_at).getTime() -
              new Date(b.completed_at || b.created_at).getTime();
            break;
          case "score":
            comparison = a.score_percentage - b.score_percentage;
            break;
          case "title":
            comparison = a.title.localeCompare(b.title);
            break;
        }

        return sortOrder === "asc" ? comparison : -comparison;
      });

    return { stats, filteredAttempts };
  }, [safeQuizAttempts, searchTerm, filterBy, sortBy, sortOrder]); // Optimized dependencies

  // OPTIMIZED: Combined color utility functions with memoization
  const getScoreColors = useMemo(() => {
    return (score: number) => {
      if (score >= 90)
        return {
          text: "text-emerald-400",
          badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
        };
      if (score >= 80)
        return {
          text: "text-green-400",
          badge: "bg-green-500/20 text-green-400 border-green-500/30",
        };
      if (score >= 70)
        return {
          text: "text-yellow-400",
          badge: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
        };
      if (score >= 60)
        return {
          text: "text-orange-400",
          badge: "bg-orange-500/20 text-orange-400 border-orange-500/30",
        };
      return {
        text: "text-red-400",
        badge: "bg-red-500/20 text-red-400 border-red-500/30",
      };
    };
  }, []);

  const formatDate = useMemo(() => {
    return (dateString: string | null | undefined) => {
      if (!dateString) return "Not completed";
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };
  }, []);

  const getStatusBadge = useMemo(() => {
    return (status: string) => {
      switch (status) {
        case "completed":
          return "bg-green-500/20 text-green-400 border-green-500/30";
        case "incomplete":
          return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
        case "not_attempted":
          return "bg-blue-500/20 text-blue-400 border-blue-500/30";
        case "empty":
          return "bg-gray-500/20 text-gray-400 border-gray-500/30";
        default:
          return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      }
    };
  }, []);

  const getStatusIcon = useMemo(() => {
    return (status: string) => {
      switch (status) {
        case "completed":
          return <CheckCircle className="h-4 w-4 text-green-400" />;
        case "incomplete":
          return <Pause className="h-4 w-4 text-yellow-400" />;
        case "not_attempted":
          return <CircleDot className="h-4 w-4 text-blue-400" />;
        case "empty":
          return <AlertCircle className="h-4 w-4 text-gray-400" />;
        default:
          return <CircleDot className="h-4 w-4 text-gray-400" />;
      }
    };
  }, []);

  const handleDeleteQuiz = useCallback(
    async (quizId: string, title: string) => {
      if (
        !window.confirm(
          `Are you sure you want to delete "${title}"? This action cannot be undone.`
        )
      ) {
        return;
      }

      setDeletingQuizId(quizId);
      try {
        const result = await deleteQuizMutation.mutateAsync(quizId);
        if (result.success) {
          toast.success("Quiz deleted successfully!");

          // Optimistically update the cache by removing the deleted quiz immediately
          queryClient.setQueryData(
            ["quiz-attempts", userId],
            (oldData: QuizAttempt[] | undefined) => {
              if (!oldData) return [];
              return oldData.filter((attempt) => attempt.quiz_id !== quizId);
            }
          );

          // Also invalidate the query to ensure consistency with server
          await queryClient.invalidateQueries({
            queryKey: ["quiz-attempts", userId],
          });

          // Also invalidate general user data for dashboard consistency
          if (userId) {
            invalidateUserData(userId);
          }
        } else {
          toast.error("Failed to delete quiz");
        }
      } catch (error) {
        console.error("Delete quiz error:", error);
        toast.error("Failed to delete quiz");

        // On error, invalidate to ensure cache is consistent with server state
        await queryClient.invalidateQueries({
          queryKey: ["quiz-attempts", userId],
        });
      } finally {
        setDeletingQuizId(null);
      }
    },
    [deleteQuizMutation, userId, invalidateUserData, queryClient]
  );

  const getActionButton = useCallback(
    (attempt: QuizAttempt) => {
      const isDeleting = deletingQuizId === attempt.quiz_id;

      switch (attempt.status) {
        case "completed":
          return (
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <Link
                href={`/quiz/review/${attempt.quiz_id}`}
                className="w-full sm:w-auto"
                onMouseEnter={() =>
                  prefetchQuizReview(
                    attempt.quiz_id,
                    currentUser?.user_id || ""
                  )
                }
              >
                <Button
                  size="sm"
                  className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-500/30 w-full sm:w-auto"
                >
                  <BookOpen className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Review</span>
                  <span className="sm:hidden">Review</span>
                </Button>
              </Link>
              <Link
                href={`/quiz/take/${attempt.quiz_id}`}
                className="w-full sm:w-auto"
                onMouseEnter={() => prefetchQuizTake(attempt.quiz_id)}
              >
                <Button
                  size="sm"
                  className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/30 w-full sm:w-auto"
                >
                  <Play className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Retake</span>
                  <span className="sm:hidden">Retake</span>
                </Button>
              </Link>
              <Button
                size="sm"
                onClick={() => handleDeleteQuiz(attempt.quiz_id, attempt.title)}
                disabled={isDeleting}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30 disabled:opacity-50 w-full sm:w-auto"
              >
                {isDeleting ? (
                  <div className="h-3 w-3 mr-1 animate-spin rounded-full border border-red-400 border-t-transparent" />
                ) : (
                  <Trash2 className="h-3 w-3 mr-1" />
                )}
                <span className="hidden sm:inline">
                  {isDeleting ? "Deleting..." : "Delete"}
                </span>
                <span className="sm:hidden">
                  {isDeleting ? "..." : "Delete"}
                </span>
              </Button>
            </div>
          );
        case "incomplete":
          return (
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <Link
                href={`/quiz/take/${attempt.quiz_id}`}
                className="w-full sm:w-auto"
                onMouseEnter={() => prefetchQuizTake(attempt.quiz_id)}
              >
                <Button
                  size="sm"
                  className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border-yellow-500/30 w-full sm:w-auto"
                >
                  <Play className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Continue Quiz</span>
                  <span className="sm:hidden">Continue</span>
                </Button>
              </Link>
              <Button
                size="sm"
                onClick={() => handleDeleteQuiz(attempt.quiz_id, attempt.title)}
                disabled={isDeleting}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30 disabled:opacity-50 w-full sm:w-auto"
              >
                {isDeleting ? (
                  <div className="h-3 w-3 mr-1 animate-spin rounded-full border border-red-400 border-t-transparent" />
                ) : (
                  <Trash2 className="h-3 w-3 mr-1" />
                )}
                <span className="hidden sm:inline">
                  {isDeleting ? "Deleting..." : "Delete"}
                </span>
                <span className="sm:hidden">
                  {isDeleting ? "..." : "Delete"}
                </span>
              </Button>
            </div>
          );
        case "not_attempted":
          return (
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 w-full sm:w-auto">
              <Link
                href={`/quiz/take/${attempt.quiz_id}`}
                className="w-full sm:w-auto"
                onMouseEnter={() => prefetchQuizTake(attempt.quiz_id)}
              >
                <Button
                  size="sm"
                  className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-500/30 w-full sm:w-auto"
                >
                  <Play className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Start Quiz</span>
                  <span className="sm:hidden">Start</span>
                </Button>
              </Link>
              <Button
                size="sm"
                onClick={() => handleDeleteQuiz(attempt.quiz_id, attempt.title)}
                disabled={isDeleting}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30 disabled:opacity-50 w-full sm:w-auto"
              >
                {isDeleting ? (
                  <div className="h-3 w-3 mr-1 animate-spin rounded-full border border-red-400 border-t-transparent" />
                ) : (
                  <Trash2 className="h-3 w-3 mr-1" />
                )}
                <span className="hidden sm:inline">
                  {isDeleting ? "Deleting..." : "Delete"}
                </span>
                <span className="sm:hidden">
                  {isDeleting ? "..." : "Delete"}
                </span>
              </Button>
            </div>
          );
        case "empty":
          return (
            <div className="flex space-x-2">
              <Button
                size="sm"
                disabled
                className="bg-gray-500/20 text-gray-400 border-gray-500/30 cursor-not-allowed"
              >
                No Questions
              </Button>
              <Button
                size="sm"
                onClick={() => handleDeleteQuiz(attempt.quiz_id, attempt.title)}
                disabled={isDeleting}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border-red-500/30 disabled:opacity-50"
              >
                {isDeleting ? (
                  <div className="h-3 w-3 mr-1 animate-spin rounded-full border border-red-400 border-t-transparent" />
                ) : (
                  <Trash2 className="h-3 w-3 mr-1" />
                )}
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          );
        default:
          return null;
      }
    },
    [
      deletingQuizId,
      handleDeleteQuiz,
      currentUser?.user_id,
      prefetchQuizReview,
      prefetchQuizTake,
    ]
  );

  // Prefetch create quiz data when hovering over create link
  const handleCreateQuizHover = useCallback(() => {
    prefetchCreatePages().catch((err) =>
      console.warn("Create quiz prefetch failed:", err)
    );
  }, [prefetchCreatePages]);

  // Single loading screen for all loading states - matching dashboard pattern
  if (showLoadingScreen) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/50">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-purple-600/30 rounded-2xl blur-xl"></div>
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
              Loading Quiz History...
            </h2>
            <p className="text-gray-400">
              Preparing your quiz performance data
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-20">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-gray-700/50 px-2 sm:px-3"
              >
                <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Back to Dashboard</span>
                <span className="sm:hidden">Back</span>
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Quiz History
              </h1>
              <p className="text-gray-400 mt-1 text-sm sm:text-base">
                Track your quiz performance over time
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <Card className="bg-gray-800/70 backdrop-blur-sm border-gray-700/50 p-4 sm:p-6">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide">
                  Total Quizzes
                </p>
                <p className="text-xl sm:text-2xl font-bold text-white">
                  {stats.totalQuizzes}
                </p>
                <p className="text-xs text-gray-500">
                  {stats.completedQuizzes} completed
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-gray-800/70 backdrop-blur-sm border-gray-700/50 p-4 sm:p-6">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Trophy className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide">
                  Average Score
                </p>
                <p
                  className={`text-xl sm:text-2xl font-bold ${getScoreColors(stats.averageScore).text}`}
                >
                  {stats.completedQuizzes + stats.incompleteQuizzes > 0
                    ? stats.averageScore.toFixed(1)
                    : "--"}
                  %
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-gray-800/70 backdrop-blur-sm border-gray-700/50 p-4 sm:p-6">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide">
                  Pass Rate
                </p>
                <p
                  className={`text-xl sm:text-2xl font-bold ${getScoreColors(stats.passRate).text}`}
                >
                  {stats.completedQuizzes > 0
                    ? stats.passRate.toFixed(1)
                    : "--"}
                  %
                </p>
                <p className="text-xs text-gray-500">
                  {stats.passedQuizzes}/{stats.completedQuizzes} passed
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-gray-800/70 backdrop-blur-sm border-gray-700/50 p-4 sm:p-6">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wide">
                  Avg Time
                </p>
                <p className="text-xl sm:text-2xl font-bold text-white">
                  {stats.completedQuizzes > 0
                    ? stats.averageTime.toFixed(1)
                    : "--"}
                  <span className="text-sm sm:text-base font-normal text-gray-400 ml-1">
                    min
                  </span>
                </p>
                <p className="text-xs text-gray-500">Per completed quiz</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex-1 w-full sm:max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search quizzes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3 w-full sm:w-auto">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="text-gray-300 hover:text-white hover:bg-gray-700/50 w-full sm:w-auto justify-center sm:justify-start"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {showFilters ? (
                  <ChevronUp className="h-4 w-4 ml-2" />
                ) : (
                  <ChevronDown className="h-4 w-4 ml-2" />
                )}
              </Button>
            </div>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-700/50"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(e.target.value as "date" | "score" | "title")
                    }
                    className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white text-sm sm:text-base"
                  >
                    <option value="date">Date</option>
                    <option value="score">Score</option>
                    <option value="title">Title</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Order
                  </label>
                  <select
                    value={sortOrder}
                    onChange={(e) =>
                      setSortOrder(e.target.value as "asc" | "desc")
                    }
                    className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white text-sm sm:text-base"
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>

                <div className="sm:col-span-2 lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Filter
                  </label>
                  <select
                    value={filterBy}
                    onChange={(e) =>
                      setFilterBy(
                        e.target.value as
                          | "all"
                          | "completed"
                          | "incomplete"
                          | "not_attempted"
                          | "passed"
                          | "failed"
                      )
                    }
                    className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white text-sm sm:text-base"
                  >
                    <option value="all">All Quizzes</option>
                    <option value="completed">Completed</option>
                    <option value="incomplete">Incomplete</option>
                    <option value="not_attempted">Not Attempted</option>
                    <option value="passed">Passed (≥70%)</option>
                    <option value="failed">Failed (&lt;70%)</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Quiz Attempts List */}
        <div className="space-y-4">
          {filteredAttempts?.length === 0 ? (
            <Card className="bg-gray-800/70 backdrop-blur-sm border-gray-700/50 p-8">
              <div className="text-center space-y-4">
                <div className="h-16 w-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto">
                  <BookOpen className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">
                  {stats.totalQuizzes === 0
                    ? "No Quizzes Created Yet"
                    : searchTerm || filterBy !== "all"
                      ? "No Quizzes Match Your Filters"
                      : "No Quiz Activity Yet"}
                </h3>
                <p className="text-gray-400">
                  {stats.totalQuizzes === 0
                    ? "Create your first quiz to start your learning journey!"
                    : searchTerm || filterBy !== "all"
                      ? "Try adjusting your search or filter criteria."
                      : "You have created quizzes but haven't taken any yet. Start with your first quiz!"}
                </p>
                <div className="flex gap-3 justify-center">
                  <Link
                    href="/quiz/create"
                    onMouseEnter={handleCreateQuizHover}
                  >
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
                      Create New Quiz
                    </Button>
                  </Link>
                  {stats.totalQuizzes > 0 && (
                    <Link href="/dashboard">
                      <Button
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700/50"
                      >
                        View Dashboard
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredAttempts?.map((attempt: QuizAttempt) => (
                <div
                  key={`${attempt.quiz_id}-${attempt.completed_at}`}
                  className="w-full"
                >
                  <Card className="bg-gray-800/70 backdrop-blur-sm border-gray-700/50 p-4 sm:p-6 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3">
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2 sm:mb-0">
                            <h3 className="text-lg sm:text-xl font-semibold text-white truncate">
                              {attempt.title}
                            </h3>

                            {/* Status Badge */}
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(attempt.status)} w-fit`}
                            >
                              {getStatusIcon(attempt.status)}
                              <span className="ml-1.5 capitalize">
                                {attempt.status.replace("_", " ")}
                              </span>
                            </span>
                          </div>

                          {/* Score Badge (only for completed quizzes) - Mobile friendly */}
                          {attempt.status === "completed" && (
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getScoreColors(attempt.score_percentage).badge} w-fit`}
                            >
                              {attempt.score_percentage >= 70 ? (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              ) : (
                                <XCircle className="h-3 w-3 mr-1" />
                              )}
                              {attempt.score_percentage.toFixed(1)}%
                            </span>
                          )}
                        </div>

                        {attempt.topic_name && (
                          <p className="text-sm text-blue-400 mb-2">
                            📚 {attempt.topic_name}
                          </p>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center space-x-2 text-gray-400">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {attempt.completed_at
                                ? formatDate(attempt.completed_at)
                                : `Created ${formatDate(attempt.created_at)}`}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-400">
                            <Target className="h-4 w-4" />
                            <span>
                              {attempt.status === "incomplete" &&
                              attempt.answered_questions
                                ? `${attempt.answered_questions}/${attempt.total_questions} answered`
                                : `${attempt.correct_answers}/${attempt.total_questions} correct`}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-400">
                            <Clock className="h-4 w-4" />
                            <span>
                              {attempt.time_spent_minutes > 0
                                ? `${attempt.time_spent_minutes.toFixed(1)} minutes`
                                : "Not started"}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-gray-400">
                            <BarChart3 className="h-4 w-4" />
                            <span>{attempt.completion_status}</span>
                          </div>
                        </div>
                      </div>

                      <div className="ml-6 text-right space-y-2">
                        {/* Score Display */}
                        {attempt.status === "completed" ? (
                          <>
                            <div
                              className={`text-3xl font-bold ${getScoreColors(attempt.score_percentage).text}`}
                            >
                              {attempt.score_percentage.toFixed(0)}%
                            </div>
                            {attempt.score_percentage >= 70 ? (
                              <div className="flex items-center text-emerald-400 text-sm">
                                <TrendingUp className="h-4 w-4 mr-1" />
                                <span>Passed</span>
                              </div>
                            ) : (
                              <div className="flex items-center text-red-400 text-sm">
                                <TrendingDown className="h-4 w-4 mr-1" />
                                <span>Failed</span>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-2xl font-bold text-gray-400">
                            {attempt.status === "incomplete"
                              ? `${Math.round(((attempt.answered_questions || 0) / attempt.total_questions) * 100)}%`
                              : "--"}
                          </div>
                        )}

                        {/* Action Button */}
                        <div className="mt-3">{getActionButton(attempt)}</div>
                      </div>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
