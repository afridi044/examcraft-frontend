"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  useCurrentUser,
  useOptimizedDashboard,
  usePrefetchQuizPages,
} from "@/hooks/useDatabase";
import {
  BookOpen,
  Loader2,
  TrendingUp,
  Clock,
  Brain,
  Target,
  Calendar,
  BarChart3,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import type { RecentActivity, TopicProgress } from "@/types/database";

// Move StatValue outside component to prevent re-creation
const StatValue = ({
  value,
  suffix = "",
}: {
  value: number;
  suffix?: string;
}) => (
  <p className="text-xl sm:text-2xl font-bold text-white">
    {value.toLocaleString()}
    {suffix}
  </p>
);

// Default stats object - moved outside to prevent re-creation
const DEFAULT_STATS = {
  totalQuizzes: 0,
  totalExams: 0,
  totalFlashcards: 0,
  averageScore: 0,
  studyStreak: 0,
  questionsAnswered: 0,
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { prefetchQuizHistory } = usePrefetchQuizPages();

  // State for view all functionality
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [showAllProgress, setShowAllProgress] = useState(false);

  // Get current user profile data for proper database user ID
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();

  // OPTIMIZED: Memoize userId to prevent unnecessary re-renders
  const userId = useMemo(
    () => currentUser?.user_id || "",
    [currentUser?.user_id]
  );

  // OPTIMIZED: Use the new batched dashboard hook for best performance with improved settings
  const dashboardData = useOptimizedDashboard(userId);

  // Memoize extracted data to prevent unnecessary re-renders
  const { stats, recentActivity, topicProgress } = useMemo(
    () => ({
      stats: dashboardData.data?.stats,
      recentActivity: dashboardData.data?.recentActivity || [],
      topicProgress: dashboardData.data?.topicProgress || [],
    }),
    [dashboardData.data]
  );

  // Memoize loading states to prevent unnecessary recalculations
  const showLoadingScreen = useMemo(() => {
    const authLoading =
      loading ||
      (loading === false && user && userLoading) ||
      (loading === false && user && !currentUser);
    const dataLoading =
      userId && dashboardData.isLoading && !dashboardData.data;

    return authLoading || dataLoading;
  }, [
    loading,
    user,
    userLoading,
    currentUser,
    userId,
    dashboardData.isLoading,
    dashboardData.data,
  ]);

  // Memoize safe data to prevent object re-creation
  const safeStats = useMemo(() => stats || DEFAULT_STATS, [stats]);
  const safeRecentActivity = useMemo(() => recentActivity, [recentActivity]);
  const safeTopicProgress = useMemo(() => topicProgress, [topicProgress]);

  // Memoize utility functions
  const formatDate = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, []);

  const getActivityIcon = useCallback((type: string) => {
    switch (type) {
      case "quiz":
        return <BookOpen className="h-4 w-4" />;
      case "exam":
        return <Target className="h-4 w-4" />;
      case "flashcard":
        return <Brain className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  }, []);

  // Prefetch quiz history data when hovering over the link
  const handleQuizHistoryHover = useCallback(() => {
    if (currentUser?.user_id) {
      // Prefetch quiz history data for faster navigation
      prefetchQuizHistory(currentUser.user_id);
    }
  }, [prefetchQuizHistory, currentUser?.user_id]);

  // FIXED: Optimize redirect logic with proper memoization
  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [loading, user]); // Removed router from dependencies to prevent unnecessary re-runs

  // Single loading screen for all loading states
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
              Loading Dashboard...
            </h2>
            <p className="text-gray-400">Preparing your learning experience</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 sm:space-y-8 mt-4 sm:mt-8 p-4 sm:p-6 lg:p-10">
        {/* Welcome Header - Mobile Optimized */}
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
            Welcome back!
          </h1>
          <p className="text-gray-400 text-sm sm:text-base">
            Here&apos;s your learning progress overview
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Total Quizzes Card */}
          <div className="group relative bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700/50 hover:border-blue-500/30 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10">
            <Link
              href="/dashboard/quiz-history"
              className="absolute inset-0 rounded-xl"
              aria-label="View Quiz History"
              onMouseEnter={handleQuizHistoryHover}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wide">
                    Total Quizzes
                  </p>
                  <StatValue value={safeStats.totalQuizzes} />
                </div>
              </div>
              <div className="flex items-center space-x-1 text-xs">
                <TrendingUp className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400 font-medium hidden sm:inline">
                  +12%
                </span>
              </div>
            </div>
          </div>

          {/* Total Exams Card */}
          <div className="group relative bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700/50 hover:border-green-500/30 transition-all duration-200 hover:shadow-lg hover:shadow-green-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/20">
                  <Target className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wide">
                    Total Exams
                  </p>
                  <StatValue value={safeStats.totalExams} />
                </div>
              </div>
              <div className="flex items-center space-x-1 text-xs">
                <TrendingUp className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400 font-medium hidden sm:inline">
                  +8%
                </span>
              </div>
            </div>
          </div>

          {/* Flashcards Card */}
          <div className="group relative bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700/50 hover:border-purple-500/30 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/10">
            <Link
              href="/flashcards"
              className="absolute inset-0 rounded-xl"
              aria-label="View Flashcards"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <Brain className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wide">
                    Flashcards
                  </p>
                  <StatValue value={safeStats.totalFlashcards} />
                </div>
              </div>
              <div className="flex items-center space-x-1 text-xs">
                <TrendingUp className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400 font-medium hidden sm:inline">
                  +15%
                </span>
              </div>
            </div>
          </div>

          {/* Overall Score Card */}
          <div className="group relative bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700/50 hover:border-amber-500/30 transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wide">
                    Overall Score
                  </p>
                  <StatValue value={safeStats.averageScore} suffix="%" />
                </div>
              </div>
              <div className="flex items-center space-x-1 text-xs">
                <TrendingUp className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400 font-medium hidden sm:inline">
                  +5%
                </span>
              </div>
            </div>
          </div>

          {/* Study Streak Card */}
          <div className="group relative bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700/50 hover:border-orange-500/30 transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wide">
                    Study Streak
                  </p>
                  <StatValue value={safeStats.studyStreak} suffix=" days" />
                </div>
              </div>
              <div className="flex items-center space-x-1 text-xs">
                <TrendingUp className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400 font-medium hidden sm:inline">
                  Keep it up!
                </span>
              </div>
            </div>
          </div>

          {/* Questions Answered Card */}
          <div className="group relative bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-gray-700/50 hover:border-indigo-500/30 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="h-8 w-8 sm:h-10 sm:w-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-400 uppercase tracking-wide">
                    Questions Answered
                  </p>
                  <StatValue value={safeStats.questionsAnswered} />
                </div>
              </div>
              <div className="flex items-center space-x-1 text-xs">
                <TrendingUp className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400 font-medium hidden sm:inline">
                  +20%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-lg shadow-black/10 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-3 sm:p-4 border-b border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="h-6 w-6 sm:h-8 sm:w-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Recent Activity
                </h2>
              </div>
              {safeRecentActivity.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllActivity(!showAllActivity)}
                  className="text-xs sm:text-sm text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all duration-200 px-2 sm:px-3"
                >
                  {showAllActivity ? (
                    <>
                      <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span className="hidden sm:inline">Show Less</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span className="hidden sm:inline">View All</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          <div className="p-3 sm:p-4">
            {safeRecentActivity.length > 0 ? (
              <div className="space-y-2">
                {(showAllActivity
                  ? safeRecentActivity
                  : safeRecentActivity.slice(0, 3)
                ).map((activity: RecentActivity) => (
                  <div
                    key={activity.id}
                    className="group flex items-center justify-between p-2 sm:p-3 bg-gray-700/30 rounded-lg border border-gray-600/30 hover:bg-gray-700/50 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                      <div className="h-6 w-6 sm:h-8 sm:w-8 bg-gray-600/50 rounded-lg flex items-center justify-center group-hover:bg-gray-600/70 transition-colors duration-200 flex-shrink-0">
                        <div className="text-gray-300 group-hover:text-white transition-colors duration-200">
                          {getActivityIcon(activity.type)}
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-white group-hover:text-blue-300 transition-colors duration-200 text-sm sm:text-base truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-400">
                          <span className="capitalize">{activity.type}</span>
                          <span className="hidden sm:inline">
                            {" "}
                            • {formatDate(activity.completed_at)}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {activity.score !== undefined && (
                        <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-xs font-medium rounded-full border border-green-500/20">
                          {activity.score}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gray-700/50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500" />
                </div>
                <p className="font-medium text-gray-300 mb-1 text-sm sm:text-base">
                  No recent activity
                </p>
                <p className="text-xs sm:text-sm text-gray-400">
                  Start taking quizzes to see your activity here
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Topic Progress */}
        <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-lg shadow-black/10 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-3 sm:p-4 border-b border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="h-6 w-6 sm:h-8 sm:w-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Topic Progress
                </h2>
              </div>
              {safeTopicProgress.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllProgress(!showAllProgress)}
                  className="text-xs sm:text-sm text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all duration-200 px-2 sm:px-3"
                >
                  {showAllProgress ? (
                    <>
                      <ChevronUp className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span className="hidden sm:inline">Show Less</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span className="hidden sm:inline">View All</span>
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          <div className="p-3 sm:p-4">
            {safeTopicProgress.length > 0 ? (
              <div className="space-y-2">
                {(showAllProgress
                  ? safeTopicProgress
                  : safeTopicProgress.slice(0, 3)
                ).map((topic: TopicProgress) => (
                  <div
                    key={topic.topic_id}
                    className="group flex items-center justify-between p-2 sm:p-3 bg-gray-700/30 rounded-lg border border-gray-600/30 hover:bg-gray-700/50 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                      <div className="h-6 w-6 sm:h-8 sm:w-8 bg-gray-600/50 rounded-lg flex items-center justify-center group-hover:bg-gray-600/70 transition-colors duration-200 flex-shrink-0">
                        <div className="text-gray-300 group-hover:text-white transition-colors duration-200">
                          <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-white group-hover:text-purple-300 transition-colors duration-200 text-sm sm:text-base truncate">
                          {topic.topic_name}
                        </p>
                        <p className="text-xs text-gray-400 mb-1">
                          {topic.questions_correct} of{" "}
                          {topic.questions_attempted} questions correct
                        </p>
                        <div className="w-full bg-gray-600/30 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${topic.progress_percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-xs font-medium rounded-full border border-purple-500/20">
                        {topic.progress_percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gray-700/50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Target className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500" />
                </div>
                <p className="font-medium text-gray-300 mb-1 text-sm sm:text-base">
                  No progress data
                </p>
                <p className="text-xs sm:text-sm text-gray-400">
                  Answer questions to track your progress by topic
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
