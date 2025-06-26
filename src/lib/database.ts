// Database Service Layer for ExamCraft
// Provides type-safe CRUD operations for all database entities

import { createClient } from "@supabase/supabase-js";
import { TABLE_NAMES } from "@/types/database";
import type {
  User,
  Topic,
  Question,
  Quiz,
  QuizQuestion,
  Exam,
  ExamSession,
  UserAnswer,
  Flashcard,
  CreateUserInput,
  CreateTopicInput,
  CreateQuestionInput,
  CreateQuestionOptionInput,
  CreateQuizInput,
  CreateExamInput,
  CreateExamSessionInput,
  CreateUserAnswerInput,
  CreateFlashcardInput,
  UpdateUserInput,
  UpdateQuizInput,
  UpdateExamSessionInput,
  UpdateFlashcardInput,
  QuestionWithOptions,
  QuizWithQuestions,
  ExamWithQuestions,
  ExamSessionWithDetails,
  UserAnswerWithDetails,
  FlashcardWithTopic,
  TopicWithProgress,
  DashboardStats,
  RecentActivity,
  TopicProgress,
  ApiResponse,
} from "@/types/database";

// Initialize Supabase client with minimal logging
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    debug: false, // Disable verbose auth logging
  },
});

// =============================================
// Helper Functions
// =============================================

function handleError<T>(error: unknown): ApiResponse<T> {
  console.error("Database error:", error);
  const errorMessage =
    error instanceof Error ? error.message : "An unexpected error occurred";
  return {
    data: null,
    error: errorMessage,
    success: false,
  };
}

function handleSuccess<T>(data: T): ApiResponse<T> {
  return {
    data,
    error: null,
    success: true,
  };
}

// =============================================
// User Operations
// =============================================

export const userService = {
  // Get current user from auth
  async getCurrentUser(): Promise<ApiResponse<User | null>> {
    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();
      if (authError || !authData.user) {
        return handleSuccess(null);
      }

      const { data, error } = await supabase
        .from(TABLE_NAMES.USERS)
        .select("*")
        .eq("supabase_auth_id", authData.user.id)
        .single();

      if (error) return handleError(error);
      return handleSuccess(data);
    } catch (error) {
      return handleError(error);
    }
  },

  // Get user by ID
  async getUserById(userId: string): Promise<ApiResponse<User>> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.USERS)
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) return handleError(error);
      return handleSuccess(data);
    } catch (error) {
      return handleError(error);
    }
  },

  // Create user
  async createUser(input: CreateUserInput): Promise<ApiResponse<User>> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.USERS)
        .insert(input)
        .select()
        .single();

      if (error) return handleError(error);
      return handleSuccess(data);
    } catch (error) {
      return handleError(error);
    }
  },

  // Update user
  async updateUser(
    userId: string,
    input: UpdateUserInput
  ): Promise<ApiResponse<User>> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.USERS)
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq("user_id", userId)
        .select()
        .single();

      if (error) return handleError(error);
      return handleSuccess(data);
    } catch (error) {
      return handleError(error);
    }
  },

  // Delete user
  async deleteUser(userId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from(TABLE_NAMES.USERS)
        .delete()
        .eq("user_id", userId);

      if (error) return handleError(error);
      return handleSuccess(true);
    } catch (error) {
      return handleError(error);
    }
  },
};

// =============================================
// Topic Operations
// =============================================

