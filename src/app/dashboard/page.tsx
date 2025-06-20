"use client";

import { useAuth } from "@/hooks/useAuth";
// import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  useCurrentUser,
  useDashboardStats,
  useRecentActivity,
  useTopicProgress,
  useInvalidateUserData,
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
import { DashboardLayout } from "@/components/layouts/DashboardLayout";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  // const router = useRouter();

  // State for view all functionality
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [showAllProgress, setShowAllProgress] = useState(false);

  // Get current user profile data
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const invalidateUserData = useInvalidateUserData();

  // Log user information on initial load and when user or currentUser changes
  useEffect(() => {
    if (user) {
      console.log("Dashboard - Supabase Auth User ID:", user.id);
      // console.log("Dashboard - Supabase Auth User Email:", user.email);
    }

    if (currentUser) {
      //console.log("Dashboard - Database User:", currentUser);
      console.log("Dashboard - Database User ID:", currentUser.user_id);
    }
  }, [user, currentUser]);

  // Refresh data when dashboard comes into focus (e.g., when navigating back from quiz creation)
  useEffect(() => {
    const handleFocus = () => {
      if (currentUser?.user_id) {
        console.log("Dashboard: Refreshing data due to window focus");
        invalidateUserData(currentUser.user_id);
      }
    };

    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [currentUser?.user_id, invalidateUserData]);

  // Get dashboard statistics (only when user is authenticated and we have the user profile)
  const { data: stats, isLoading: statsLoading } = useDashboardStats(
    currentUser?.user_id || ""
  );

  // Get recent activity (only when user is authenticated and we have the user profile)
  const { data: recentActivity, isLoading: activityLoading } =
    useRecentActivity(currentUser?.user_id || "");

  // Get topic progress (only when user is authenticated and we have the user profile)
  const { data: topicProgress, isLoading: progressLoading } = useTopicProgress(
    currentUser?.user_id || ""
  );

  // Log when dashboard data is refreshed
  useEffect(() => {
    if (stats && recentActivity && topicProgress) {
      console.log("Dashboard: Data refreshed", {
        totalQuizzes: stats.totalQuizzes,
        recentActivityCount: recentActivity.length,
        timestamp: new Date().toISOString(),
      });
    }
  }, [stats, recentActivity, topicProgress]);

  // Calculate if we're still loading data
  const dataLoading =
    userLoading || statsLoading || activityLoading || progressLoading;

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

  // Show premium dark loading state for everything
  if (loading || dataLoading || !user) {
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
              Loading Dashboard
            </h2>
            <p className="text-gray-400">
              Preparing your learning experience...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-20 mt-20">
        {/* Premium Dark Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {/* Total Quizzes Card */}
          <div className="group relative bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300 hover:-translate-y-0.5">
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
                  <p className="text-2xl font-bold text-white">
                    {stats?.totalQuizzes || 0}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1 text-xs">
                <TrendingUp className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400 font-medium">+12%</span>
              </div>
            </div>
          </div>

          {/* Total Exams Card */}
          <div className="group relative bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300 hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg shadow-green-500/20">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                    Total Exams
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {stats?.totalExams || 0}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1 text-xs">
                <TrendingUp className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400 font-medium">+8%</span>
              </div>
            </div>
          </div>

          {/* Flashcards Card */}
          <div className="group relative bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50  hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 hover:-translate-y-0.5">
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
                  <p className="text-2xl font-bold text-white">
                    {stats?.totalFlashcards || 0}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1 text-xs">
                <TrendingUp className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400 font-medium">+15%</span>
              </div>
            </div>
          </div>

          {/* Overall Score Card */}
          <div className="group relative bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:shadow-lg hover:shadow-amber-500/20 transition-all duration-300 hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                    Overall Score
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {stats?.averageScore || 0}%
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1 text-xs">
                <TrendingUp className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400 font-medium">+5%</span>
              </div>
            </div>
          </div>

          {/* Study Streak Card */}
          <div className="group relative bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300 hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-orange-500/20">
                  <Calendar className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                    Study Streak
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {stats?.studyStreak || 0} days
                  </p>
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
          <div className="group relative bg-gray-800/70 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-0.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">
                    Questions Answered
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {stats?.questionsAnswered || 0}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1 text-xs">
                <TrendingUp className="h-3 w-3 text-emerald-400" />
                <span className="text-emerald-400 font-medium">+20%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Premium Dark Recent Activity */}
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
                {recentActivity && recentActivity.length > 3 && (
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
              {recentActivity && recentActivity.length > 0 ? (
                <div className="space-y-2">
                  {(showAllActivity
                    ? recentActivity
                    : recentActivity.slice(0, 3)
                  ).map((activity) => (
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

          {/* Premium Dark Topic Progress */}
          <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-lg shadow-black/10 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-4 border-b border-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-purple-500/20">
                    <BarChart3 className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-white">
                    Topic Progress
                  </h2>
                </div>
                {topicProgress && topicProgress.length > 3 && (
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
              {topicProgress && topicProgress.length > 0 ? (
                <div className="space-y-2">
                  {(showAllProgress
                    ? topicProgress
                    : topicProgress.slice(0, 3)
                  ).map((topic) => (
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

        {/* Premium Dark Quick Actions */}
        <div className="bg-gray-800/70 backdrop-blur-sm rounded-xl border border-gray-700/50 shadow-lg shadow-black/10 overflow-hidden"></div>
      </div>
    </DashboardLayout>
  );
}
