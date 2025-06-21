import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database";

interface StudySessionRequest {
  user_id: string;
  topic_id: string;
  mastery_status?: "learning" | "under_review" | "mastered" | "all"; // Filter by mastery status
}

export async function POST(request: NextRequest) {
  try {
    const body: StudySessionRequest = await request.json();

    if (!body.user_id || !body.topic_id) {
      return NextResponse.json(
        { error: "User ID and Topic ID are required" },
        { status: 400 }
      );
    }

    const masteryFilter = body.mastery_status || "learning"; // Default to learning cards

    // OPTIMIZED: Single database query with fallback logic
    let flashcards;
    let usedFallback = false;

    // Try specific mastery status first
    if (masteryFilter !== "all") {
      const { data: masteryCards } = await db.flashcards.getFlashcardsByMastery(
        body.user_id,
        masteryFilter
      );

      const topicMasteryCards =
        masteryCards?.filter((card) => {
          const cardTopicId = card.topic_id || "general";
          return cardTopicId === body.topic_id;
        }) || [];

      if (topicMasteryCards.length > 0) {
        flashcards = topicMasteryCards;
      } else {
        // Fallback to all cards for this topic
        const { data: allCards } = await db.flashcards.getUserFlashcards(
          body.user_id
        );
        flashcards =
          allCards?.filter((card) => {
            const cardTopicId = card.topic_id || "general";
            return cardTopicId === body.topic_id;
          }) || [];
        usedFallback = flashcards.length > 0;
      }
    } else {
      // Get all cards for the topic
      const { data: allCards } = await db.flashcards.getUserFlashcards(
        body.user_id
      );
      flashcards =
        allCards?.filter((card) => {
          const cardTopicId = card.topic_id || "general";
          return cardTopicId === body.topic_id;
        }) || [];
    }

    if (flashcards.length === 0) {
      const statusText = masteryFilter === "all" ? "any" : masteryFilter;
      return NextResponse.json(
        { error: `No ${statusText} flashcards found for this topic` },
        { status: 404 }
      );
    }

    // OPTIMIZED: Efficient shuffling and response
    const shuffledCards = flashcards.sort(() => Math.random() - 0.5);

    return NextResponse.json({
      success: true,
      fallback: usedFallback,
      message: usedFallback
        ? `No ${masteryFilter} cards found. Showing all cards for this topic.`
        : undefined,
      session: {
        topic_id: body.topic_id,
        topic_name: shuffledCards[0]?.topic?.name || "General",
        total_cards: shuffledCards.length,
        mastery_status: usedFallback ? "all" : masteryFilter,
        cards: shuffledCards,
        session_id: `session_${Date.now()}_${body.user_id}`,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to start study session" },
      { status: 500 }
    );
  }
}