export const topicService = {
  // Get all topics
  async getAllTopics(): Promise<ApiResponse<Topic[]>> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.TOPICS)
        .select("*")
        .order("name");

      if (error) return handleError(error);
      return handleSuccess(data || []);
    } catch (error) {
      return handleError(error);
    }
  },

  // Get topic by ID
  async getTopicById(topicId: string): Promise<ApiResponse<Topic>> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.TOPICS)
        .select("*")
        .eq("topic_id", topicId)
        .single();

      if (error) return handleError(error);
      return handleSuccess(data);
    } catch (error) {
      return handleError(error);
    }
  },

  // Get topics with progress for user
  async getTopicsWithProgress(
    userId: string
  ): Promise<ApiResponse<TopicWithProgress[]>> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.TOPICS)
        .select(
          `
          *,
          user_topic_progress!inner(*)
        `
        )
        .eq("user_topic_progress.user_id", userId)
        .order("name");

      if (error) return handleError(error);
      return handleSuccess(data || []);
    } catch (error) {
      return handleError(error);
    }
  },

  // Create topic
  async createTopic(input: CreateTopicInput): Promise<ApiResponse<Topic>> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.TOPICS)
        .insert(input)
        .select()
        .single();

      if (error) return handleError(error);
      return handleSuccess(data);
    } catch (error) {
      return handleError(error);
    }
  },

  // Update topic
  async updateTopic(
    topicId: string,
    input: Partial<CreateTopicInput>
  ): Promise<ApiResponse<Topic>> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.TOPICS)
        .update(input)
        .eq("topic_id", topicId)
        .select()
        .single();

      if (error) return handleError(error);
      return handleSuccess(data);
    } catch (error) {
      return handleError(error);
    }
  },

  // Delete topic
  async deleteTopic(topicId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from(TABLE_NAMES.TOPICS)
        .delete()
        .eq("topic_id", topicId);

      if (error) return handleError(error);
      return handleSuccess(true);
    } catch (error) {
      return handleError(error);
    }
  },
};

// =============================================
// Question Operations
// =============================================

export const questionService = {
  // Get questions with options
  async getQuestionsWithOptions(filters?: {
    topicId?: string;
    difficulty?: number;
    questionType?: string;
    limit?: number;
  }): Promise<ApiResponse<QuestionWithOptions[]>> {
    try {
      let query = supabase
        .from(TABLE_NAMES.QUESTIONS)
        .select(
          `
          *,
          question_options(*),
          topics(name),
          explanations(content)
        `
        )
        .order("created_at", { ascending: false });

      if (filters?.topicId) {
        query = query.eq("topic_id", filters.topicId);
      }
      if (filters?.difficulty) {
        query = query.eq("difficulty", filters.difficulty);
      }
      if (filters?.questionType) {
        query = query.eq("question_type", filters.questionType);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) return handleError(error);
      return handleSuccess(data || []);
    } catch (error) {
      return handleError(error);
    }
  },

  // Get question by ID
  async getQuestionById(
    questionId: string
  ): Promise<ApiResponse<QuestionWithOptions>> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.QUESTIONS)
        .select(
          `
          *,
          question_options(*),
          topics(name),
          explanations(content)
        `
        )
        .eq("question_id", questionId)
        .single();

      if (error) return handleError(error);
      return handleSuccess(data);
    } catch (error) {
      return handleError(error);
    }
  },

  // Create question with options
  async createQuestionWithOptions(
    questionInput: CreateQuestionInput,
    optionsInput: CreateQuestionOptionInput[]
  ): Promise<ApiResponse<QuestionWithOptions>> {
    try {
      // Create question first
      const { data: question, error: questionError } = await supabase
        .from(TABLE_NAMES.QUESTIONS)
        .insert(questionInput)
        .select()
        .single();

      if (questionError) return handleError(questionError);

      // Create options
      const optionsWithQuestionId = optionsInput.map((option) => ({
        ...option,
        question_id: question.question_id,
      }));

      const { data: options, error: optionsError } = await supabase
        .from(TABLE_NAMES.QUESTION_OPTIONS)
        .insert(optionsWithQuestionId)
        .select();

      if (optionsError) return handleError(optionsError);

      // Return question with options
      const result: QuestionWithOptions = {
        ...question,
        question_options: options || [],
      };

      return handleSuccess(result);
    } catch (error) {
      return handleError(error);
    }
  },

  // Create question
  async createQuestion(
    input: CreateQuestionInput
  ): Promise<ApiResponse<Question>> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.QUESTIONS)
        .insert(input)
        .select()
        .single();

      if (error) return handleError(error);
      return handleSuccess(data);
    } catch (error) {
      return handleError(error);
    }
  },

  // Create question option
  async createQuestionOption(
    input: CreateQuestionOptionInput
  ): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.QUESTION_OPTIONS)
        .insert(input)
        .select()
        .single();

      if (error) return handleError(error);
      return handleSuccess(data);
    } catch (error) {
      return handleError(error);
    }
  },

  // Create explanation
  async createExplanation(input: {
    question_id: string;
    content: string;
    ai_generated: boolean;
  }): Promise<ApiResponse<any>> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.EXPLANATIONS)
        .insert(input)
        .select()
        .single();

      if (error) return handleError(error);
      return handleSuccess(data);
    } catch (error) {
      return handleError(error);
    }
  },

  // Update question
  async updateQuestion(
    questionId: string,
    input: Partial<CreateQuestionInput>
  ): Promise<ApiResponse<Question>> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.QUESTIONS)
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq("question_id", questionId)
        .select()
        .single();

      if (error) return handleError(error);
      return handleSuccess(data);
    } catch (error) {
      return handleError(error);
    }
  },

  // Delete question
  async deleteQuestion(questionId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from(TABLE_NAMES.QUESTIONS)
        .delete()
        .eq("question_id", questionId);

      if (error) return handleError(error);
      return handleSuccess(true);
    } catch (error) {
      return handleError(error);
    }
  },
};

