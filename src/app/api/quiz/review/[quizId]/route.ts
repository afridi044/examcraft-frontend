import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database";

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

export async function GET(
  request: NextRequest,
  { params }: { params: { quizId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    console.log("Quiz Review API - QuizId:", params.quizId, "UserId:", userId);

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const quizId = params.quizId;

    // Get quiz with questions and explanations
    console.log("Fetching quiz with questions...");
    const quizResponse = await db.quizzes.getQuizWithQuestions(quizId);
    console.log("Quiz response:", quizResponse.success, quizResponse.error);

    if (!quizResponse.success || !quizResponse.data) {
      console.log("Quiz not found or error:", quizResponse.error);
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const quiz = quizResponse.data;

    // Get user answers for this quiz
    console.log("Fetching user answers...");
    const answersResponse = await db.answers.getUserAnswers(userId, {
      quizId: quizId,
    });
    console.log(
      "Answers response:",
      answersResponse.success,
      answersResponse.error,
      "Count:",
      answersResponse.data?.length
    );

    const userAnswers = answersResponse.success
      ? answersResponse.data || []
      : [];

    // Create a map of user answers by question_id
    const userAnswerMap = new Map();
    userAnswers.forEach((answer) => {
      userAnswerMap.set(answer.question_id, {
        selected_option_id: answer.selected_option_id,
        text_answer: answer.text_answer,
        is_correct: answer.is_correct,
        time_taken_seconds: answer.time_taken_seconds,
      });
    });

    // Build review data
    const questions = quiz.quiz_questions
      .sort((a, b) => a.question_order - b.question_order)
      .map((quizQuestion) => {
        const question = quizQuestion.questions;
        return {
          question_id: question.question_id,
          content: question.content,
          question_type: question.question_type,
          difficulty: question.difficulty,
          question_options: question.question_options || [],
          explanation: question.explanations?.[0] || null,
          user_answer: userAnswerMap.get(question.question_id) || null,
        };
      });

    // Calculate quiz stats
    const totalQuestions = questions.length;

    // Count correct answers by checking each question's user answer
    let correctAnswers = 0;
    questions.forEach((question) => {
      if (question.user_answer?.is_correct === true) {
        correctAnswers++;
      }
    });

    const percentage =
      totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : 0;
    const totalTime = userAnswers.reduce(
      (sum, answer) => sum + (answer.time_taken_seconds || 0),
      0
    );

    const reviewData: ReviewData = {
      quiz: {
        quiz_id: quiz.quiz_id,
        title: quiz.title,
        description: quiz.description,
        topic: quiz.topics ? { name: quiz.topics.name } : undefined,
      },
      questions,
      quiz_stats: {
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
        percentage,
        total_time: totalTime,
      },
    };

    return NextResponse.json(reviewData);
  } catch (error) {
    console.error("Quiz review API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz review data" },
      { status: 500 }
    );
  }
}
