"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { useQuery } from "@tanstack/react-query";
import {
  useCurrentUser,
  useDeleteQuiz,
  useInvalidateUserData,
} from "@/hooks/useDatabase";
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
  const { data: currentUser } = useCurrentUser();
  const deleteQuizMutation = useDeleteQuiz();
  const invalidateUserData = useInvalidateUserData();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "score" | "title">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [filterBy, setFilterBy] = useState<
    "all" | "completed" | "incomplete" | "not_attempted" | "passed" | "failed"
  >("all");
  const [showFilters, setShowFilters] = useState(false);
  const [deletingQuizId, setDeletingQuizId] = useState<string | null>(null);

  // OPTIMIZED: Fetch user's quiz attempts with cleaner error handling
  const { data: quizAttempts, isLoading: loadingAttempts } = useQuery({
    queryKey: ["quiz-attempts", currentUser?.user_id],
    queryFn: async () => {
      if (!currentUser?.user_id) {
        return [];
      }

      const response = await fetch(
        `/api/quiz/user-attempts/${currentUser.user_id}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch quiz attempts");
      }

      return response.json();
    },
    enabled: !!currentUser?.user_id,
    staleTime: 2 * 60 * 1000, // 2 minutes cache
    refetchOnWindowFocus: false,
  });

  // OPTIMIZED: Memoized statistics and filtering calculations
  const { stats, filteredAttempts } = useMemo(() => {
    if (!quizAttempts) {
      return {
        stats: {
          totalQuizzes: 0,
          completedQuizzes: 0,
          incompleteQuizzes: 0,
          totalScore: 0,
          totalScoreIncludingIncomplete: 0,
          totalTime: 0,
          passedQuizzes: 0,
          totalQuestions: 0,
          correctAnswers: 0,
          averageScore: 0,
          averageTime: 0,
          passRate: 0,
        },
        filteredAttempts: [],
      };
    }

    // Calculate statistics in a single pass
    const stats = quizAttempts.reduce(
      (
        acc: {
          totalQuizzes: number;
          completedQuizzes: number;
          incompleteQuizzes: number;
          totalScore: number;
          totalScoreIncludingIncomplete: number;
          totalTime: number;
          passedQuizzes: number;
          totalQuestions: number;
          correctAnswers: number;
          averageScore: number;
          averageTime: number;
          passRate: number;
        },
        attempt: QuizAttempt
      ) => {
        acc.totalQuizzes++;

        if (attempt.status === "completed") {
          acc.completedQuizzes++;
          acc.totalScore += attempt.score_percentage;
          acc.totalScoreIncludingIncomplete += attempt.score_percentage;
          acc.totalTime += attempt.time_spent_minutes;
          if (attempt.score_percentage >= 70) acc.passedQuizzes++;
          acc.totalQuestions += attempt.total_questions;
          acc.correctAnswers += attempt.correct_answers;
        }

        if (attempt.status === "incomplete") {
          acc.incompleteQuizzes++;
          acc.totalScoreIncludingIncomplete += attempt.score_percentage;
          acc.totalQuestions += attempt.total_questions;
          acc.correctAnswers += attempt.correct_answers;
        }

        return acc;
      },
      {
        totalQuizzes: 0,
        completedQuizzes: 0,
        incompleteQuizzes: 0,
        totalScore: 0,
        totalScoreIncludingIncomplete: 0,
        totalTime: 0,
        passedQuizzes: 0,
        totalQuestions: 0,
        correctAnswers: 0,
        averageScore: 0,
        averageTime: 0,
        passRate: 0,
      }
    );

    // Calculate derived statistics
    stats.averageScore =
      stats.completedQuizzes + stats.incompleteQuizzes > 0
        ? stats.totalScoreIncludingIncomplete /
          (stats.completedQuizzes + stats.incompleteQuizzes)
        : 0;

    stats.averageTime =
      stats.completedQuizzes > 0 ? stats.totalTime / stats.completedQuizzes : 0;

    stats.passRate =
      stats.completedQuizzes > 0
        ? (stats.passedQuizzes / stats.completedQuizzes) * 100
        : 0;

    // Filter and sort in a single operation
    const searchLower = searchTerm.toLowerCase();
    const filteredAttempts = quizAttempts
      .filter((attempt: QuizAttempt) => {
        const matchesSearch =
          attempt.title.toLowerCase().includes(searchLower) ||
          attempt.topic_name?.toLowerCase().includes(searchLower);

        const matchesFilter =
          filterBy === "all" ||
          (filterBy === "completed" && attempt.status === "completed") ||
          (filterBy === "incomplete" && attempt.status === "incomplete") ||
          (filterBy === "not_attempted" &&
            attempt.status === "not_attempted") ||
          (filterBy === "passed" &&
            attempt.status === "completed" &&
            attempt.score_percentage >= 70) ||
          (filterBy === "failed" &&
            attempt.status === "completed" &&
            attempt.score_percentage < 70);

        return matchesSearch && matchesFilter;
      })
      .sort((a: QuizAttempt, b: QuizAttempt) => {
        let comparison = 0;

        switch (sortBy) {
          case "date":
            const dateA = new Date(a.completed_at || a.created_at).getTime();
            const dateB = new Date(b.completed_at || b.created_at).getTime();
            comparison = dateA - dateB;
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
  }, [quizAttempts, searchTerm, filterBy, sortBy, sortOrder]);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Not completed";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-400";
    if (score >= 80) return "text-green-400";
    if (score >= 70) return "text-yellow-400";
    if (score >= 60) return "text-orange-400";
    return "text-red-400";
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90)
      return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    if (score >= 80)
      return "bg-green-500/20 text-green-400 border-green-500/30";
    if (score >= 70)
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    if (score >= 60)
      return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    return "bg-red-500/20 text-red-400 border-red-500/30";
  };

  const getStatusBadge = (status: string) => {
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

  const getStatusIcon = (status: string) => {
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

  const handleDeleteQuiz = async (quizId: string, title: string) => {
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
        // Invalidate all user data to refresh the dashboard
        if (currentUser?.user_id) {
          invalidateUserData(currentUser.user_id);
        }
      } else {
        toast.error("Failed to delete quiz");
      }
    } catch (error) {
      console.error("Delete quiz error:", error);
      toast.error("Failed to delete quiz");
    } finally {
      setDeletingQuizId(null);
    }
  };

  const getActionButton = (attempt: QuizAttempt) => {
    const isDeleting = deletingQuizId === attempt.quiz_id;

    switch (attempt.status) {
      case "completed":
        return (
          <div className="flex space-x-2">
            <Link href={`/quiz/review/${attempt.quiz_id}`}>
              <Button
                size="sm"
                className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-500/30"
              >
                <BookOpen className="h-3 w-3 mr-1" />
                Review
              </Button>
            </Link>
            <Link href={`/quiz/take/${attempt.quiz_id}`}>
              <Button
                size="sm"
                className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/30"
              >
                <Play className="h-3 w-3 mr-1" />
                Retake
              </Button>
            </Link>
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
      case "incomplete":
        return (
          <div className="flex space-x-2">
            <Link href={`/quiz/take/${attempt.quiz_id}`}>
              <Button
                size="sm"
                className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border-yellow-500/30"
              >
                <Play className="h-3 w-3 mr-1" />
                Continue Quiz
              </Button>
            </Link>
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
      case "not_attempted":
        return (
          <div className="flex space-x-2">
            <Link href={`/quiz/take/${attempt.quiz_id}`}>
              <Button
                size="sm"
                className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border-blue-500/30"
              >
                <Play className="h-3 w-3 mr-1" />
                Start Quiz
              </Button>
            </Link>
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
  };

  if (loadingAttempts) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-purple-600/30 rounded-full blur-xl"></div>
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Loading Quiz History
            </h2>
            <p className="text-gray-400">Fetching your quiz attempts...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 p-20 ">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white hover:bg-gray-700/50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Quiz History
              </h1>
              <p className="text-gray-400 mt-1">
                Track your quiz performance over time
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <Card className="bg-gray-800/70 backdrop-blur-sm border-gray-700/50 p-6">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400 uppercase tracking-wide">
                  Total Quizzes
                </p>
                <p className="text-2xl font-bold text-white">
                  {stats.totalQuizzes}
                </p>
                <p className="text-xs text-gray-500">
                  {stats.completedQuizzes} completed
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-gray-800/70 backdrop-blur-sm border-gray-700/50 p-6">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400 uppercase tracking-wide">
                  Average Score
                </p>
                <p
                  className={`text-2xl font-bold ${getScoreColor(stats.averageScore)}`}
                >
                  {stats.completedQuizzes + stats.incompleteQuizzes > 0
                    ? stats.averageScore.toFixed(1)
                    : "--"}
                  %
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-gray-800/70 backdrop-blur-sm border-gray-700/50 p-6">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400 uppercase tracking-wide">
                  Pass Rate
                </p>
                <p
                  className={`text-2xl font-bold ${getScoreColor(stats.passRate)}`}
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

          <Card className="bg-gray-800/70 backdrop-blur-sm border-gray-700/50 p-6">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-400 uppercase tracking-wide">
                  Avg Time
                </p>
                <p className="text-2xl font-bold text-white">
                  {stats.completedQuizzes > 0
                    ? stats.averageTime.toFixed(1)
                    : "--"}
                  m
                </p>
                <p className="text-xs text-gray-500">Per completed quiz</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex-1 max-w-md">
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

            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="text-gray-300 hover:text-white hover:bg-gray-700/50"
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) =>
                      setSortBy(e.target.value as "date" | "score" | "title")
                    }
                    className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white"
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
                    className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>

                <div>
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
                    className="w-full bg-gray-700/50 border border-gray-600/50 rounded-lg px-3 py-2 text-white"
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
                  <Link href="/quiz/create">
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
              {filteredAttempts?.map((attempt: QuizAttempt, index: number) => (
                <motion.div
                  key={`${attempt.quiz_id}-${attempt.completed_at}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-gray-800/70 backdrop-blur-sm border-gray-700/50 p-6 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-white">
                            {attempt.title}
                          </h3>

                          {/* Status Badge */}
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(attempt.status)}`}
                          >
                            {getStatusIcon(attempt.status)}
                            <span className="ml-1.5 capitalize">
                              {attempt.status.replace("_", " ")}
                            </span>
                          </span>

                          {/* Score Badge (only for completed quizzes) */}
                          {attempt.status === "completed" && (
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium border ${getScoreBadgeColor(attempt.score_percentage)}`}
                            >
                              {attempt.score_percentage >= 70 ? (
                                <CheckCircle className="h-3 w-3 inline mr-1" />
                              ) : (
                                <XCircle className="h-3 w-3 inline mr-1" />
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
                              className={`text-3xl font-bold ${getScoreColor(attempt.score_percentage)}`}
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
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