// =============================================
// Quiz Operations
// =============================================

export const quizService = {
  // Get user's quizzes
  async getUserQuizzes(userId: string): Promise<ApiResponse<Quiz[]>> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.QUIZZES)
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) return handleError(error);
      return handleSuccess(data || []);
    } catch (error) {
      return handleError(error);
    }
  },

  // Get quiz with questions
  async getQuizWithQuestions(
    quizId: string
  ): Promise<ApiResponse<QuizWithQuestions>> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.QUIZZES)
        .select(
          `
          *,
          quiz_questions(
            *,
            questions(
              *,
              question_options(*),
              topics(*),
              explanations(*)
            )
          ),
          topics(*),
          users(*)
        `
        )
        .eq("quiz_id", quizId)
        .single();

      if (error) return handleError(error);
      return handleSuccess(data);
    } catch (error) {
      return handleError(error);
    }
  },

  // Create quiz
  async createQuiz(input: CreateQuizInput): Promise<ApiResponse<Quiz>> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.QUIZZES)
        .insert(input)
        .select()
        .single();

      if (error) return handleError(error);
      return handleSuccess(data);
    } catch (error) {
      return handleError(error);
    }
  },

  // Add questions to quiz
  async addQuestionsToQuiz(
    quizId: string,
    questionIds: string[]
  ): Promise<ApiResponse<QuizQuestion[]>> {
    try {
      const quizQuestions = questionIds.map((questionId, index) => ({
        quiz_id: quizId,
        question_id: questionId,
        question_order: index + 1,
      }));

      const { data, error } = await supabase
        .from(TABLE_NAMES.QUIZ_QUESTIONS)
        .insert(quizQuestions)
        .select();

      if (error) return handleError(error);
      return handleSuccess(data || []);
    } catch (error) {
      return handleError(error);
    }
  },

  // Update quiz
  async updateQuiz(
    quizId: string,
    input: UpdateQuizInput
  ): Promise<ApiResponse<Quiz>> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.QUIZZES)
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq("quiz_id", quizId)
        .select()
        .single();

      if (error) return handleError(error);
      return handleSuccess(data);
    } catch (error) {
      return handleError(error);
    }
  },

  // Delete quiz
  async deleteQuiz(quizId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from(TABLE_NAMES.QUIZZES)
        .delete()
        .eq("quiz_id", quizId);

      if (error) return handleError(error);
      return handleSuccess(true);
    } catch (error) {
      return handleError(error);
    }
  },
};

// =============================================
// Exam Operations
// =============================================

