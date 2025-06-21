import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database";
import type { CreateFlashcardInput, CreateTopicInput } from "@/types/database";

interface CreateFlashcardRequest {
  user_id: string;
  question: string;
  answer: string;
  topic_id?: string;
  custom_topic?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateFlashcardRequest = await request.json();

    // Validate required fields
    if (!body.user_id || !body.question || !body.answer) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: user_id, question, and answer are required",
        },
        { status: 400 }
      );
    }

    // Validate topic selection
    if (!body.topic_id && !body.custom_topic) {
      return NextResponse.json(
        { error: "Either topic_id or custom_topic must be provided" },
        { status: 400 }
      );
    }

    // Create or get topic
    let topicId = body.topic_id;
    if (!topicId && body.custom_topic) {
      const topicInput: CreateTopicInput = {
        name: body.custom_topic,
        description: `Custom topic: ${body.custom_topic}`,
      };
      const topicResponse = await db.topics.createTopic(topicInput);
      if (topicResponse.success && topicResponse.data) {
        topicId = topicResponse.data.topic_id;
      } else {
        return NextResponse.json(
          { error: "Failed to create custom topic" },
          { status: 500 }
        );
      }
    }

    // Create the flashcard
    const flashcardInput: CreateFlashcardInput = {
      user_id: body.user_id,
      question: body.question.trim(),
      answer: body.answer.trim(),
      topic_id: topicId,
      tags: [
        "manual-created",
        body.custom_topic?.toLowerCase().replace(/\s+/g, "-") || "general",
      ].filter(Boolean),
    };

    const flashcardResponse =
      await db.flashcards.createFlashcard(flashcardInput);

    if (!flashcardResponse.success || !flashcardResponse.data) {
      return NextResponse.json(
        { error: flashcardResponse.error || "Failed to create flashcard" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      flashcard: flashcardResponse.data,
      topic_id: topicId,
      message: "Flashcard created successfully",
    });
  } catch (error) {
    console.error("Create flashcard error:", error);
    return NextResponse.json(
      {
        error: "Failed to create flashcard",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
