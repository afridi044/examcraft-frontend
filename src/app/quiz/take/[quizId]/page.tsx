"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentUser, useQuizWithQuestions } from "@/hooks/useDatabase";
import { motion } from "framer-motion";
import {
  Clock,
  CheckCircle,
  XCircle,
  ArrowLeft,
  ArrowRight,
  Flag,
  Trophy,
  BookOpen,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";

interface UserAnswer {
  question_id: string;
  selected_option_id?: string;
  text_answer?: string;
  is_correct?: boolean;
  time_taken_seconds: number;
}

interface QuizResult {
  score: number;
  percentage: number;
  correct_answers: number;
  total_questions: number;
  time_taken: string;
  answers: UserAnswer[];
}

export default function TakeQuizPage() {
  const router = useRouter();
  const params = useParams();
  const quizId = params.quizId as string;
  const { user, loading } = useAuth();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();

  // Redirect to landing page if not authenticated and not loading
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [loading, user, router]);

  // Only invalidate data if it's stale or on explicit user action
  // Removed automatic invalidation on mount for better performance

  // OPTIMIZED: Removed debug logging for performance
  const { data: quiz, isLoading } = useQuizWithQuestions(quizId);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Map<string, UserAnswer>>(
    new Map()
  );
  const [quizStartTime, setQuizStartTime] = useState<Date | null>(null);
  const [questionStartTime, setQuestionStartTime] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);

  // OPTIMIZED: Memoized derived values
  const {
    questions,
    currentQuestion,
    isLastQuestion,
    hasAnsweredCurrent,
    progressPercentage,
  } = useMemo(() => {
    const questions = quiz?.quiz_questions?.map((qq) => qq.questions) || [];
    const currentQuestion = questions[currentQuestionIndex];
    const isLastQuestion = currentQuestionIndex === questions.length - 1;
    const hasAnsweredCurrent = userAnswers.has(
      currentQuestion?.question_id || ""
    );
    const progressPercentage =
      questions.length > 0
        ? ((currentQuestionIndex + 1) / questions.length) * 100
        : 0;

    return {
      questions,
      currentQuestion,
      isLastQuestion,
      hasAnsweredCurrent,
      progressPercentage,
    };
  }, [quiz?.quiz_questions, currentQuestionIndex, userAnswers]);

  // OPTIMIZED: Timer with reduced update frequency
  useEffect(() => {
    if (!quizStartTime) return;

    const timer = setInterval(() => {
      const newTimeElapsed = Math.floor(
        (Date.now() - quizStartTime.getTime()) / 1000
      );
      setTimeElapsed((prev) =>
        prev !== newTimeElapsed ? newTimeElapsed : prev
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [quizStartTime]);

  // Initialize quiz
  useEffect(() => {
    if (quiz && !quizStartTime) {
      setQuizStartTime(new Date());
      setQuestionStartTime(new Date());
    }
  }, [quiz, quizStartTime]);

  // Update question start time when question changes
  useEffect(() => {
    setQuestionStartTime(new Date());
  }, [currentQuestionIndex]);

  // OPTIMIZED: Memoized time formatting
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }, []);

  const handleAnswerSelect = useCallback(
    (optionId: string, textAnswer?: string) => {
      if (!currentQuestion || !questionStartTime) return;

      const timeTaken = Math.floor(
        (Date.now() - questionStartTime.getTime()) / 1000
      );
      const correctOption = currentQuestion.question_options?.find(
        (opt) => opt.is_correct
      );
      const isCorrect = Boolean(
        correctOption?.option_id === optionId ||
          (textAnswer &&
            correctOption?.content.toLowerCase() === textAnswer.toLowerCase())
      );

      const answer: UserAnswer = {
        question_id: currentQuestion.question_id,
        selected_option_id: optionId || undefined, // Convert empty string to undefined
        text_answer: textAnswer || undefined, // Convert empty string to undefined
        is_correct: isCorrect,
        time_taken_seconds: timeTaken,
      };

      setUserAnswers((prev) =>
        new Map(prev).set(currentQuestion.question_id, answer)
      );
    },
    [currentQuestion, questionStartTime]
  );

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!currentUser || !quiz || !quizStartTime) return;

    setIsSubmitting(true);
    try {
      // Calculate results
      const totalQuestions = questions.length;
      const correctAnswers = Array.from(userAnswers.values()).filter(
        (a) => a.is_correct
      ).length;
      const score = Math.round((correctAnswers / totalQuestions) * 100);
      const totalTimeSeconds = Math.floor(
        (Date.now() - quizStartTime.getTime()) / 1000
      );

      // OPTIMIZED: Batch submit answers with minimal logging
      const submitPromises = Array.from(userAnswers.values()).map(
        async (answer) => {
          const payload = {
            user_id: currentUser.user_id,
            question_id: answer.question_id,
            quiz_id: quizId,
            selected_option_id: answer.selected_option_id || null,
            text_answer: answer.text_answer || null,
            is_correct: answer.is_correct,
            time_taken_seconds: answer.time_taken_seconds,
          };

          const response = await fetch("/api/quiz/submit-answer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            throw new Error(
              `Failed to submit answer for question ${answer.question_id}`
            );
          }

          return response.json();
        }
      );

      // Wait for all submissions to complete
      await Promise.all(submitPromises);

      const result: QuizResult = {
        score,
        percentage: score,
        correct_answers: correctAnswers,
        total_questions: totalQuestions,
        time_taken: formatTime(totalTimeSeconds),
        answers: Array.from(userAnswers.values()),
      };

      setQuizResult(result);
      toast.success("Quiz completed successfully!");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit quiz"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Improved loading logic - don't show loading state when user is signing out
  const isMainLoading = loading || (loading === false && user && userLoading) || (loading === false && user && !currentUser);
  const isDataLoading = isLoading;
  
  // Show full loading screen for both auth and initial data load, but not during sign out
  const showFullLoadingScreen = isMainLoading || isDataLoading;

  if (showFullLoadingScreen) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/50">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-pink-600/30 rounded-2xl blur-xl"></div>
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
              Loading Quiz...
            </h2>
            <p className="text-gray-400">
              Preparing your quiz questions
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!quiz || questions.length === 0) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Card className="bg-gray-800/50 border-gray-700/50 p-8 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">
              Quiz Not Found
            </h2>
            <p className="text-gray-400 mb-4">
              This quiz doesn't exist or has no questions.
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

  // Results View
  if (quizResult) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 sm:space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4 sm:space-y-6"
          >
            <div className="flex items-center justify-center space-x-3">
              <Trophy className="h-10 w-10 sm:h-12 sm:w-12 text-yellow-500" />
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Quiz Completed!</h1>
            </div>

            <Card className="bg-gray-800/50 border-gray-700/50 p-4 sm:p-6 lg:p-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-green-400">
                    {quizResult.percentage}%
                  </div>
                  <div className="text-gray-400 text-sm">Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-blue-400">
                    {quizResult.correct_answers}
                  </div>
                  <div className="text-gray-400 text-sm">Correct</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-purple-400">
                    {quizResult.total_questions}
                  </div>
                  <div className="text-gray-400 text-sm">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-orange-400">
                    {quizResult.time_taken}
                  </div>
                  <div className="text-gray-400 text-sm">Time</div>
                </div>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <Button
                  onClick={() => router.push(`/quiz/review/${quizId}`)}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 min-h-[48px]"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  Review Quiz & Explanations
                </Button>
                <Button
                  onClick={() => router.push("/dashboard")}
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700/50 min-h-[48px]"
                >
                  Return to Dashboard
                </Button>
                <Button
                  onClick={() => router.push("/quiz/create")}
                  variant="outline"
                  className="w-full border-gray-600 text-gray-300 hover:bg-gray-700/50 min-h-[48px]"
                >
                  Create Another Quiz
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  // Quiz Taking View
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        {/* Quiz Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => router.push("/dashboard")}
              variant="outline"
              size="icon"
              className="border-gray-600 text-gray-400 hover:bg-gray-700/50 flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-white truncate">{quiz.title}</h1>
              <p className="text-gray-400 text-sm sm:text-base truncate">{quiz.description}</p>
            </div>
          </div>
          <div className="flex items-center justify-between sm:justify-end space-x-4">
            <div className="flex items-center space-x-2 text-gray-300">
              <Clock className="h-4 w-4" />
              <span className="text-sm sm:text-base">{formatTime(timeElapsed)}</span>
            </div>
            <div className="text-gray-300 text-sm sm:text-base">
              {currentQuestionIndex + 1} / {questions.length}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Question Card - OPTIMIZED: Simplified animation */}
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="bg-gray-800/50 border-gray-700/50 p-4 sm:p-6 lg:p-8">
            <div className="space-y-4 sm:space-y-6">
              {/* Question */}
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-white">
                    Question {currentQuestionIndex + 1}
                  </h2>
                </div>
                <p className="text-base sm:text-lg text-gray-200 leading-relaxed">
                  {currentQuestion?.content}
                </p>
              </div>

              {/* Answer Options */}
              <div className="space-y-3">
                {currentQuestion?.question_type === "fill-in-blank" ? (
                  <div className="space-y-2">
                    <label className="text-gray-300 text-sm sm:text-base">Your Answer:</label>
                    <input
                      type="text"
                      value={
                        userAnswers.get(currentQuestion.question_id)
                          ?.text_answer || ""
                      }
                      onChange={(e) => handleAnswerSelect("", e.target.value)}
                      placeholder="Type your answer here..."
                      className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder:text-gray-400 min-h-[48px]"
                    />
                  </div>
                ) : (
                  currentQuestion?.question_options?.map((option, index) => {
                    const isSelected =
                      userAnswers.get(currentQuestion.question_id)
                        ?.selected_option_id === option.option_id;
                    return (
                      <button
                        key={option.option_id}
                        onClick={() => handleAnswerSelect(option.option_id)}
                        className={`w-full p-3 sm:p-4 text-left rounded-lg border transition-all min-h-[56px] ${
                          isSelected
                            ? "border-purple-500 bg-purple-500/20 text-purple-300"
                            : "border-gray-600 bg-gray-700/50 text-gray-300 hover:border-gray-500 hover:bg-gray-700/70"
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                              isSelected
                                ? "border-purple-500 bg-purple-500"
                                : "border-gray-500"
                            }`}
                          >
                            {isSelected && (
                              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                            )}
                          </div>
                          <span className="text-sm sm:text-base">{option.content}</span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
          <Button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700/50 disabled:opacity-50 w-full sm:w-auto min-h-[48px]"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-2 sm:pb-0">
            {questions.map((question, index) => {
              const isAnswered = userAnswers.has(question?.question_id || "");
              const isCurrent = index === currentQuestionIndex;

              return (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full text-sm transition-all flex-shrink-0 ${
                    isCurrent
                      ? "bg-purple-500 text-white"
                      : isAnswered
                        ? "bg-green-500 text-white"
                        : "bg-gray-700 text-gray-400 hover:bg-gray-600"
                  }`}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>

          {isLastQuestion ? (
            <Button
              onClick={handleSubmitQuiz}
              disabled={isSubmitting || !hasAnsweredCurrent}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:opacity-50 w-full sm:w-auto min-h-[48px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Flag className="h-4 w-4 mr-2" />
                  Submit Quiz
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={handleNextQuestion}
              disabled={!hasAnsweredCurrent}
              className="bg-purple-500 hover:bg-purple-600 disabled:opacity-50 w-full sm:w-auto min-h-[48px]"
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
