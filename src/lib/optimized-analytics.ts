// Optimized database service functions for Task 2
// These replace the existing slow functions in database.ts

import { supabase } from "./database";
import type { ApiResponse, DashboardStats, RecentActivity, TopicProgress } from "@/types/database";

// Helper functions (same as in original database.ts)
function handleError<T>(error: unknown): ApiResponse<T> {
  return {
    success: false,
    error: error instanceof Error ? error.message : "Unknown error occurred",
    data: null,
  };
}

function handleSuccess<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    error: null,
    data,
  };
}

// OPTIMIZED: Single function call replaces 5+ separate queries
export const optimizedAnalyticsService = {
  // Get dashboard statistics - MASSIVELY OPTIMIZED
  async getDashboardStats(userId: string): Promise<ApiResponse<DashboardStats>> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_dashboard_stats', { p_user_id: userId });

      if (error) return handleError(error);
      
      if (!data || data.length === 0) {
        // Return default stats if no data
        return handleSuccess({
          totalQuizzes: 0,
          totalExams: 0,
          totalFlashcards: 0,
          averageScore: 0,
          studyStreak: 0,
          questionsAnswered: 0,
          correctAnswers: 0,
        });
      }

      const stats = data[0];
      return handleSuccess({
        totalQuizzes: stats.total_quizzes,
        totalExams: stats.total_exams,
        totalFlashcards: stats.total_flashcards,
        averageScore: Math.round(stats.average_score),
        studyStreak: stats.study_streak,
        questionsAnswered: stats.questions_answered,
        correctAnswers: stats.correct_answers,
      });
    } catch (error) {
      return handleError(error);
    }
  },

  // Get recent activity - OPTIMIZED with single function call
  async getRecentActivity(
    userId: string,
    limit: number = 10
  ): Promise<ApiResponse<RecentActivity[]>> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_recent_activity', { 
          p_user_id: userId,
          p_limit: limit 
        });

      if (error) return handleError(error);
      
      const activities: RecentActivity[] = (data || []).map((item: any) => ({
        id: item.activity_id,
        type: item.activity_type,
        title: item.title,
        score: item.score,
        completed_at: item.completed_at,
        topic: item.topic_name,
      }));

      return handleSuccess(activities);
    } catch (error) {
      return handleError(error);
    }
  },

  // Get topic progress - OPTIMIZED with single function call
  async getTopicProgress(userId: string): Promise<ApiResponse<TopicProgress[]>> {
    try {
      const { data, error } = await supabase
        .rpc('get_user_topic_progress', { p_user_id: userId });

      if (error) return handleError(error);

      const progress: TopicProgress[] = (data || []).map((item: any) => ({
        topic_id: item.topic_id,
        topic_name: item.topic_name,
        progress_percentage: item.progress_percentage,
        questions_attempted: item.questions_attempted,
        questions_correct: item.questions_correct,
        last_activity: item.last_activity,
      }));

      return handleSuccess(progress);
    } catch (error) {
      return handleError(error);
    }
  },

  // BATCH FUNCTION: Get all dashboard data in parallel
  async getAllDashboardData(userId: string): Promise<{
    stats: ApiResponse<DashboardStats>;
    recentActivity: ApiResponse<RecentActivity[]>;
    topicProgress: ApiResponse<TopicProgress[]>;
  }> {
    // Run all three optimized functions in parallel
    const [statsResult, activityResult, progressResult] = await Promise.all([
      this.getDashboardStats(userId),
      this.getRecentActivity(userId, 10),
      this.getTopicProgress(userId),
    ]);

    return {
      stats: statsResult,
      recentActivity: activityResult,
      topicProgress: progressResult,
    };
  },
};
