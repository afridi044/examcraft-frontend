import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database";
import type { CreateFlashcardInput, CreateTopicInput } from "@/types/database";

interface FlashcardGenerationRequest {
  user_id: string;
  topic_id?: string;
  custom_topic?: string;
  topic_name: string;
  num_flashcards: number;
  difficulty: number;
  content_source?: string;
  additional_instructions?: string;
}

interface AIFlashcard {
  question: string;
  answer: string;
  difficulty: number;
  explanation?: string;
}

interface AIFlashcardResponse {
  flashcards: AIFlashcard[];
}

export async function POST(request: NextRequest) {
  try {
    const body: FlashcardGenerationRequest = await request.json();

    // Validate required fields
    if (!body.user_id || !body.topic_name || !body.num_flashcards) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: user_id, topic_name, and num_flashcards are required",
        },
        { status: 400 }
      );
    }

    // Validate flashcard count
    if (body.num_flashcards < 1 || body.num_flashcards > 50) {
      return NextResponse.json(
        { error: "Number of flashcards must be between 1 and 50" },
        { status: 400 }
      );
    }

    // Generate flashcards using OpenRouter AI
    const aiFlashcards = await generateFlashcardsWithAI(body);

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
      }
    }

    // Create flashcards in database
    const createdFlashcards = [];
    const errors = [];

    for (let i = 0; i < aiFlashcards.length; i++) {
      const aiFlashcard = aiFlashcards[i];

      try {
        const flashcardInput: CreateFlashcardInput = {
          user_id: body.user_id,
          question: aiFlashcard.question,
          answer: aiFlashcard.answer,
          topic_id: topicId,
          tags: [
            "ai-generated",
            body.topic_name.toLowerCase().replace(/\s+/g, "-"),
            `difficulty-${aiFlashcard.difficulty || body.difficulty}`,
          ].filter(Boolean),
        };

        const flashcardResponse =
          await db.flashcards.createFlashcard(flashcardInput);

        if (flashcardResponse.success && flashcardResponse.data) {
          createdFlashcards.push(flashcardResponse.data);
        } else {
          errors.push(
            `Failed to create flashcard ${i + 1}: ${flashcardResponse.error}`
          );
        }
      } catch (error) {
        console.error(`Error creating flashcard ${i + 1}:`, error);
        errors.push(
          `Failed to create flashcard ${i + 1}: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    // Return response
    const response = {
      success: true,
      flashcards: createdFlashcards,
      topic_id: topicId,
      topic_name: body.topic_name,
      generated_count: createdFlashcards.length,
      requested_count: body.num_flashcards,
      errors: errors.length > 0 ? errors : undefined,
      message: `Successfully generated ${createdFlashcards.length} out of ${body.num_flashcards} flashcards`,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("AI flashcard generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate flashcards",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function generateFlashcardsWithAI(
  body: FlashcardGenerationRequest
): Promise<AIFlashcard[]> {
  const openRouterApiKey = process.env.OPENROUTER_API_KEY;

  if (!openRouterApiKey) {
    throw new Error("OpenRouter API key not configured");
  }

  // Build the prompt for AI
  const prompt = buildAIPrompt(body);

  try {
    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openRouterApiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer":
            process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
          "X-Title": "ExamCraft - AI Flashcard Generator",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-r1-0528-qwen3-8b:free", // Free model
          messages: [
            {
              role: "system",
              content:
                "You are an expert educational content creator specialized in creating effective flashcards for studying. You must respond with ONLY valid JSON - no markdown, no explanations, no additional text. Start your response with { and end with }. Generate flashcards in the exact JSON format requested. Focus on creating clear, concise questions with accurate answers that promote active recall and spaced repetition learning.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 4000,
          // Performance optimizations
          stream: false,
          top_p: 0.9,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `OpenRouter API error: ${response.status} - ${errorText}`
      );
    }

    const data = await response.json();

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid response format from OpenRouter API");
    }

    const content = data.choices[0].message.content;

    // Parse the JSON response
    let aiResponse: AIFlashcardResponse;
    try {
      // Clean the content and try multiple parsing strategies
      let cleanContent = content.trim();

      // Remove markdown code blocks if present
      cleanContent = cleanContent
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "");

      // Try to extract JSON from the response
      const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : cleanContent;

      // Additional cleaning - remove any trailing text after the JSON
      const lastBraceIndex = jsonString.lastIndexOf("}");
      const finalJsonString =
        lastBraceIndex !== -1
          ? jsonString.substring(0, lastBraceIndex + 1)
          : jsonString;

      console.log(
        "Attempting to parse flashcard JSON:",
        finalJsonString.substring(0, 200) + "..."
      );
      aiResponse = JSON.parse(finalJsonString);
    } catch (parseError) {
      console.error("Failed to parse AI response:", {
        originalContent: content,
        parseError:
          parseError instanceof Error ? parseError.message : parseError,
      });

      // Try one more time with a simpler extraction
      try {
        const simpleMatch = content.match(
          /\{[^{}]*"flashcards"[^{}]*\[[\s\S]*\][^{}]*\}/
        );
        if (simpleMatch) {
          aiResponse = JSON.parse(simpleMatch[0]);
        } else {
          throw new Error("No valid JSON structure found in AI response");
        }
      } catch {
        throw new Error(
          `Failed to parse AI response as JSON. Content preview: ${content.substring(0, 500)}`
        );
      }
    }

    if (!aiResponse.flashcards || !Array.isArray(aiResponse.flashcards)) {
      throw new Error("AI response does not contain valid flashcards array");
    }

    // Validate and sanitize flashcards
    const validFlashcards = aiResponse.flashcards
      .filter((f) => f.question && f.answer)
      .slice(0, body.num_flashcards)
      .map((f) => ({
        ...f,
        difficulty: f.difficulty || body.difficulty,
      }));

    if (validFlashcards.length === 0) {
      throw new Error("No valid flashcards generated by AI");
    }

    return validFlashcards;
  } catch (error) {
    console.error("AI generation error:", error);
    throw new Error(
      `Failed to generate flashcards: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

function buildAIPrompt(body: FlashcardGenerationRequest): string {
  const difficultyLabels = ["", "Beginner", "Easy", "Medium", "Hard", "Expert"];
  const difficultyLabel = difficultyLabels[body.difficulty] || "Medium";

  let prompt = `Generate ${body.num_flashcards} flashcards about "${body.topic_name}" at ${difficultyLabel} difficulty level.

`;

  if (body.content_source) {
    prompt += `Base the flashcards on this content:
${body.content_source}

`;
  }

  if (body.additional_instructions) {
    prompt += `Additional Instructions: ${body.additional_instructions}

`;
  }

  prompt += `Return ONLY a JSON object in this exact format:
{
  "flashcards": [
    {
      "question": "Clear, concise question that promotes active recall",
      "answer": "Accurate, comprehensive answer with key details",
      "difficulty": ${body.difficulty},
      "explanation": "Optional brief explanation or context"
    }
  ]
}

Rules for creating effective flashcards:
- Questions should be clear, specific, and test understanding
- Answers should be concise but complete
- Focus on key concepts, definitions, and important facts
- Use active recall principles - questions should make the user think
- Avoid yes/no questions unless they test important concepts
- Include context or examples in answers when helpful
- Make questions atomic - test one concept per flashcard
- Use varied question types (what, how, why, when, where)
- Ensure answers are factually accurate and educational

Generate exactly ${body.num_flashcards} high-quality flashcards for effective studying.`;

  return prompt;
}
