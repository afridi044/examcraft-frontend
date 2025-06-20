"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
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
  const { data: currentUser } = useCurrentUser();
  const [reviewData, setReviewData] = useState<ReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const quizId = params.quizId as string;

  useEffect(() => {
    if (currentUser && quizId) {
      fetchReviewData();
    }
  }, [currentUser, quizId]);

  const fetchReviewData = async () => {
    try {
      setLoading(true);
      const url = `/api/quiz/review/${quizId}?userId=${currentUser?.user_id}`;
      console.log("Fetching review data from:", url);
      console.log("Current user:", currentUser);

      const response = await fetch(url);

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log("Error response:", errorText);
        throw new Error(`Failed to fetch review data: ${response.status}`);
      }

      const data: ReviewData = await response.json();
      setReviewData(data);
    } catch (err) {
      console.error("Error fetching review data:", err);
      setError("Failed to load quiz review");
      toast.error("Failed to load quiz review");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getDifficultyLabel = (difficulty?: number) => {
    const labels = ["", "Beginner", "Easy", "Medium", "Hard", "Expert"];
    return labels[difficulty || 0] || "Unknown";
  };

  const getDifficultyColor = (difficulty?: number) => {
    const colors = [
      "",
      "text-green-400",
      "text-blue-400",
      "text-yellow-400",
      "text-orange-400",
      "text-red-400",
    ];
    return colors[difficulty || 0] || "text-gray-400";
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading quiz review...</p>
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
          <div className="flex items-center space-x-3">
            <Button
              onClick={() => router.push("/dashboard")}
              variant="outline"
              size="icon"
              className="border-gray-600 text-gray-400 hover:bg-gray-700/50"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Quiz Review: {reviewData.quiz.title}
              </h1>
              <p className="text-gray-400">
                {reviewData.quiz.description || "Review your quiz performance"}
              </p>
              {reviewData.quiz.topic && (
                <p className="text-sm text-purple-400 mt-1">
                  Topic: {reviewData.quiz.topic.name}
                </p>
              )}
            </div>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={() => router.push(`/quiz/take/${quizId}`)}
              variant="outline"
              className="border-purple-500 text-purple-400 hover:bg-purple-500/20"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Retake Quiz
            </Button>
          </div>
        </div>

        {/* Performance Summary */}
        <Card className="bg-gray-800/50 border-gray-700/50 p-6">
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
            const correctOption = question.question_options.find(
              (opt) => opt.is_correct
            );
            const userSelectedOption = question.question_options.find(
              (opt) =>
                opt.option_id === question.user_answer?.selected_option_id
            );

            return (
              <motion.div
                key={question.question_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-gray-800/50 border-gray-700/50 p-6">
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

                      let optionStyle = "border-gray-600 bg-gray-700/30";
                      let iconColor = "text-gray-400";

                      if (isCorrectOption) {
                        optionStyle = "border-green-500 bg-green-500/20";
                        iconColor = "text-green-500";
                      } else if (isUserSelected && !isCorrectOption) {
                        optionStyle = "border-red-500 bg-red-500/20";
                        iconColor = "text-red-500";
                      }

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
        <div className="flex justify-center space-x-4 pt-8">
          <Button
            onClick={() => router.push("/dashboard")}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            Return to Dashboard
          </Button>
          <Button
            onClick={() => router.push("/quiz/create")}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700/50"
          >
            Create New Quiz
          </Button>
          <Button
            onClick={() => router.push(`/quiz/take/${quizId}`)}
            variant="outline"
            className="border-purple-500 text-purple-400 hover:bg-purple-500/20"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Retake Quiz
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
}
