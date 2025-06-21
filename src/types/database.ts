// Database Types for ExamCraft
// Generated from database schema for type-safe Supabase operations

// =============================================
// Core Database Types
// =============================================

export interface User {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  institution?: string;
  field_of_study?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
  supabase_auth_id?: string;
}

export interface Topic {
  topic_id: string;
  name: string;
  description?: string;
  parent_topic_id?: string;
}

export interface Question {
  question_id: string;
  content: string;
  question_type: "multiple-choice" | "true-false" | "fill-in-blank";
  difficulty?: number; // 1-5 scale
  topic_id?: string;
  created_at: string;
  updated_at: string;
}

export interface QuestionOption {
  option_id: string;
  question_id: string;
  content: string;
  is_correct: boolean;
}

export interface Quiz {
  quiz_id: string;
  user_id: string;
  title: string;
  description?: string;
  topic_id?: string;
  created_at: string;
  updated_at: string;
}

export interface QuizQuestion {
  quiz_id: string;
  question_id: string;
  question_order: number;
}

export interface Exam {
  exam_id: string;
  user_id: string;
  title: string;
  description?: string;
  duration_minutes: number;
  passing_score?: number;
  topic_id?: string;
  created_at: string;
  updated_at: string;
}

export interface ExamQuestion {
  exam_id: string;
  question_id: string;
  question_order: number;
  points: number;
}

export interface ExamSession {
  session_id: string;
  exam_id: string;
  user_id: string;
  start_time: string;
  end_time?: string;
  status: "in_progress" | "completed" | "timed_out";
  total_score?: number;
  created_at: string;
}

export interface UserAnswer {
  answer_id: string;
  user_id: string;
  question_id: string;
  session_id?: string;
  quiz_id?: string;
  selected_option_id?: string;
  text_answer?: string;
  is_correct?: boolean;
  time_taken_seconds?: number;
  created_at: string;
}

export interface Flashcard {
  flashcard_id: string;
  user_id: string;
  question: string;
  answer: string;
  topic_id?: string;
  source_question_id?: string;
  next_review_date?: string;
  interval_days: number;
  ease_factor: number;
  repetitions: number;
  mastery_status: "learning" | "under_review" | "mastered";
  consecutive_correct: number;
  created_at: string;
  updated_at: string;
  tags?: string[];
}

export interface Explanation {
  explanation_id: string;
  question_id: string;
  content: string;
  ai_generated: boolean;
  created_at: string;
  updated_at: string;
}

export interface Resource {
  resource_id: string;
  title: string;
  description?: string;
  url: string;
  resource_type: string;
  created_at: string;
  updated_at: string;
}

export interface QuestionResource {
  question_id: string;
  resource_id: string;
}

// =============================================
// Analytics Types
// =============================================

export interface UserAnalytics {
  analytics_id: string;
  user_id: string;
  date: string;
  topic_id?: string;
  total_questions: number;
  correct_answers: number;
  average_time_seconds?: number;
}

export interface ExamAnalytics {
  analytics_id: string;
  user_id: string;
  exam_id: string;
  session_id: string;
  total_questions: number;
  correct_answers: number;
  score_percentage?: number;
  time_spent_minutes?: number;
  completed_at: string;
}

export interface UserTopicProgress {
  progress_id: string;
  user_id: string;
  topic_id: string;
  proficiency_level: number; // 0.0 to 1.0
  questions_attempted: number;
  questions_correct: number;
  last_activity: string;
}

// =============================================
// Input Types for Creating Records
// =============================================

export interface CreateUserInput {
  email: string;
  first_name: string;
  last_name: string;
  institution?: string;
  field_of_study?: string;
  supabase_auth_id?: string;
}

export interface CreateTopicInput {
  name: string;
  description?: string;
  parent_topic_id?: string;
}

export interface CreateQuestionInput {
  content: string;
  question_type: "multiple-choice" | "true-false" | "fill-in-blank";
  difficulty?: number;
  topic_id?: string;
}

export interface CreateQuestionOptionInput {
  question_id: string;
  content: string;
  is_correct: boolean;
}

export interface CreateQuizInput {
  user_id: string;
  title: string;
  description?: string;
  topic_id?: string;
}

export interface CreateExamInput {
  user_id: string;
  title: string;
  description?: string;
  duration_minutes: number;
  passing_score?: number;
  topic_id?: string;
}

