import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/database";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // OPTIMIZED: Single database function call replaces 3 queries + complex processing
    const { data: quizHistory, error } = await supabase
      .rpc('get_user_quiz_attempts', { p_user_id: userId });

    if (error) {
      console.error("Error fetching quiz attempts:", error);
      return NextResponse.json(
        { error: "Failed to fetch quiz attempts" },
        { status: 500 }
      );
    }

    // Return the pre-processed results from the database function
    return NextResponse.json(quizHistory || []);
  } catch (error) {
    console.error("Unexpected error in quiz attempts API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
