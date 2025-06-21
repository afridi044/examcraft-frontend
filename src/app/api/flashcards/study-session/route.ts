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

    // Get flashcards by mastery status
    const masteryStatusFilter =
      masteryFilter === "all" ? undefined : masteryFilter;
    const { data: flashcards } = await db.flashcards.getFlashcardsByMastery(
      body.user_id,
      masteryStatusFilter
    );

    if (!flashcards) {
      return NextResponse.json(
        { error: "No flashcards found" },
        { status: 404 }
      );
    }

    // Filter flashcards for the specific topic
    const topicFlashcards = flashcards.filter((card) => {
      const cardTopicId = card.topic_id || "general";
      return cardTopicId === body.topic_id;
    });

    if (topicFlashcards.length === 0) {
      // If no cards found for specific mastery status, try getting all cards
      if (masteryFilter !== "all") {
        console.log(`No ${masteryFilter} cards found, trying all cards...`);

        const { data: allFlashcards } = await db.flashcards.getUserFlashcards(
          body.user_id
        );

        if (allFlashcards) {
          const allTopicFlashcards = allFlashcards.filter((card) => {
            const cardTopicId = card.topic_id || "general";
            return cardTopicId === body.topic_id;
          });

          if (allTopicFlashcards.length > 0) {
            // Return all cards but indicate the fallback
            const shuffledCards = allTopicFlashcards.sort(
              () => Math.random() - 0.5
            );

            return NextResponse.json({
              success: true,
              fallback: true,
              message: `No ${masteryFilter} cards found. Showing all cards for this topic.`,
              session: {
                topic_id: body.topic_id,
                topic_name: shuffledCards[0]?.topic?.name || "General",
                total_cards: shuffledCards.length,
                mastery_status: "all", // Override to 'all' since we're showing all cards
                cards: shuffledCards,
                session_id: `session_${Date.now()}_${body.user_id}`,
              },
            });
          }
        }
      }

      const statusText = masteryFilter === "all" ? "any" : masteryFilter;
      return NextResponse.json(
        { error: `No ${statusText} flashcards found for this topic` },
        { status: 404 }
      );
    }

    let studyCards = topicFlashcards;

    // Shuffle the cards for better learning experience
    const shuffledCards = studyCards.sort(() => Math.random() - 0.5);

    return NextResponse.json({
      success: true,
      session: {
        topic_id: body.topic_id,
        topic_name: shuffledCards[0]?.topic?.name || "General",
        total_cards: shuffledCards.length,
        mastery_status: masteryFilter,
        cards: shuffledCards,
        session_id: `session_${Date.now()}_${body.user_id}`, // Simple session ID
      },
    });
  } catch (error) {
    console.error("Study session error:", error);
    return NextResponse.json(
      { error: "Failed to start study session" },
      { status: 500 }
    );
  }
}
