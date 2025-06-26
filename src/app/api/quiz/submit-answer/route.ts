import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database";
import type { CreateUserAnswerInput } from "@/types/database";

interface SubmitAnswerRequest {
  user_id: string;
  question_id: string;
  quiz_id: string;
  selected_option_id?: string;
  text_answer?: string;
  is_correct?: boolean;
  time_taken_seconds: number;
}

export async function POST(request: NextRequest) {
  try {
    const body: SubmitAnswerRequest = await request.json();

    // Validate required fields
    if (!body.user_id || !body.question_id) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: user_id and question_id are required",
        },
        { status: 400 }
      );
    }

    // Create user answer input
    const answerInput: CreateUserAnswerInput = {
      user_id: body.user_id,
      question_id: body.question_id,
      quiz_id: body.quiz_id,
      selected_option_id: body.selected_option_id,
      text_answer: body.text_answer,
      is_correct: body.is_correct,
      time_taken_seconds: body.time_taken_seconds,
    };

    // Submit answer to database
    const response = await db.answers.submitAnswer(answerInput);

    if (!response.success) {
      throw new Error(response.error || "Failed to submit answer");
    }

    return NextResponse.json({
      success: true,
      answer: response.data,
      message: "Answer submitted successfully",
    });
  } catch (error) {
    console.error("Submit answer error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to submit answer",
      },
      { status: 500 }
    );
  }
}
