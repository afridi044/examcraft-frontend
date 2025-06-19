import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database";
import type {
  CreateQuizInput,
  CreateQuestionInput,
  CreateQuestionOptionInput,
  CreateTopicInput,
} from "@/types/database";

interface QuizGenerationRequest {
  title: string;
  description: string;
  topic_id: string;
  custom_topic: string;
  topic_name: string;
  difficulty: number;
  num_questions: number;
  question_types: string[];
  content_source: string;
  additional_instructions: string;
  user_id: string;
}

interface AIQuestion {
  question: string;
  type: "multiple-choice" | "true-false" | "fill-in-blank";
  options?: string[];
  correct_answer: string | number;
  explanation?: string;
  difficulty: number;
}

interface AIQuizResponse {
  questions: AIQuestion[];
}

export async function POST(request: NextRequest) {
  try {
    const body: QuizGenerationRequest = await request.json();

    // Validate required fields
    if (!body.user_id || !body.title) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Generate quiz using OpenRouter AI
    const aiQuestions = await generateQuestionsWithAI(body);

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

    // Create quiz
    const quizInput: CreateQuizInput = {
      user_id: body.user_id,
      title: body.title,
      description:
        body.description || `AI-generated quiz on ${body.topic_name}`,
      topic_id: topicId,
    };

    const quizResponse = await db.quizzes.createQuiz(quizInput);
    if (!quizResponse.success || !quizResponse.data) {
      throw new Error("Failed to create quiz");
    }

    const quiz = quizResponse.data;
    const questionIds: string[] = [];

    // Create questions and their options
    for (let i = 0; i < aiQuestions.length; i++) {
      const aiQuestion = aiQuestions[i];

      // Create question
      const questionInput: CreateQuestionInput = {
        content: aiQuestion.question,
        question_type: aiQuestion.type,
        difficulty: aiQuestion.difficulty,
        topic_id: topicId,
      };

      const questionResponse = await db.questions.createQuestion(questionInput);
      if (!questionResponse.success || !questionResponse.data) {
        console.error(`Failed to create question ${i + 1}`);
        continue;
      }

      const question = questionResponse.data;
      questionIds.push(question.question_id);

      // Create question options
      const optionsInput: CreateQuestionOptionInput[] = [];

      if (aiQuestion.type === "multiple-choice" && aiQuestion.options) {
        // For multiple choice, create options from the array
        aiQuestion.options.forEach((option, index) => {
          optionsInput.push({
            question_id: question.question_id,
            content: option,
            is_correct: index === aiQuestion.correct_answer,
          });
        });
      } else {
        console.error(`Unsupported question type: ${aiQuestion.type}`);
        continue;
      }

      // Save options to database
      for (const optionInput of optionsInput) {
        await db.questions.createQuestionOption(optionInput);
      }

      // Create explanation if provided
      if (aiQuestion.explanation) {
        await db.questions.createExplanation({
          question_id: question.question_id,
          content: aiQuestion.explanation,
          ai_generated: true,
        });
      }
    }

    // Add questions to quiz
    if (questionIds.length > 0) {
      await db.quizzes.addQuestionsToQuiz(quiz.quiz_id, questionIds);
    }

    return NextResponse.json({
      success: true,
      quiz,
      questions_created: questionIds.length,
      message: `Successfully generated quiz with ${questionIds.length} questions`,
    });
  } catch (error) {
    console.error("Quiz generation error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to generate quiz",
      },
      { status: 500 }
    );
  }
}

async function generateQuestionsWithAI(
  body: QuizGenerationRequest
): Promise<AIQuestion[]> {
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
          "X-Title": "ExamCraft - AI Quiz Generator",
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.1-8b-instruct:free", // Free model
          messages: [
            {
              role: "system",
              content:
                "You are an expert educational content creator. Generate quiz questions in valid JSON format only. Do not include any explanation or additional text outside the JSON.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 4000,
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
    let aiResponse: AIQuizResponse;
    try {
      // Try to extract JSON from the response if it's wrapped in text
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : content;
      aiResponse = JSON.parse(jsonString);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse AI response as JSON");
    }

    if (!aiResponse.questions || !Array.isArray(aiResponse.questions)) {
      throw new Error("AI response does not contain valid questions array");
    }

    // Validate and sanitize questions
    const validQuestions = aiResponse.questions
      .filter((q) => q.question && q.type && q.correct_answer !== undefined)
      .slice(0, body.num_questions)
      .map((q) => ({
        ...q,
        difficulty: q.difficulty || body.difficulty,
      }));

    if (validQuestions.length === 0) {
      throw new Error("No valid questions generated by AI");
    }

    return validQuestions;
  } catch (error) {
    console.error("AI generation error:", error);
    throw new Error(
      `Failed to generate questions: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}

function buildAIPrompt(body: QuizGenerationRequest): string {
  const difficultyLabels = ["", "Beginner", "Easy", "Medium", "Hard", "Expert"];
  const difficultyLabel = difficultyLabels[body.difficulty] || "Medium";

  let prompt = `Generate ${body.num_questions} multiple-choice quiz questions about "${body.topic_name}" at ${difficultyLabel} difficulty level.

`;

  if (body.content_source) {
    prompt += `Base the questions on this content:
${body.content_source}

`;
  }

  if (body.additional_instructions) {
    prompt += `Additional Instructions: ${body.additional_instructions}

`;
  }

  prompt += `Return ONLY a JSON object in this exact format:
{
  "questions": [
    {
      "question": "Question text here",
      "type": "multiple-choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 0,
      "explanation": "Brief explanation of the correct answer",
      "difficulty": ${body.difficulty}
    }
  ]
}

Rules:
- Generate ONLY multiple-choice questions
- Each question must have exactly 4 options (A, B, C, D)
- correct_answer is the index (0-3) of the correct option
- All questions must be educational and appropriate
- Include brief explanations for better learning
- Ensure questions are at the specified difficulty level
- Make sure all options are plausible but only one is correct
- Avoid obvious or trick questions

Generate exactly ${body.num_questions} multiple-choice questions.`;

  return prompt;
}
