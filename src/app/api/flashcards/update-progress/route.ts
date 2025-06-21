import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database";

interface UpdateProgressRequest {
  flashcard_id: string;
  performance: "know" | "dont_know"; // Simplified to match Magoosh-style
  study_time_seconds?: number;
}

// Magoosh-Style Mastery Algorithm
function calculateMasteryStatus(
  performance: "know" | "dont_know",
  currentMasteryStatus: "learning" | "under_review" | "mastered",
  consecutiveCorrect: number
) {
  let newMasteryStatus = currentMasteryStatus;
  let newConsecutiveCorrect = consecutiveCorrect;

  if (performance === "know") {
    // User knows the card
    newConsecutiveCorrect = consecutiveCorrect + 1;

    if (currentMasteryStatus === "learning") {
      // Learning → Under Review (first time they know it)
      newMasteryStatus = "under_review";
    } else if (
      currentMasteryStatus === "under_review" &&
      newConsecutiveCorrect >= 2
    ) {
      // Under Review → Mastered (confirmed they know it)
      newMasteryStatus = "mastered";
    }
    // If already mastered, stay mastered
  } else {
    // User doesn't know the card
    newConsecutiveCorrect = 0; // Reset streak

    if (
      currentMasteryStatus === "under_review" ||
      currentMasteryStatus === "mastered"
    ) {
      // Under Review/Mastered → Learning (they forgot it)
      newMasteryStatus = "learning";
    }
    // If already learning, stay learning
  }

  return {
    mastery_status: newMasteryStatus,
    consecutive_correct: newConsecutiveCorrect,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body: UpdateProgressRequest = await request.json();

    console.log("Update progress API called with:", body);

    if (!body.flashcard_id || !body.performance) {
      console.log("Missing required fields:", {
        flashcard_id: body.flashcard_id,
        performance: body.performance,
      });
      return NextResponse.json(
        { error: "Flashcard ID and performance are required" },
        { status: 400 }
      );
    }

    if (!["know", "dont_know"].includes(body.performance)) {
      console.log("Invalid performance value:", body.performance);
      return NextResponse.json(
        { error: "Invalid performance value. Must be 'know' or 'dont_know'" },
        { status: 400 }
      );
    }

    // Get current flashcard data
    console.log("Getting flashcard by ID:", body.flashcard_id);
    const flashcardResult = await db.flashcards.getFlashcardById(
      body.flashcard_id
    );

    console.log("Flashcard result:", flashcardResult);

    if (!flashcardResult.success || !flashcardResult.data) {
      console.log("Flashcard not found or error:", flashcardResult);
      return NextResponse.json(
        { error: "Flashcard not found" },
        { status: 404 }
      );
    }

    const flashcard = flashcardResult.data;
    console.log("Current flashcard data:", flashcard);

    // Calculate new mastery status using Magoosh-style algorithm
    const newValues = calculateMasteryStatus(
      body.performance,
      flashcard.mastery_status,
      flashcard.consecutive_correct
    );

    console.log("Calculated new mastery values:", newValues);

    // Update flashcard in database
    const updateData = {
      mastery_status: newValues.mastery_status,
      consecutive_correct: newValues.consecutive_correct,
    };

    console.log("Updating flashcard with data:", updateData);

    const updateResult = await db.flashcards.updateFlashcard(
      body.flashcard_id,
      updateData
    );

    console.log("Update result:", updateResult);

    if (!updateResult.success) {
      console.log("Update failed:", updateResult);
      return NextResponse.json(
        { error: "Failed to update flashcard" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      flashcard_id: body.flashcard_id,
      performance: body.performance,
      mastery_status: newValues.mastery_status,
      consecutive_correct: newValues.consecutive_correct,
      message: getMasteryMessage(body.performance, newValues.mastery_status),
      invalidate_cache: true, // Signal to invalidate client cache
    });
  } catch (error) {
    console.error("Update progress error:", error);
    return NextResponse.json(
      { error: "Failed to update progress" },
      { status: 500 }
    );
  }
}

function getMasteryMessage(
  performance: "know" | "dont_know",
  masteryStatus: "learning" | "under_review" | "mastered"
): string {
  if (performance === "know") {
    switch (masteryStatus) {
      case "under_review":
        return "Great! This card is now under review. Get it right once more to master it!";
      case "mastered":
        return "Excellent! You've mastered this card! 🎉";
      default:
        return "Good job! Keep practicing to improve your mastery.";
    }
  } else {
    switch (masteryStatus) {
      case "learning":
        return "No worries! This card is back in learning mode. Keep practicing!";
      default:
        return "Don't worry! Practice makes perfect.";
    }
  }
}