export const examService = {
  // Get user's exams
  async getUserExams(userId: string): Promise<ApiResponse<Exam[]>> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.EXAMS)
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) return handleError(error);
      return handleSuccess(data || []);
    } catch (error) {
      return handleError(error);
    }
  },

  // Get exam with questions
  async getExamWithQuestions(
    examId: string
  ): Promise<ApiResponse<ExamWithQuestions>> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.EXAMS)
        .select(
          `
          *,
          exam_questions(
            *,
            questions(
              *,
              question_options(*),
              topics(*),
              explanations(*)
            )
          ),
          topics(*),
          users(*)
        `
        )
        .eq("exam_id", examId)
        .single();

      if (error) return handleError(error);
      return handleSuccess(data);
    } catch (error) {
      return handleError(error);
    }
  },

  // Create exam
  async createExam(input: CreateExamInput): Promise<ApiResponse<Exam>> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.EXAMS)
        .insert(input)
        .select()
        .single();

      if (error) return handleError(error);
      return handleSuccess(data);
    } catch (error) {
      return handleError(error);
    }
  },

  // Start exam session
  async startExamSession(
    input: CreateExamSessionInput
  ): Promise<ApiResponse<ExamSession>> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.EXAM_SESSIONS)
        .insert(input)
        .select()
        .single();

      if (error) return handleError(error);
      return handleSuccess(data);
    } catch (error) {
      return handleError(error);
    }
  },

  // Update exam session
  async updateExamSession(
    sessionId: string,
    input: UpdateExamSessionInput
  ): Promise<ApiResponse<ExamSession>> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.EXAM_SESSIONS)
        .update(input)
        .eq("session_id", sessionId)
        .select()
        .single();

      if (error) return handleError(error);
      return handleSuccess(data);
    } catch (error) {
      return handleError(error);
    }
  },

  // Get exam sessions for user
  async getUserExamSessions(
    userId: string
  ): Promise<ApiResponse<ExamSessionWithDetails[]>> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.EXAM_SESSIONS)
        .select(
          `
          *,
          exams(*),
          users(*),
          user_answers(*)
        `
        )
        .eq("user_id", userId)
        .order("start_time", { ascending: false });

      if (error) return handleError(error);
      return handleSuccess(data || []);
    } catch (error) {
      return handleError(error);
    }
  },
};

// =============================================
// User Answer Operations
// =============================================

export const answerService = {
  // Submit answer
  async submitAnswer(
    input: CreateUserAnswerInput
  ): Promise<ApiResponse<UserAnswer>> {
    try {
      // Debug: Check what user IDs exist in user_answers table for this quiz
      const { data: allAnswersForQuiz } = await supabase
        .from(TABLE_NAMES.USER_ANSWERS)
        .select("user_id, question_id, quiz_id, created_at")
        .eq("quiz_id", input.quiz_id);

      // First, delete any existing answers for this user, question, and quiz combination
      // This handles retakes by removing old answers before inserting new ones
      const deleteQuery = supabase
        .from(TABLE_NAMES.USER_ANSWERS)
        .delete()
        .eq("user_id", input.user_id)
        .eq("question_id", input.question_id);

      // Add quiz_id filter if it exists (for quiz answers)
      if (input.quiz_id) {
        deleteQuery.eq("quiz_id", input.quiz_id);
      } else {
        deleteQuery.is("quiz_id", null);
      }

      const { error: deleteError, count: deletedCount } = await deleteQuery;

      if (deleteError) {
        // Don't fail the whole operation if delete fails - might be first attempt
      }

      // Insert the new answer
      const { data, error } = await supabase
        .from(TABLE_NAMES.USER_ANSWERS)
        .insert(input)
        .select()
        .single();

      if (error) {
        return handleError(error);
      }

      return handleSuccess(data);
    } catch (error) {
      return handleError(error);
    }
  },

  // Get user answers with details
  async getUserAnswers(
    userId: string,
    filters?: {
      quizId?: string;
      sessionId?: string;
      topicId?: string;
    }
  ): Promise<ApiResponse<UserAnswerWithDetails[]>> {
    try {
      let query = supabase
        .from(TABLE_NAMES.USER_ANSWERS)
        .select(
          `
          *,
          questions(
            *,
            question_options(*),
            topics(*)
          ),
          question_options(*),
          exam_sessions(*),
          quizzes(*)
        `
        )
        .eq("user_id", userId);

      if (filters?.quizId) {
        query = query.eq("quiz_id", filters.quizId);
      }
      if (filters?.sessionId) {
        query = query.eq("session_id", filters.sessionId);
      }

      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) return handleError(error);
      return handleSuccess(data || []);
    } catch (error) {
      return handleError(error);
    }
  },
};

// =============================================
// Flashcard Operations
// =============================================

