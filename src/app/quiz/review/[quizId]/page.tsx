"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle,
  XCircle,
  Clock,
  Trophy,
  Target,
  Brain,
  Lightbulb,
  RotateCcw,
  CreditCard,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentUser } from "@/hooks/useDatabase";
import toast from "react-hot-toast";

interface ReviewData {
  quiz: {
    quiz_id: string;
    title: string;
    description?: string;
    topic?: {
      name: string;
    };
  };
  questions: Array<{
    question_id: string;
    content: string;
    question_type: string;
    difficulty?: number;
    question_options: Array<{
      option_id: string;
      content: string;
      is_correct: boolean;
    }>;
    explanation?: {
      content: string;
      ai_generated: boolean;
    };
    user_answer?: {
      selected_option_id?: string;
      text_answer?: string;
      is_correct: boolean;
      time_taken_seconds?: number;
    };
  }>;
  quiz_stats: {
    total_questions: number;
    correct_answers: number;
    percentage: number;
    total_time: number;
  };
}

export default function QuizReviewPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading, signingOut } = useAuth();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flashcardStates, setFlashcardStates] = useState<
    Record<string, "idle" | "creating" | "created" | "exists">
  >({});

  const quizId = params.quizId as string;

  // Redirect to landing page if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [authLoading, user, router]);

  // Simplified loading logic
  const isAuthenticating = authLoading || !user;
  const isLoadingUserData = userLoading || !currentUser;
  const isLoadingReviewData = dataLoading;
  
  // Show loading screen only when necessary and not signing out
  const showLoadingScreen = !signingOut && (isAuthenticating || isLoadingUserData || isLoadingReviewData);

  useEffect(() => {
    if (currentUser && quizId) {
      fetchReviewData();
    }
  }, [currentUser, quizId]);

  // OPTIMIZED: Cleaner data fetching with useCallback
  const fetchReviewData = useCallback(async () => {
    try {
      setDataLoading(true);
      const url = `/api/quiz/review/${quizId}?userId=${currentUser?.user_id}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch review data: ${response.status}`);
      }

      const data: ReviewData = await response.json();
      setReviewData(data);
    } catch {
      setError("Failed to load quiz review");
      toast.error("Failed to load quiz review");
    } finally {
      setDataLoading(false);
    }
  }, [quizId, currentUser?.user_id]);

  // OPTIMIZED: Memoized utility functions
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const difficultyConfig = useMemo(
    () => ({
      labels: ["", "Beginner", "Easy", "Medium", "Hard", "Expert"],
      colors: [
        "",
        "text-green-400",
        "text-blue-400",
        "text-yellow-400",
        "text-orange-400",
        "text-red-400",
      ],
    }),
    []
  );

  const getDifficultyLabel = useCallback(
    (difficulty?: number) => {
      return difficultyConfig.labels[difficulty || 0] || "Unknown";
    },
    [difficultyConfig.labels]
  );

  const getDifficultyColor = useCallback(
    (difficulty?: number) => {
      return difficultyConfig.colors[difficulty || 0] || "text-gray-400";
    },
    [difficultyConfig.colors]
  );

  const generateFlashcard = async (questionId: string) => {
    if (!currentUser) {
      toast.error("Please log in to create flashcards");
      return;
    }

    setFlashcardStates((prev) => ({ ...prev, [questionId]: "creating" }));

    try {
      const response = await fetch("/api/flashcards/generate-from-question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: currentUser.user_id,
          question_id: questionId,
          quiz_id: quizId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setFlashcardStates((prev) => ({ ...prev, [questionId]: "created" }));
        toast.success("Flashcard created successfully!");

        // Reset to idle after 3 seconds to show the success state briefly
        setTimeout(() => {
          setFlashcardStates((prev) => ({ ...prev, [questionId]: "idle" }));
        }, 3000);
      } else if (response.status === 409) {
        // Flashcard already exists
        setFlashcardStates((prev) => ({ ...prev, [questionId]: "exists" }));
        toast("Flashcard already exists for this question");
      } else {
        throw new Error(data.error || "Failed to create flashcard");
      }
    } catch (error) {
      setFlashcardStates((prev) => ({ ...prev, [questionId]: "idle" }));
      toast.error(
        error instanceof Error ? error.message : "Failed to create flashcard"
      );
    }
  };

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
              Loading Quiz Review...
            </h2>
            <p className="text-gray-400">
              Preparing your review experience
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !reviewData) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="bg-gray-800/50 border-gray-700/50 p-8 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">
              Review Not Available
            </h2>
            <p className="text-gray-400 mb-4">
              {error || "Unable to load quiz review data"}
            </p>
            <Button
              onClick={() => router.push("/dashboard")}
              className="bg-purple-500 hover:bg-purple-600"
            >
              Return to Dashboard
            </Button>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-20 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => router.push("/dashboard")}
              variant="outline"
              size="icon"
              className="border-gray-600/50 text-gray-400 hover:border-purple-400 hover:text-purple-400 hover:bg-purple-500/10 transition-all duration-200"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Quiz Review: {reviewData.quiz.title}
              </h1>
              <p className="text-gray-400 text-lg">
                {reviewData.quiz.description || "Review your quiz performance"}
              </p>
              {reviewData.quiz.topic && (
                <p className="text-sm text-purple-400 mt-1 font-medium">
                  Topic: {reviewData.quiz.topic.name}
                </p>
              )}
            </div>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={() => router.push(`/quiz/take/${quizId}`)}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-medium px-6 py-2 shadow-lg hover:shadow-purple-500/25 transition-all duration-200"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Retake Quiz
            </Button>
          </div>
        </div>

        {/* Performance Summary */}
        <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 border-gray-700/50 p-8 shadow-xl">
          <div className="flex items-center space-x-3 mb-6">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <h2 className="text-xl font-bold text-white">
              Performance Summary
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-2">
                {reviewData.quiz_stats.percentage}%
              </div>
              <div className="text-gray-400">Overall Score</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-2">
                {reviewData.quiz_stats.correct_answers}/
                {reviewData.quiz_stats.total_questions}
              </div>
              <div className="text-gray-400">Correct Answers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-2">
                {reviewData.questions.length}
              </div>
              <div className="text-gray-400">Total Questions</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-400 mb-2">
                {formatTime(reviewData.quiz_stats.total_time)}
              </div>
              <div className="text-gray-400">Total Time</div>
            </div>
          </div>
        </Card>

        {/* Questions Review */}
        <div className="space-y-6">
          <div className="flex items-center space-x-3">
            <BookOpen className="h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-bold text-white">Question Review</h2>
          </div>

          {reviewData.questions.map((question, index) => {
            const isCorrect = question.user_answer?.is_correct ?? false;

            return (
              <motion.div
                key={question.question_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: Math.min(index * 0.05, 0.3), // OPTIMIZED: Reduced delay and capped
                  duration: 0.3,
                }}
              >
                <Card className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border-gray-700/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  {/* Question Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          Question {index + 1}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm">
                          <span
                            className={`${getDifficultyColor(question.difficulty)}`}
                          >
                            <Target className="h-3 w-3 inline mr-1" />
                            {getDifficultyLabel(question.difficulty)}
                          </span>
                          {question.user_answer?.time_taken_seconds && (
                            <span className="text-gray-400">
                              <Clock className="h-3 w-3 inline mr-1" />
                              {formatTime(
                                question.user_answer.time_taken_seconds
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {/* Flashcard Generation Button */}
                      <Button
                        size="sm"
                        onClick={() => generateFlashcard(question.question_id)}
                        disabled={
                          flashcardStates[question.question_id] === "creating"
                        }
                        className={`
                          relative overflow-hidden transition-all duration-300 font-medium
                          ${
                            flashcardStates[question.question_id] === "created"
                              ? "bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg shadow-green-500/25 border-0"
                              : flashcardStates[question.question_id] ===
                                  "exists"
                                ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25 border-0"
                                : flashcardStates[question.question_id] ===
                                    "creating"
                                  ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/25 border-0 cursor-not-allowed"
                                  : "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-lg hover:shadow-indigo-500/25 border-0"
                          }
                        `}
                        title={
                          flashcardStates[question.question_id] === "created"
                            ? "Flashcard created successfully!"
                            : flashcardStates[question.question_id] === "exists"
                              ? "Flashcard already exists for this question"
                              : "Create flashcard from this question"
                        }
                      >
                        <div className="flex items-center space-x-2">
                          {flashcardStates[question.question_id] ===
                          "creating" ? (
                            <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                          ) : flashcardStates[question.question_id] ===
                            "created" ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <CreditCard className="h-4 w-4" />
                          )}
                          <span className="hidden sm:inline">
                            {flashcardStates[question.question_id] === "created"
                              ? "Created!"
                              : flashcardStates[question.question_id] ===
                                  "exists"
                                ? "Exists"
                                : flashcardStates[question.question_id] ===
                                    "creating"
                                  ? "Creating..."
                                  : "Flashcard"}
                          </span>
                        </div>
                      </Button>

                      {/* Correct/Incorrect Status */}
                      <div className="flex items-center space-x-2">
                        {isCorrect ? (
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        ) : (
                          <XCircle className="h-6 w-6 text-red-500" />
                        )}
                        <span
                          className={`font-medium ${isCorrect ? "text-green-400" : "text-red-400"}`}
                        >
                          {isCorrect ? "Correct" : "Incorrect"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Question Content */}
                  <div className="mb-6">
                    <p className="text-gray-200 text-lg leading-relaxed">
                      {question.content}
                    </p>
                  </div>

                  {/* Answer Options */}
                  <div className="space-y-3 mb-6">
                    {question.question_options.map((option, optionIndex) => {
                      const isUserSelected =
                        option.option_id ===
                        question.user_answer?.selected_option_id;
                      const isCorrectOption = option.is_correct;

                      // OPTIMIZED: Simplified styling logic
                      const optionStyle = isCorrectOption
                        ? "border-green-500 bg-green-500/20"
                        : isUserSelected && !isCorrectOption
                          ? "border-red-500 bg-red-500/20"
                          : "border-gray-600 bg-gray-700/30";

                      return (
                        <div
                          key={option.option_id}
                          className={`p-4 rounded-lg border ${optionStyle}`}
                        >
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                                isCorrectOption
                                  ? "border-green-500"
                                  : isUserSelected
                                    ? "border-red-500"
                                    : "border-gray-500"
                              }`}
                            >
                              {isCorrectOption ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                              ) : isUserSelected ? (
                                <XCircle className="h-4 w-4 text-red-500" />
                              ) : (
                                <span className="text-gray-400 text-sm font-medium">
                                  {String.fromCharCode(65 + optionIndex)}
                                </span>
                              )}
                            </div>
                            <span
                              className={`flex-1 ${
                                isCorrectOption
                                  ? "text-green-300"
                                  : isUserSelected
                                    ? "text-red-300"
                                    : "text-gray-300"
                              }`}
                            >
                              {option.content}
                            </span>
                            {isCorrectOption && (
                              <span className="text-xs text-green-400 font-medium">
                                Correct Answer
                              </span>
                            )}
                            {isUserSelected && !isCorrectOption && (
                              <span className="text-xs text-red-400 font-medium">
                                Your Answer
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  {question.explanation && (
                    <div className="border-t border-gray-700/50 pt-4">
                      <div className="flex items-center space-x-2 mb-3">
                        <Lightbulb className="h-5 w-5 text-yellow-500" />
                        <h4 className="text-lg font-semibold text-white">
                          Explanation
                        </h4>
                        {question.explanation.ai_generated && (
                          <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded">
                            <Brain className="h-3 w-3 inline mr-1" />
                            AI Generated
                          </span>
                        )}
                      </div>
                      <p className="text-gray-300 leading-relaxed bg-gray-700/30 p-4 rounded-lg">
                        {question.explanation.content}
                      </p>
                    </div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-12">
          <Button
            onClick={() => router.push("/dashboard")}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium px-8 py-3 shadow-lg hover:shadow-purple-500/25 transition-all duration-200 w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Return to Dashboard
          </Button>
          <Button
            onClick={() => router.push("/quiz/create")}
            variant="outline"
            className="border-gray-600/50 text-gray-300 hover:border-blue-400 hover:text-blue-400 hover:bg-blue-500/10 font-medium px-8 py-3 transition-all duration-200 w-full sm:w-auto"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Create New Quiz
          </Button>
          <Button
            onClick={() => router.push(`/quiz/take/${quizId}`)}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-medium px-8 py-3 shadow-lg hover:shadow-blue-500/25 transition-all duration-200 w-full sm:w-auto"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Retake Quiz
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