export interface CreateExamSessionInput {
  exam_id: string;
  user_id: string;
}

export interface CreateUserAnswerInput {
  user_id: string;
  question_id: string;
  session_id?: string;
  quiz_id?: string;
  selected_option_id?: string;
  text_answer?: string;
  is_correct?: boolean;
  time_taken_seconds?: number;
}

export interface CreateFlashcardInput {
  user_id: string;
  question: string;
  answer: string;
  topic_id?: string;
  source_question_id?: string;
  tags?: string[];
}

// =============================================
// Update Types
// =============================================

export interface UpdateUserInput {
  first_name?: string;
  last_name?: string;
  institution?: string;
  field_of_study?: string;
}

export interface UpdateQuizInput {
  title?: string;
  description?: string;
  topic_id?: string;
}

export interface UpdateExamInput {
  title?: string;
  description?: string;
  duration_minutes?: number;
  passing_score?: number;
  topic_id?: string;
}

export interface UpdateExamSessionInput {
  end_time?: string;
  status?: "in_progress" | "completed" | "timed_out";
  total_score?: number;
}

export interface UpdateFlashcardInput {
  question?: string;
  answer?: string;
  topic_id?: string;
  next_review_date?: string;
  interval_days?: number;
  ease_factor?: number;
  repetitions?: number;
  mastery_status?: "learning" | "under_review" | "mastered";
  consecutive_correct?: number;
  tags?: string[];
}

// =============================================
// Extended Types with Relations
// =============================================

export interface QuestionWithOptions extends Question {
  question_options: QuestionOption[];
  topic?: Topic;
  explanation?: Explanation;
}

export interface QuizWithQuestions extends Quiz {
  quiz_questions: (QuizQuestion & {
    questions: QuestionWithOptions;
  })[];
  topic?: Topic;
  user: User;
}

export interface ExamWithQuestions extends Exam {
  exam_questions: (ExamQuestion & {
    questions: QuestionWithOptions;
  })[];
  topic?: Topic;
  user: User;
}

export interface ExamSessionWithDetails extends ExamSession {
  exams: ExamWithQuestions;
  user: User;
  user_answers: UserAnswer[];
}

export interface UserAnswerWithDetails extends UserAnswer {
  questions: QuestionWithOptions;
  selected_option?: QuestionOption;
  exam_sessions?: ExamSession;
  quizzes?: Quiz;
}

export interface FlashcardWithTopic extends Flashcard {
  topic?: Topic;
  source_question?: QuestionWithOptions;
}

export interface TopicWithProgress extends Topic {
  user_topic_progress?: UserTopicProgress[];
  parent_topic?: Topic;
  child_topics?: Topic[];
}

// =============================================
// Dashboard & Statistics Types
// =============================================

export interface DashboardStats {
  totalQuizzes: number;
  totalExams: number;
  totalFlashcards: number;
  averageScore: number;
  studyStreak: number;
  questionsAnswered: number;
  correctAnswers: number;
}

export interface RecentActivity {
  id: string;
  type: "quiz" | "exam" | "flashcard";
  title: string;
  score?: number;
  completed_at: string;
  topic?: string;
}

export interface TopicProgress {
  topic_id: string;
  topic_name: string;
  progress_percentage: number;
  questions_attempted: number;
  questions_correct: number;
  last_activity: string;
}

// =============================================
// API Response Types
// =============================================

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}

// =============================================
// Database Table Names (for Supabase queries)
// =============================================

export const TABLE_NAMES = {
  USERS: "users",
  TOPICS: "topics",
  QUESTIONS: "questions",
  QUESTION_OPTIONS: "question_options",
  QUIZZES: "quizzes",
  QUIZ_QUESTIONS: "quiz_questions",
  EXAMS: "exams",
  EXAM_QUESTIONS: "exam_questions",
  EXAM_SESSIONS: "exam_sessions",
  USER_ANSWERS: "user_answers",
  FLASHCARDS: "flashcards",
  EXPLANATIONS: "explanations",
  RESOURCES: "resources",
  QUESTION_RESOURCES: "question_resources",
  USER_ANALYTICS: "user_analytics",
  EXAM_ANALYTICS: "exam_analytics",
  USER_TOPIC_PROGRESS: "user_topic_progress",
} as const;

export type TableName = (typeof TABLE_NAMES)[keyof typeof TABLE_NAMES];
