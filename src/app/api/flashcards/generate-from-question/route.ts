import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database";
import { CreateFlashcardInput } from "@/types/database";

interface GenerateFlashcardRequest {
  user_id: string;
  question_id: string;
  quiz_id?: string;
  custom_question?: string;
  custom_answer?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateFlashcardRequest = await request.json();

    if (!body.user_id || !body.question_id) {
      return NextResponse.json(
        { error: "User ID and Question ID are required" },
        { status: 400 }
      );
    }

    // Get the original question details
    const questionResponse = await db.questions.getQuestionById(
      body.question_id
    );
    if (!questionResponse.success || !questionResponse.data) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    const question = questionResponse.data;

    // Check if flashcard already exists for this question
    const { data: existingFlashcards } = await db.flashcards.getUserFlashcards(
      body.user_id
    );
    const existingFlashcard = existingFlashcards?.find(
      (f) => f.source_question_id === body.question_id
    );

    if (existingFlashcard) {
      return NextResponse.json(
        {
          error: "Flashcard already exists for this question",
          flashcard_id: existingFlashcard.flashcard_id,
        },
        { status: 409 }
      );
    }

    // Generate flashcard content
    const flashcardQuestion = body.custom_question || question.content;
    let flashcardAnswer = body.custom_answer;

    // If no custom answer provided, generate one from the question options
    if (!flashcardAnswer && question.question_options) {
      const correctOption = question.question_options.find(
        (opt) => opt.is_correct
      );
      if (correctOption) {
        if (question.question_type === "multiple-choice") {
          flashcardAnswer = correctOption.content;
        } else if (question.question_type === "true-false") {
          flashcardAnswer = correctOption.content === "true" ? "True" : "False";
        }
      }
    }

    // For fill-in-blank questions, we might need to be more creative
    if (!flashcardAnswer && question.question_type === "fill-in-blank") {
      flashcardAnswer = "Please provide the correct answer for this question.";
    }

    if (!flashcardAnswer) {
      return NextResponse.json(
        {
          error:
            "Could not generate answer for flashcard. Please provide a custom answer.",
        },
        { status: 400 }
      );
    }

    // Create the flashcard
    const flashcardInput: CreateFlashcardInput = {
      user_id: body.user_id,
      question: flashcardQuestion,
      answer: flashcardAnswer,
      topic_id: question.topic_id,
      source_question_id: body.question_id,
      tags: [
        question.question_type,
        question.topic?.name?.toLowerCase().replace(/\s+/g, "-") || "general",
        `difficulty-${question.difficulty || 1}`,
      ].filter(Boolean),
    };

    const flashcardResponse =
      await db.flashcards.createFlashcard(flashcardInput);

    if (!flashcardResponse.success || !flashcardResponse.data) {
      return NextResponse.json(
        { error: "Failed to create flashcard" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      flashcard: flashcardResponse.data,
      message: "Flashcard created successfully",
    });
  } catch (error) {
    console.error("Generate flashcard error:", error);
    return NextResponse.json(
      { error: "Failed to generate flashcard" },
      { status: 500 }
    );
  }
}
