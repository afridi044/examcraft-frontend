// API Utilities for ExamCraft
// Helper functions for common operations and data transformations

import { supabase } from "@/lib/database";
import type {
  Question,
  Quiz,
  Exam,
  Flashcard,
  UserAnswer,
  QuestionWithOptions,
} from "@/types/database";

// Additional types for utility functions
interface TransformableQuiz {
  quiz_questions?: Array<{ questions: QuestionWithOptions }>;
  topic?: { name: string };
  created_at: string;
  [key: string]: unknown;
}

interface TransformableExam {
  exam_questions?: Array<{ questions: QuestionWithOptions }>;
  topic?: { name: string };
  created_at: string;
  duration_minutes: number;
  [key: string]: unknown;
}

interface TransformableFlashcard {
  topic?: { name: string };
  next_review_date?: string;
  created_at: string;
  [key: string]: unknown;
}

interface ExportableQuiz {
  title: string;
  description?: string;
  topic?: { name: string };
  quiz_questions?: Array<{
    questions: {
      content: string;
      question_type: string;
      difficulty?: number;
      question_options?: Array<{
        content: string;
        is_correct: boolean;
      }>;
      explanation?: { content: string };
    };
  }>;
  created_at: string;
}

interface ErrorWithMessage {
  message?: string;
  [key: string]: unknown;
}

// =============================================
// Authentication Utilities
// =============================================

export const authUtils = {
  // Get current authenticated user
  async getCurrentAuthUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  },

  // Sign out user
  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    try {
      const user = await this.getCurrentAuthUser();
      return !!user;
    } catch {
      return false;
    }
  },

  // Get user session
  async getSession() {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  },
};

// =============================================
// Data Transformation Utilities
// =============================================

export const transformUtils = {
  // Transform question for display
  transformQuestion(question: QuestionWithOptions) {
    return {
      ...question,
      options: question.question_options || [],
      correctOption: question.question_options?.find((opt) => opt.is_correct),
      topicName: question.topic?.name || "No Topic",
      hasExplanation: !!question.explanation,
    };
  },

  // Transform quiz for display
  transformQuiz(quiz: TransformableQuiz) {
    return {
      ...quiz,
      questionCount: quiz.quiz_questions?.length || 0,
      topicName: quiz.topic?.name || "No Topic",
      createdDate: new Date(quiz.created_at).toLocaleDateString(),
    };
  },

  // Transform exam for display
  transformExam(exam: TransformableExam) {
    return {
      ...exam,
      questionCount: exam.exam_questions?.length || 0,
      topicName: exam.topic?.name || "No Topic",
      createdDate: new Date(exam.created_at).toLocaleDateString(),
      durationText: `${exam.duration_minutes} minutes`,
    };
  },

  // Transform flashcard for display
  transformFlashcard(flashcard: TransformableFlashcard) {
    return {
      ...flashcard,
      topicName: flashcard.topic?.name || "No Topic",
      isReviewDue: flashcard.next_review_date
        ? new Date(flashcard.next_review_date) <= new Date()
        : true,
      createdDate: new Date(flashcard.created_at).toLocaleDateString(),
    };
  },

  // Transform user answer for analysis
  transformUserAnswer(answer: UserAnswer) {
    return {
      ...answer,
      isCorrect: answer.is_correct || false,
      timeSpent: answer.time_taken_seconds || 0,
      submittedDate: new Date(answer.created_at).toLocaleDateString(),
    };
  },
};

// =============================================
// Validation Utilities
// =============================================

