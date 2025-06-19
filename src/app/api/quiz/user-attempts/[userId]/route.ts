import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // First, get all quizzes created by the user
    const { data: allQuizzes, error: quizzesError } = await supabase
      .from("quizzes")
      .select(
        `
        quiz_id,
        title,
        description,
        created_at,
        topics:topic_id (
          name
        )
      `
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (quizzesError) {
      console.error("Error fetching quizzes:", quizzesError);
      return NextResponse.json(
        { error: "Failed to fetch quizzes" },
        { status: 500 }
      );
    }

    // Get all user answers for these quizzes
    const { data: quizAnswers, error: answersError } = await supabase
      .from("user_answers")
      .select(
        `
        quiz_id,
        question_id,
        selected_option_id,
        text_answer,
        is_correct,
        time_taken_seconds,
        created_at
      `
      )
      .eq("user_id", userId)
      .not("quiz_id", "is", null)
      .order("created_at", { ascending: false }); // Latest answers first

    if (answersError) {
      console.error("Error fetching quiz answers:", answersError);
      return NextResponse.json(
        { error: "Failed to fetch quiz attempts" },
        { status: 500 }
      );
    }

    console.log("All quizzes found:", allQuizzes?.length || 0);
    console.log("Quiz answers found:", quizAnswers?.length || 0);

    // Debug: Log some sample answers
    if (quizAnswers && quizAnswers.length > 0) {
      console.log(
        "Sample answers:",
        quizAnswers.slice(0, 3).map((a) => ({
          quiz_id: a.quiz_id,
          question_id: a.question_id,
          is_correct: a.is_correct,
          created_at: a.created_at,
          selected_option_id: a.selected_option_id,
          text_answer: a.text_answer,
        }))
      );
    }

    if (!allQuizzes || allQuizzes.length === 0) {
      console.log("No quizzes found for user:", userId);
      return NextResponse.json([]);
    }

    // Group answers by quiz and deduplicate by question_id (keep latest answer only)
    const answersGroupedByQuiz = new Map();
    quizAnswers?.forEach((answer: any) => {
      const quizId = answer.quiz_id;
      if (!answersGroupedByQuiz.has(quizId)) {
        answersGroupedByQuiz.set(quizId, new Map()); // Map of question_id -> answer
      }

      const quizAnswers = answersGroupedByQuiz.get(quizId);
      const questionId = answer.question_id;

      // Check if this is a valid answer (has either selected_option_id or text_answer)
      const hasValidAnswer =
        answer.selected_option_id ||
        (answer.text_answer && answer.text_answer.trim() !== "");

      // Debug logging for this specific quiz
      if (answer.quiz_id === "48dc227e-fb73-427d-a5ee-ec8d6ddcecd5") {
        console.log("Validating answer for quiz 48dc227e:", {
          question_id: answer.question_id,
          selected_option_id: answer.selected_option_id,
          text_answer: answer.text_answer,
          hasValidAnswer: hasValidAnswer,
          created_at: answer.created_at,
        });
      }

      // Only keep the latest answer for each question (since we ordered by created_at desc)
      // and only if it's a valid answer
      // Note: With the new delete-then-insert logic, there should only be one answer per question now
      if (hasValidAnswer && !quizAnswers.has(questionId)) {
        quizAnswers.set(questionId, answer);
      }
    });

    // Get question counts for each quiz
    const quizIds = allQuizzes.map((q) => q.quiz_id);
    const { data: quizQuestions, error: questionsError } = await supabase
      .from("quiz_questions")
      .select("quiz_id, question_id")
      .in("quiz_id", quizIds);

    if (questionsError) {
      console.error("Error fetching quiz questions:", questionsError);
    }

    // Group questions by quiz
    const questionsGroupedByQuiz = new Map();
    quizQuestions?.forEach((qq: any) => {
      const quizId = qq.quiz_id;
      if (!questionsGroupedByQuiz.has(quizId)) {
        questionsGroupedByQuiz.set(quizId, []);
      }
      questionsGroupedByQuiz.get(quizId).push(qq);
    });

    // Process each quiz to determine its status and statistics
    const quizHistory = allQuizzes.map((quiz: any) => {
      const quizId = quiz.quiz_id;
      const answers = answersGroupedByQuiz.get(quizId) || new Map();
      const questions = questionsGroupedByQuiz.get(quizId) || [];
      const totalQuestions = questions.length;

      if (totalQuestions === 0) {
        // Quiz has no questions
        return {
          quiz_id: quizId,
          title: quiz.title,
          topic_name: quiz.topics?.name,
          created_at: quiz.created_at,
          status: "empty",
          total_questions: 0,
          correct_answers: 0,
          score_percentage: 0,
          time_spent_minutes: 0,
          completion_status: "No questions available",
        };
      }

      if (answers.size === 0) {
        // Quiz created but never attempted
        return {
          quiz_id: quizId,
          title: quiz.title,
          topic_name: quiz.topics?.name,
          created_at: quiz.created_at,
          completed_at: null,
          status: "not_attempted",
          total_questions: totalQuestions,
          correct_answers: 0,
          score_percentage: 0,
          time_spent_minutes: 0,
          completion_status: "Not attempted",
        };
      }

      if (answers.size < totalQuestions) {
        // Quiz partially completed
        const correctAnswers = Array.from(answers.values()).filter(
          (a: any) => a.is_correct
        ).length;
        const totalTime = Array.from(answers.values()).reduce(
          (sum: number, a: any) => sum + (a.time_taken_seconds || 0),
          0
        );
        const latestAttempt = Array.from(answers.values()).reduce(
          (latest: string, a: any) =>
            new Date(a.created_at) > new Date(latest) ? a.created_at : latest,
          answers.values().next().value.created_at
        );

        return {
          quiz_id: quizId,
          title: quiz.title,
          topic_name: quiz.topics?.name,
          created_at: quiz.created_at,
          completed_at: latestAttempt,
          status: "incomplete",
          total_questions: totalQuestions,
          answered_questions: answers.size,
          correct_answers: correctAnswers,
          score_percentage:
            Math.round((correctAnswers / totalQuestions) * 100 * 10) / 10,
          time_spent_minutes: Math.round((totalTime / 60) * 10) / 10,
          completion_status: `${answers.size}/${totalQuestions} questions answered`,
        };
      }

      // Quiz fully completed
      const correctAnswers = Array.from(answers.values()).filter(
        (a: any) => a.is_correct
      ).length;
      const totalTime = Array.from(answers.values()).reduce(
        (sum: number, a: any) => sum + (a.time_taken_seconds || 0),
        0
      );
      const latestAttempt = Array.from(answers.values()).reduce(
        (latest: string, a: any) =>
          new Date(a.created_at) > new Date(latest) ? a.created_at : latest,
        answers.values().next().value.created_at
      );

      return {
        quiz_id: quizId,
        title: quiz.title,
        topic_name: quiz.topics?.name,
        created_at: quiz.created_at,
        completed_at: latestAttempt,
        status: "completed",
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
        score_percentage:
          Math.round((correctAnswers / totalQuestions) * 100 * 10) / 10,
        time_spent_minutes: Math.round((totalTime / 60) * 10) / 10,
        completion_status: "Completed",
      };
    });

    // Sort by most recent activity (completed_at if available, otherwise created_at)
    quizHistory.sort((a, b) => {
      const dateA = new Date(a.completed_at || a.created_at);
      const dateB = new Date(b.completed_at || b.created_at);
      return dateB.getTime() - dateA.getTime();
    });

    console.log("Final quiz history:", quizHistory.length, "items");
    return NextResponse.json(quizHistory);
  } catch (error) {
    console.error("Unexpected error in quiz attempts API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
