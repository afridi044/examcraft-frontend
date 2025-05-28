"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  useCurrentUser,
  useDashboardStats,
  useRecentActivity,
  useTopicProgress,
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
  Plus,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();

  // State for view all functionality
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [showAllProgress, setShowAllProgress] = useState(false);

  // Get current user profile data
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();

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

  // Calculate if we're still loading data
  const dataLoading =
    userLoading || statsLoading || activityLoading || progressLoading;

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
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

  // Show premium dark loading state for everything
  if (loading || dataLoading || !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center">
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
          <p className="text-gray-400">Preparing your learning experience...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black">
      {/* Premium Dark Header with Glass Effect */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-gray-900/80 border-b border-gray-700/50 shadow-lg shadow-black/20">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Dashboard
                </h1>
                <p className="text-sm text-gray-400">
                  Welcome back, {currentUser?.first_name || user.email}
                </p>
              </div>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="border-gray-600/50 bg-gray-800/30 backdrop-blur-sm text-gray-300 hover:bg-gray-700/50 hover:border-gray-500/50 hover:text-white transition-all duration-200 shadow-lg"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Premium Dark Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Total Quizzes Card */}
          <div className="group relative bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl shadow-blue-500/20 hover:shadow-2xl hover:shadow-blue-500/30 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium bg-gradient-to-r from-gray-400 to-gray-500 bg-clip-text text-transparent uppercase tracking-wide">
                  Total Quizzes
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-300 bg-clip-text text-transparent">
                  {stats?.totalQuizzes || 0}
                </p>
                <div className="flex items-center space-x-1 text-xs">
                  <TrendingUp className="h-3 w-3 text-emerald-400" />
                  <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent font-medium">
                    +12% this month
                  </span>
                </div>
              </div>
              <div className="h-14 w-14 bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="h-7 w-7 text-white drop-shadow-sm" />
              </div>
            </div>
          </div>

          {/* Total Exams Card */}
          <div className="group relative bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl shadow-green-500/20 hover:shadow-2xl hover:shadow-green-500/30 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium bg-gradient-to-r from-gray-400 to-gray-500 bg-clip-text text-transparent uppercase tracking-wide">
                  Total Exams
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-400 via-green-300 to-emerald-300 bg-clip-text text-transparent">
                  {stats?.totalExams || 0}
                </p>
                <div className="flex items-center space-x-1 text-xs">
                  <TrendingUp className="h-3 w-3 text-emerald-400" />
                  <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent font-medium">
                    +8% this month
                  </span>
                </div>
              </div>
              <div className="h-14 w-14 bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/40 group-hover:scale-110 transition-transform duration-300">
                <Target className="h-7 w-7 text-white drop-shadow-sm" />
              </div>
            </div>
          </div>

          {/* Flashcards Card */}
          <div className="group relative bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl shadow-purple-500/20 hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium bg-gradient-to-r from-gray-400 to-gray-500 bg-clip-text text-transparent uppercase tracking-wide">
                  Flashcards
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-purple-300 to-pink-300 bg-clip-text text-transparent">
                  {stats?.totalFlashcards || 0}
                </p>
                <div className="flex items-center space-x-1 text-xs">
                  <TrendingUp className="h-3 w-3 text-emerald-400" />
                  <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent font-medium">
                    +15% this month
                  </span>
                </div>
              </div>
              <div className="h-14 w-14 bg-gradient-to-br from-purple-500 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/40 group-hover:scale-110 transition-transform duration-300">
                <Brain className="h-7 w-7 text-white drop-shadow-sm" />
              </div>
            </div>
          </div>

          {/* Average Score Card */}
          <div className="group relative bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl shadow-amber-500/20 hover:shadow-2xl hover:shadow-amber-500/30 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium bg-gradient-to-r from-gray-400 to-gray-500 bg-clip-text text-transparent uppercase tracking-wide">
                  Average Score
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-300 bg-clip-text text-transparent">
                  {stats?.averageScore || 0}%
                </p>
                <div className="flex items-center space-x-1 text-xs">
                  <TrendingUp className="h-3 w-3 text-emerald-400" />
                  <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent font-medium">
                    +5% this month
                  </span>
                </div>
              </div>
              <div className="h-14 w-14 bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/40 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="h-7 w-7 text-white drop-shadow-sm" />
              </div>
            </div>
          </div>

          {/* Study Streak Card */}
          <div className="group relative bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl shadow-orange-500/20 hover:shadow-2xl hover:shadow-orange-500/30 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium bg-gradient-to-r from-gray-400 to-gray-500 bg-clip-text text-transparent uppercase tracking-wide">
                  Study Streak
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-orange-300 to-red-300 bg-clip-text text-transparent">
                  {stats?.studyStreak || 0} days
                </p>
                <div className="flex items-center space-x-1 text-xs">
                  <TrendingUp className="h-3 w-3 text-emerald-400" />
                  <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent font-medium">
                    Keep it up!
                  </span>
                </div>
              </div>
              <div className="h-14 w-14 bg-gradient-to-br from-orange-500 via-orange-600 to-red-600 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/40 group-hover:scale-110 transition-transform duration-300">
                <Calendar className="h-7 w-7 text-white drop-shadow-sm" />
              </div>
            </div>
          </div>

          {/* Questions Answered Card */}
          <div className="group relative bg-gray-800/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50 shadow-xl shadow-indigo-500/20 hover:shadow-2xl hover:shadow-indigo-500/30 transition-all duration-300 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium bg-gradient-to-r from-gray-400 to-gray-500 bg-clip-text text-transparent uppercase tracking-wide">
                  Questions Answered
                </p>
                <p className="text-3xl font-bold bg-gradient-to-r from-indigo-400 via-indigo-300 to-blue-300 bg-clip-text text-transparent">
                  {stats?.questionsAnswered || 0}
                </p>
                <div className="flex items-center space-x-1 text-xs">
                  <TrendingUp className="h-3 w-3 text-emerald-400" />
                  <span className="bg-gradient-to-r from-emerald-400 to-green-400 bg-clip-text text-transparent font-medium">
                    +20% this month
                  </span>
                </div>
              </div>
              <div className="h-14 w-14 bg-gradient-to-br from-indigo-500 via-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/40 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="h-7 w-7 text-white drop-shadow-sm" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Premium Dark Recent Activity */}
          <div className="bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-xl shadow-black/20 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-6 border-b border-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-blue-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
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

            <div className="p-6">
              {recentActivity && recentActivity.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {(showAllActivity
                    ? recentActivity
                    : recentActivity.slice(0, 3)
                  ).map((activity) => (
                    <div
                      key={activity.id}
                      className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-700/50 to-gray-800/50 rounded-xl border border-gray-600/50 hover:shadow-md hover:border-gray-500/50 transition-all duration-200"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 bg-gradient-to-br from-slate-600 via-gray-600 to-slate-700 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-lg">
                          <div className="text-gray-300 group-hover:text-white transition-colors duration-200">
                            {getActivityIcon(activity.type)}
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent group-hover:from-blue-300 group-hover:via-purple-300 group-hover:to-pink-300 transition-all duration-200">
                            {activity.title}
                          </p>
                          <p className="text-sm bg-gradient-to-r from-gray-400 to-gray-500 bg-clip-text text-transparent">
                            {activity.type.charAt(0).toUpperCase() +
                              activity.type.slice(1)}{" "}
                            • {formatDate(activity.completed_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {activity.score !== undefined && (
                          <span className="px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-400 text-sm font-semibold rounded-full border border-green-500/30">
                            {activity.score}%
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 h-80 flex flex-col justify-center">
                  <div className="h-16 w-16 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-8 w-8 text-gray-500" />
                  </div>
                  <p className="font-medium mb-2 bg-gradient-to-r from-gray-300 to-gray-400 bg-clip-text text-transparent">
                    No recent activity
                  </p>
                  <p className="text-sm bg-gradient-to-r from-gray-500 to-gray-600 bg-clip-text text-transparent">
                    Start taking quizzes to see your activity here
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Premium Dark Topic Progress */}
          <div className="bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-xl shadow-black/20 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-6 border-b border-gray-700/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-rose-300 bg-clip-text text-transparent">
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

            <div className="p-6">
              {topicProgress && topicProgress.length > 0 ? (
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {(showAllProgress
                    ? topicProgress
                    : topicProgress.slice(0, 3)
                  ).map((topic) => (
                    <div
                      key={topic.topic_id}
                      className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-700/50 to-gray-800/50 rounded-xl border border-gray-600/50 hover:shadow-md hover:border-gray-500/50 transition-all duration-200"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 bg-gradient-to-br from-purple-600 via-purple-700 to-pink-700 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-lg">
                          <div className="text-gray-300 group-hover:text-white transition-colors duration-200">
                            <BarChart3 className="h-4 w-4" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:via-pink-300 group-hover:to-rose-300 transition-all duration-200">
                            {topic.topic_name}
                          </p>
                          <p className="text-sm bg-gradient-to-r from-gray-400 to-gray-500 bg-clip-text text-transparent">
                            {topic.questions_correct} of{" "}
                            {topic.questions_attempted} questions correct
                          </p>
                          <div className="w-full bg-gray-600/50 rounded-full h-2 mt-2 overflow-hidden shadow-inner">
                            <div
                              className="bg-gradient-to-r from-purple-500 via-purple-600 to-pink-500 h-2 rounded-full transition-all duration-500 shadow-sm"
                              style={{ width: `${topic.progress_percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full">
                          <span className="text-sm font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                            {topic.progress_percentage}%
                          </span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 h-80 flex flex-col justify-center">
                  <div className="h-16 w-16 bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Target className="h-8 w-8 text-gray-500" />
                  </div>
                  <p className="font-medium mb-2 bg-gradient-to-r from-gray-300 to-gray-400 bg-clip-text text-transparent">
                    No progress data
                  </p>
                  <p className="text-sm bg-gradient-to-r from-gray-500 to-gray-600 bg-clip-text text-transparent">
                    Answer questions to track your progress by topic
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Premium Dark Quick Actions */}
        <div className="bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-xl shadow-black/20 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500/20 to-blue-500/20 p-6 border-b border-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-indigo-300 via-blue-300 to-cyan-300 bg-clip-text text-transparent">
                Quick Actions
              </h2>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                onClick={() => router.push("/quiz/create")}
                className="group relative h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/40 hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-center space-x-3">
                  <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <span>Create Quiz</span>
                </div>
              </Button>

              <Button
                onClick={() => router.push("/exam/create")}
                className="group relative h-14 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-semibold rounded-xl shadow-lg shadow-green-500/40 hover:shadow-xl hover:shadow-green-500/50 transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-center space-x-3">
                  <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <Target className="h-4 w-4" />
                  </div>
                  <span>Create Exam</span>
                </div>
              </Button>

              <Button
                onClick={() => router.push("/flashcards/create")}
                className="group relative h-14 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/40 hover:shadow-xl hover:shadow-purple-500/50 transition-all duration-300 hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-center space-x-3">
                  <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <Brain className="h-4 w-4" />
                  </div>
                  <span>Create Flashcard</span>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