export const validationUtils = {
  // Validate question data
  validateQuestion(question: Partial<Question>) {
    const errors: string[] = [];

    if (!question.content?.trim()) {
      errors.push("Question content is required");
    }

    if (!question.question_type) {
      errors.push("Question type is required");
    }

    if (
      question.difficulty &&
      (question.difficulty < 1 || question.difficulty > 5)
    ) {
      errors.push("Difficulty must be between 1 and 5");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Validate quiz data
  validateQuiz(quiz: Partial<Quiz>) {
    const errors: string[] = [];

    if (!quiz.title?.trim()) {
      errors.push("Quiz title is required");
    }

    if (!quiz.user_id) {
      errors.push("User ID is required");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Validate exam data
  validateExam(exam: Partial<Exam>) {
    const errors: string[] = [];

    if (!exam.title?.trim()) {
      errors.push("Exam title is required");
    }

    if (!exam.duration_minutes || exam.duration_minutes <= 0) {
      errors.push("Valid duration is required");
    }

    if (!exam.user_id) {
      errors.push("User ID is required");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Validate flashcard data
  validateFlashcard(flashcard: Partial<Flashcard>) {
    const errors: string[] = [];

    if (!flashcard.question?.trim()) {
      errors.push("Flashcard question is required");
    }

    if (!flashcard.answer?.trim()) {
      errors.push("Flashcard answer is required");
    }

    if (!flashcard.user_id) {
      errors.push("User ID is required");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  // Validate email
  validateEmail(email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
};

// =============================================
// Calculation Utilities
// =============================================

export const calculationUtils = {
  // Calculate quiz score
  calculateQuizScore(answers: UserAnswer[]): {
    score: number;
    percentage: number;
    correct: number;
    total: number;
  } {
    const total = answers.length;
    const correct = answers.filter((answer) => answer.is_correct).length;
    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

    return {
      score: correct,
      percentage,
      correct,
      total,
    };
  },

  // Calculate average time per question
  calculateAverageTime(answers: UserAnswer[]): number {
    const validTimes = answers
      .map((answer) => answer.time_taken_seconds)
      .filter(
        (time): time is number =>
          time !== undefined && time !== null && time > 0
      );

    if (validTimes.length === 0) return 0;

    const total = validTimes.reduce((sum, time) => sum + time, 0);
    return Math.round(total / validTimes.length);
  },

  // Calculate topic proficiency
  calculateTopicProficiency(answers: UserAnswer[]): number {
    if (answers.length === 0) return 0;

    const correct = answers.filter((answer) => answer.is_correct).length;
    return Math.round((correct / answers.length) * 100);
  },

  // Calculate next review date for flashcard (spaced repetition)
  calculateNextReviewDate(
    currentInterval: number,
    easeFactor: number,
    quality: number // 0-5 scale (0=complete blackout, 5=perfect response)
  ): {
    nextInterval: number;
    newEaseFactor: number;
    nextReviewDate: string;
  } {
    let newEaseFactor = easeFactor;
    let nextInterval = currentInterval;

    if (quality >= 3) {
      // Correct response
      if (currentInterval === 1) {
        nextInterval = 6;
      } else {
        nextInterval = Math.round(currentInterval * easeFactor);
      }

      newEaseFactor =
        easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    } else {
      // Incorrect response - reset interval
      nextInterval = 1;
    }

    // Ensure ease factor doesn't go below 1.3
    newEaseFactor = Math.max(1.3, newEaseFactor);

    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + nextInterval);

    return {
      nextInterval,
      newEaseFactor: Math.round(newEaseFactor * 100) / 100, // Round to 2 decimal places
      nextReviewDate: nextReviewDate.toISOString(),
    };
  },

  // Calculate study streak
  calculateStudyStreak(activityDates: string[]): number {
    if (activityDates.length === 0) return 0;

    // Convert to date strings and sort
    const dates = activityDates
      .map((date) => new Date(date).toDateString())
      .filter((date, index, arr) => arr.indexOf(date) === index) // Remove duplicates
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;

    for (let i = 0; i < dates.length; i++) {
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);

      if (dates[i] === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  },
};

// =============================================
// Formatting Utilities
// =============================================

export const formatUtils = {
  // Format time duration
  formatDuration(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = seconds % 60;
      return remainingSeconds > 0
        ? `${minutes}m ${remainingSeconds}s`
        : `${minutes}m`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
    }
  },

  // Format score with percentage
  formatScore(correct: number, total: number): string {
    if (total === 0) return "0%";
    const percentage = Math.round((correct / total) * 100);
    return `${correct}/${total} (${percentage}%)`;
  },

  // Format relative time (e.g., "2 hours ago")
  formatRelativeTime(date: string | Date): string {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60)
      return `${diffMinutes} minute${diffMinutes === 1 ? "" : "s"} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours === 1 ? "" : "s"} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? "" : "s"} ago`;

    return past.toLocaleDateString();
  },

  // Format difficulty level
  formatDifficulty(level: number): string {
    const levels = ["", "Beginner", "Easy", "Medium", "Hard", "Expert"];
    return levels[level] || "Unknown";
  },

  // Format question type
  formatQuestionType(type: string): string {
    const types: Record<string, string> = {
      "multiple-choice": "Multiple Choice",
      "true-false": "True/False",
      "fill-in-blank": "Fill in the Blank",
    };
    return types[type] || type;
  },
};

// =============================================
// Search and Filter Utilities
// =============================================

export const searchUtils = {
  // Search questions by content
  searchQuestions(
    questions: QuestionWithOptions[],
    query: string
  ): QuestionWithOptions[] {
    if (!query.trim()) return questions;

    const searchTerm = query.toLowerCase();
    return questions.filter(
      (question) =>
        question.content.toLowerCase().includes(searchTerm) ||
        question.topic?.name.toLowerCase().includes(searchTerm) ||
        question.question_options?.some((option) =>
          option.content.toLowerCase().includes(searchTerm)
        )
    );
  },

  // Filter questions by criteria
  filterQuestions(
    questions: QuestionWithOptions[],
    filters: {
      topicId?: string;
      difficulty?: number;
      questionType?: string;
    }
  ): QuestionWithOptions[] {
    return questions.filter((question) => {
      if (filters.topicId && question.topic_id !== filters.topicId)
        return false;
      if (filters.difficulty && question.difficulty !== filters.difficulty)
        return false;
      if (
        filters.questionType &&
        question.question_type !== filters.questionType
      )
        return false;
      return true;
    });
  },

  // Sort questions by criteria
  sortQuestions(
    questions: QuestionWithOptions[],
    sortBy: "created_at" | "difficulty" | "topic" | "type",
    order: "asc" | "desc" = "desc"
  ): QuestionWithOptions[] {
    return [...questions].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "created_at":
          comparison =
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case "difficulty":
          comparison = (a.difficulty || 0) - (b.difficulty || 0);
          break;
        case "topic":
          comparison = (a.topic?.name || "").localeCompare(b.topic?.name || "");
          break;
        case "type":
          comparison = a.question_type.localeCompare(b.question_type);
          break;
      }

      return order === "asc" ? comparison : -comparison;
    });
  },
};

// =============================================
// Export Utilities
// =============================================

export const exportUtils = {
  // Export quiz data to JSON
  exportQuizToJSON(quiz: ExportableQuiz): string {
    const exportData = {
      title: quiz.title,
      description: quiz.description,
      topic: quiz.topic?.name,
      questions: quiz.quiz_questions?.map((qq) => ({
        content: qq.questions.content,
        type: qq.questions.question_type,
        difficulty: qq.questions.difficulty,
        options: qq.questions.question_options?.map((opt) => ({
          content: opt.content,
          isCorrect: opt.is_correct,
        })),
        explanation: qq.questions.explanation?.content,
      })),
      createdAt: quiz.created_at,
    };

    return JSON.stringify(exportData, null, 2);
  },

  // Export user answers to CSV
  exportAnswersToCSV(answers: UserAnswer[]): string {
    const headers = [
      "Date",
      "Question ID",
      "Correct",
      "Time Taken (s)",
      "Quiz ID",
      "Session ID",
    ];
    const rows = answers.map((answer) => [
      new Date(answer.created_at).toLocaleDateString(),
      answer.question_id,
      answer.is_correct ? "Yes" : "No",
      answer.time_taken_seconds || 0,
      answer.quiz_id || "",
      answer.session_id || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    return csvContent;
  },
};

// =============================================
// Error Handling Utilities
// =============================================

export const errorUtils = {
  // Parse Supabase error
  parseSupabaseError(error: ErrorWithMessage): string {
    if (error?.message) {
      // Common Supabase error messages
      if (error.message.includes("duplicate key")) {
        return "This item already exists";
      }
      if (error.message.includes("foreign key")) {
        return "Invalid reference to related data";
      }
      if (error.message.includes("not found")) {
        return "The requested item was not found";
      }
      if (error.message.includes("permission denied")) {
        return "You do not have permission to perform this action";
      }

      return error.message;
    }

    return "An unexpected error occurred";
  },

  // Create user-friendly error message
  createErrorMessage(operation: string, error: ErrorWithMessage): string {
    const baseMessage = `Failed to ${operation}`;
    const details = this.parseSupabaseError(error);
    return `${baseMessage}: ${details}`;
  },
};

// =============================================
// Local Storage Utilities
// =============================================

export const storageUtils = {
  // Save data to localStorage
  save<T>(key: string, data: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.warn("Failed to save to localStorage:", error);
    }
  },

  // Load data from localStorage
  load<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.warn("Failed to load from localStorage:", error);
      return null;
    }
  },

  // Remove data from localStorage
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn("Failed to remove from localStorage:", error);
    }
  },

  // Clear all app data from localStorage
  clearAppData(): void {
    const keys = Object.keys(localStorage).filter((key) =>
      key.startsWith("examcraft-")
    );
    keys.forEach((key) => this.remove(key));
  },
};

// =============================================
// Export all utilities
// =============================================

export const apiUtils = {
  auth: authUtils,
  transform: transformUtils,
  validation: validationUtils,
  calculation: calculationUtils,
  format: formatUtils,
  search: searchUtils,
  export: exportUtils,
  error: errorUtils,
  storage: storageUtils,
};

export default apiUtils;