export const flashcardService = {
  // Get user's flashcards
  async getUserFlashcards(
    userId: string
  ): Promise<ApiResponse<FlashcardWithTopic[]>> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.FLASHCARDS)
        .select(
          `
          *,
          topic:topics(*),
          questions(
            *,
            question_options(*)
          )
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) return handleError(error);
      return handleSuccess(data || []);
    } catch (error) {
      return handleError(error);
    }
  },

  // Get flashcards due for review (legacy - kept for compatibility)
  async getFlashcardsDueForReview(
    userId: string
  ): Promise<ApiResponse<FlashcardWithTopic[]>> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.FLASHCARDS)
        .select(
          `
          *,
          topic:topics(*),
          questions(
            *,
            question_options(*)
          )
        `
        )
        .eq("user_id", userId)
        .lte("next_review_date", new Date().toISOString())
        .order("next_review_date");

      if (error) return handleError(error);
      return handleSuccess(data || []);
    } catch (error) {
      return handleError(error);
    }
  },

  // Get flashcards by mastery status (Magoosh-style)
  async getFlashcardsByMastery(
    userId: string,
    masteryStatus?: "learning" | "under_review" | "mastered"
  ): Promise<ApiResponse<FlashcardWithTopic[]>> {
    try {
      let query = supabase
        .from(TABLE_NAMES.FLASHCARDS)
        .select(
          `
          *,
          topic:topics(*),
          questions(
            *,
            question_options(*)
          )
        `
        )
        .eq("user_id", userId);

      if (masteryStatus) {
        query = query.eq("mastery_status", masteryStatus);
      }

      const { data, error } = await query.order("updated_at", {
        ascending: false,
      });

      if (error) return handleError(error);
      return handleSuccess(data || []);
    } catch (error) {
      return handleError(error);
    }
  },

  // Get single flashcard by ID
  async getFlashcardById(
    flashcardId: string
  ): Promise<ApiResponse<FlashcardWithTopic>> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.FLASHCARDS)
        .select(
          `
          *,
          topic:topics(*)
        `
        )
        .eq("flashcard_id", flashcardId)
        .single();

      if (error) return handleError(error);
      return handleSuccess(data);
    } catch (error) {
      return handleError(error);
    }
  },

  // Create flashcard
  async createFlashcard(
    input: CreateFlashcardInput
  ): Promise<ApiResponse<Flashcard>> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.FLASHCARDS)
        .insert(input)
        .select()
        .single();

      if (error) return handleError(error);
      return handleSuccess(data);
    } catch (error) {
      return handleError(error);
    }
  },

  // Update flashcard (for spaced repetition)
  async updateFlashcard(
    flashcardId: string,
    input: UpdateFlashcardInput
  ): Promise<ApiResponse<Flashcard>> {
    try {
      const { data, error } = await supabase
        .from(TABLE_NAMES.FLASHCARDS)
        .update({ ...input, updated_at: new Date().toISOString() })
        .eq("flashcard_id", flashcardId)
        .select()
        .single();

      if (error) return handleError(error);
      return handleSuccess(data);
    } catch (error) {
      return handleError(error);
    }
  },

  // Delete flashcard
  async deleteFlashcard(flashcardId: string): Promise<ApiResponse<boolean>> {
    try {
      const { error } = await supabase
        .from(TABLE_NAMES.FLASHCARDS)
        .delete()
        .eq("flashcard_id", flashcardId);

      if (error) return handleError(error);
      return handleSuccess(true);
    } catch (error) {
      return handleError(error);
    }
  },
};

// =============================================
// Analytics & Dashboard Operations
// =============================================

export const analyticsService = {
  // OPTIMIZED: Get dashboard statistics using single database function
  async getDashboardStats(
    userId: string
  ): Promise<ApiResponse<DashboardStats>> {
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

  // DEPRECATED: Keep for backward compatibility but use optimized version above
  async calculateStudyStreak(userId: string): Promise<ApiResponse<number>> {
    // This is now calculated within get_user_dashboard_stats for better performance
    const statsResult = await this.getDashboardStats(userId);
    if (statsResult.success && statsResult.data) {
      return handleSuccess(statsResult.data.studyStreak);
    }
    return handleSuccess(0);
  },

  // OPTIMIZED: Get recent activity using single database function
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

  // OPTIMIZED: Get topic progress using single database function
  async getTopicProgress(
    userId: string
  ): Promise<ApiResponse<TopicProgress[]>> {
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
};

// =============================================
// Export all services
// =============================================

export const db = {
  users: userService,
  topics: topicService,
  questions: questionService,
  quizzes: quizService,
  exams: examService,
  answers: answerService,
  flashcards: flashcardService,
  analytics: analyticsService,
};

export default db;
