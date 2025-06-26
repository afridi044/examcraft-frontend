
"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  useCurrentUser,
  useDashboardData,
  useOptimizedDashboard,
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
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // State for view all functionality
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [showAllProgress, setShowAllProgress] = useState(false);

  // Get current user profile data for proper database user ID
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  
  // Use the database user_id
  const userId = currentUser?.user_id || "";

  // Redirect to landing page if not authenticated and not loading
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [loading, user, router]);

  // Only invalidate data if it's stale or on explicit user action
  // Removed automatic invalidation on mount for better performance

  // OPTIMIZED: Use the new batched dashboard hook for best performance with improved settings
  const dashboardData = useOptimizedDashboard(userId);
  
  // Extract data from the optimized hook
  const stats = dashboardData.data?.stats;
  const recentActivity = dashboardData.data?.recentActivity || [];
  const topicProgress = dashboardData.data?.topicProgress || [];

  // Improved loading logic - don't show loading state when user is signing out
  const isMainLoading = loading || (loading === false && user && userLoading) || (loading === false && user && !currentUser);
  const isDataLoading = userId && dashboardData.isLoading;
  
  // Show full loading screen for both auth and initial data load, but not during sign out
  const showFullLoadingScreen = isMainLoading || isDataLoading;
  
  // For safer data access with defaults
  const safeStats = stats || {
    totalQuizzes: 0,
    totalExams: 0,
    totalFlashcards: 0,
    averageScore: 0,
    studyStreak: 0,
    questionsAnswered: 0
  };
  const safeRecentActivity = recentActivity || [];
  const safeTopicProgress = topicProgress || [];

  const StatValue = ({ value, suffix = "" }: { 
    value: number; 
    suffix?: string; 
  }) => {
    return (
      <p className="text-2xl font-bold text-white">
        {value.toLocaleString()}{suffix}
      </p>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getActivityIcon = (type: string) => {
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
  };

  // Single loading screen for all loading states
  if (showFullLoadingScreen) {
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
            <p className="text-gray-400">
              Preparing your learning experience
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8 mt-8 p-10">


        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Total Quizzes Card */}
          <div className="group relative bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-blue-500/30 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/10">
            <Link
              href="/dashboard/quiz-history"
              className="absolute inset-0 rounded-xl"
              aria-label="View Quiz History"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <BookOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                    Total Quizzes
                  </p>
                  <StatValue 
                    value={safeStats.totalQuizzes}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-1 text-xs">
                <TrendingUp className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400 font-medium">+12%</span>
              </div>
            </div>
          </div>

          {/* Total Exams Card */}
          <div className="group relative bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-green-500/30 transition-all duration-200 hover:shadow-lg hover:shadow-green-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/20">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                    Total Exams
                  </p>
                  <StatValue 
                    value={safeStats.totalExams}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-1 text-xs">
                <TrendingUp className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400 font-medium">+8%</span>
              </div>
            </div>
          </div>

          {/* Flashcards Card */}
          <div className="group relative bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-purple-500/30 transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/10">
            <Link
              href="/flashcards"
              className="absolute inset-0 rounded-xl"
              aria-label="View Flashcards"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <Brain className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                    Flashcards
                  </p>
                  <StatValue 
                    value={safeStats.totalFlashcards}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-1 text-xs">
                <TrendingUp className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400 font-medium">+15%</span>
              </div>
            </div>
          </div>

          {/* Overall Score Card */}
          <div className="group relative bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-amber-500/30 transition-all duration-200 hover:shadow-lg hover:shadow-amber-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                    Overall Score
                  </p>
                  <StatValue 
                    value={safeStats.averageScore}
                    suffix="%"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-1 text-xs">
                <TrendingUp className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400 font-medium">+5%</span>
              </div>
            </div>
          </div>

          {/* Study Streak Card */}
          <div className="group relative bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-orange-500/30 transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                    Study Streak
                  </p>
                  <StatValue 
                    value={safeStats.studyStreak}
                    suffix=" days"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-1 text-xs">
                <TrendingUp className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400 font-medium">
                  Keep it up!
                </span>
              </div>
            </div>
          </div>

          {/* Questions Answered Card */}
          <div className="group relative bg-gray-800/70 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 hover:border-indigo-500/30 transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                    Questions Answered
                  </p>
                  <StatValue 
                    value={safeStats.questionsAnswered}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-1 text-xs">
                <TrendingUp className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400 font-medium">+20%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-lg shadow-black/10 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-4 border-b border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Clock className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-white">
                  Recent Activity
                </h2>
              </div>
              {safeRecentActivity.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllActivity(!showAllActivity)}
                  className="text-sm text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all duration-200"
                >
                  {showAllActivity ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      View All
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          <div className="p-4">
            {safeRecentActivity.length > 0 ? (
              <div className="space-y-2">
                {(showAllActivity
                  ? safeRecentActivity
                  : safeRecentActivity.slice(0, 3)
                ).map((activity: any) => (
                  <div
                    key={activity.id}
                    className="group flex items-center justify-between p-3 bg-gray-700/30 rounded-lg border border-gray-600/30 hover:bg-gray-700/50 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-gray-600/50 rounded-lg flex items-center justify-center group-hover:bg-gray-600/70 transition-colors duration-200">
                        <div className="text-gray-300 group-hover:text-white transition-colors duration-200">
                          {getActivityIcon(activity.type)}
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-white group-hover:text-blue-300 transition-colors duration-200">
                          {activity.title}
                        </p>
                        <p className="text-xs text-gray-400">
                          {activity.type.charAt(0).toUpperCase() +
                            activity.type.slice(1)}{" "}
                          • {formatDate(activity.completed_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
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
              <div className="text-center py-8">
                <div className="h-12 w-12 bg-gray-700/50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="h-6 w-6 text-gray-500" />
                </div>
                <p className="font-medium text-gray-300 mb-1">
                  No recent activity
                </p>
                <p className="text-sm text-gray-400">
                  Start taking quizzes to see your activity here
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Topic Progress */}
        <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-lg shadow-black/10 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-4 border-b border-gray-700/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
                  <BarChart3 className="h-4 w-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-white">Topic Progress</h2>
              </div>
              {safeTopicProgress.length > 3 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllProgress(!showAllProgress)}
                  className="text-sm text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all duration-200"
                >
                  {showAllProgress ? (
                    <>
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4 mr-1" />
                      View All
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          <div className="p-4">
            {safeTopicProgress.length > 0 ? (
              <div className="space-y-2">
                {(showAllProgress
                  ? safeTopicProgress
                  : safeTopicProgress.slice(0, 3)
                ).map((topic: any) => (
                  <div
                    key={topic.topic_id}
                    className="group flex items-center justify-between p-3 bg-gray-700/30 rounded-lg border border-gray-600/30 hover:bg-gray-700/50 transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-gray-600/50 rounded-lg flex items-center justify-center group-hover:bg-gray-600/70 transition-colors duration-200">
                        <div className="text-gray-300 group-hover:text-white transition-colors duration-200">
                          <BarChart3 className="h-4 w-4" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-white group-hover:text-purple-300 transition-colors duration-200">
                          {topic.topic_name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {topic.questions_correct} of{" "}
                          {topic.questions_attempted} questions correct
                        </p>
                        <div className="w-full bg-gray-600/30 rounded-full h-1.5 mt-1.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${topic.progress_percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-0.5 bg-purple-500/10 text-purple-400 text-xs font-medium rounded-full border border-purple-500/20">
                        {topic.progress_percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="h-12 w-12 bg-gray-700/50 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Target className="h-6 w-6 text-gray-500" />
                </div>
                <p className="font-medium text-gray-300 mb-1">
                  No progress data
                </p>
                <p className="text-sm text-gray-400">
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