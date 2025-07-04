import { NextRequest, NextResponse } from "next/server";
import { db, supabase } from "@/lib/database";

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
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const { quizId } = await params;

    // Get quiz with questions and explanations
    const quizResponse = await db.quizzes.getQuizWithQuestions(quizId);

    if (!quizResponse.success || !quizResponse.data) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const quiz = quizResponse.data;

    // Get user answers for this quiz
    const answersResponse = await db.answers.getUserAnswers(userId, {
      quizId: quizId,
    });

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

    // Get explanations separately (since nested query isn't working)
    const questionIds = quiz.quiz_questions.map(
      (qq) => qq.questions.question_id
    );
    const { data: explanations, error: explanationsError } = await supabase
      .from("explanations")
      .select("*")
      .in("question_id", questionIds);

    // Silently handle explanation errors - review can work without them

    // Create explanation map
    const explanationMap = new Map();
    (explanations || []).forEach((explanation) => {
      explanationMap.set(explanation.question_id, explanation);
    });

    // Build review data
    const questions = quiz.quiz_questions
      .sort((a, b) => a.question_order - b.question_order)
      .map((quizQuestion) => {
        const question = quizQuestion.questions;
        const explanation = explanationMap.get(question.question_id);

        return {
          question_id: question.question_id,
          content: question.content,
          question_type: question.question_type,
          difficulty: question.difficulty,
          question_options: question.question_options || [],
          explanation: explanation
            ? {
                content: explanation.content,
                ai_generated: explanation.ai_generated,
              }
            : undefined,
          user_answer: userAnswerMap.get(question.question_id) || null,
        };
      });

    // OPTIMIZED: Calculate quiz stats in a single pass
    const totalQuestions = questions.length;
    let correctAnswers = 0;
    let totalTime = 0;

    // Combined calculation for efficiency
    questions.forEach((question) => {
      if (question.user_answer?.is_correct === true) {
        correctAnswers++;
      }
    });

    userAnswers.forEach((answer) => {
      totalTime += answer.time_taken_seconds || 0;
    });

    const percentage =
      totalQuestions > 0
        ? Math.round((correctAnswers / totalQuestions) * 100)
        : 0;

    const reviewData: ReviewData = {
      quiz: {
        quiz_id: quiz.quiz_id,
        title: quiz.title,
        description: quiz.description,
        topic: quiz.topic ? { name: quiz.topic.name } : undefined,
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
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch quiz review data" },
      { status: 500 }
    );
  }
}
