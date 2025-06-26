"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Brain,
  Loader2,
  Sparkles,
  BookOpen,
  FileText,
  Zap,
  Users,
  Layers,
  Lightbulb,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import {
  useCurrentUser,
  useTopics,
  useInvalidateUserData,
} from "@/hooks/useDatabase";
import { toast } from "react-hot-toast";

interface FlashcardGenerationForm {
  topic_id: string;
  custom_topic: string;
  topic_name: string;
  num_flashcards: number;
  difficulty: number;
  content_source: string;
  additional_instructions: string;
}

export default function CreateFlashcardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, signingOut } = useAuth();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const { data: topics } = useTopics();
  const invalidateUserData = useInvalidateUserData();

  // State management
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedFlashcards, setGeneratedFlashcards] = useState<{
    topic_id: string;
    topic_name: string;
    generated_count: number;
  } | null>(null);

  // Get preselected topic from URL params
  const preselectedTopicId = searchParams.get("topic_id") || "";

  const [form, setForm] = useState<FlashcardGenerationForm>({
    topic_id: preselectedTopicId,
    custom_topic: "",
    topic_name: "",
    num_flashcards: 10,
    difficulty: 3,
    content_source: "",
    additional_instructions: "",
  });

  const [numFlashcardsInput, setNumFlashcardsInput] = useState("10");

  // Optimized form handlers with useCallback
  const handleInputChange = useCallback((
    field: keyof FlashcardGenerationForm,
    value: string | number
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const validateForm = useCallback(() => {
    const topicName = form.topic_id
      ? topics?.find((t) => t.topic_id === form.topic_id)?.name
      : form.custom_topic.trim();

    if (!topicName) {
      toast.error("Please select a topic or enter a custom topic");
      return false;
    }
    if (form.num_flashcards < 1 || form.num_flashcards > 50) {
      toast.error("Number of flashcards must be between 1 and 50");
      return false;
    }
    return true;
  }, [form.topic_id, form.custom_topic, form.num_flashcards, topics]);

  const handleGenerateFlashcards = useCallback(async () => {
    if (!validateForm() || !currentUser) return;

    setIsGenerating(true);
    try {
      const topicName = form.topic_id
        ? topics?.find((t) => t.topic_id === form.topic_id)?.name
        : form.custom_topic.trim();

      const response = await fetch("/api/flashcards/generate/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: currentUser.user_id,
          topic_id: form.topic_id || undefined,
          custom_topic: form.custom_topic.trim() || undefined,
          topic_name: topicName,
          num_flashcards: form.num_flashcards,
          difficulty: form.difficulty,
          content_source: form.content_source.trim() || undefined,
          additional_instructions:
            form.additional_instructions.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate flashcards");
      }

      toast.success(
        `Successfully generated ${data.generated_count} flashcard${
          data.generated_count !== 1 ? "s" : ""
        }!`
      );

      if (data.errors && data.errors.length > 0) {
        toast.error(
          `Some flashcards failed to generate: ${data.errors.length} errors`
        );
      }

      // Simplified cache invalidation - just invalidate user data
      if (currentUser?.user_id) {
        invalidateUserData(currentUser.user_id);
      }

      setGeneratedFlashcards({
        topic_id: data.topic_id,
        topic_name: data.topic_name,
        generated_count: data.generated_count,
      });
    } catch (error) {
      console.error("AI flashcard generation error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to generate flashcards"
      );
    } finally {
      setIsGenerating(false);
    }
  }, [validateForm, currentUser, topics, form, invalidateUserData]);

  // Redirect to landing page if not authenticated and not loading
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [loading, user, router]);

  // Set initial topic name if preselected topic exists
  useEffect(() => {
    if (preselectedTopicId && topics && topics.length > 0) {
      const selectedTopic = topics.find(
        (t) => t.topic_id === preselectedTopicId
      );
      if (selectedTopic) {
        setForm((prev) => ({ ...prev, topic_name: selectedTopic.name }));
      }
    }
  }, [preselectedTopicId, topics]);

  // Simplified loading logic
  const isAuthenticating = loading || !user;
  const isLoadingUserData = userLoading || !currentUser;
  
  // Show loading screen only when necessary and not signing out
  const showLoadingScreen = !signingOut && (isAuthenticating || isLoadingUserData);
  
  if (showLoadingScreen) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-purple-500/50">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-pink-600/30 rounded-2xl blur-xl"></div>
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
              Loading Flashcard Creator...
            </h2>
            <p className="text-gray-400">
              Preparing your learning tools
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const difficultyLevels = [
    { value: 1, label: "Beginner", color: "text-green-400" },
    { value: 2, label: "Easy", color: "text-blue-400" },
    { value: 3, label: "Medium", color: "text-yellow-400" },
    { value: 4, label: "Hard", color: "text-orange-400" },
    { value: 5, label: "Expert", color: "text-red-400" },
  ];

  // Show success screen if flashcards were generated
  if (generatedFlashcards) {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-20 space-y-8">
          <div className="text-center space-y-8">
            {/* Success Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-3">
                <div className="h-16 w-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                Flashcards Generated Successfully!
              </h1>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Your AI-powered flashcards have been created and are ready for
                study.
              </p>
            </div>

            {/* Flashcard Details Card */}
            <Card className="bg-gray-800/50 border-gray-700/50 p-8 max-w-2xl mx-auto">
              <div className="space-y-6">
                <div className="text-center space-y-3">
                  <h2 className="text-2xl font-bold text-white">
                    {generatedFlashcards.topic_name}
                  </h2>
                  <div className="flex items-center justify-center space-x-6 text-gray-400">
                    <div className="flex items-center space-x-2">
                      <Layers className="h-4 w-4" />
                      <span>
                        {generatedFlashcards.generated_count} Flashcards
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Brain className="h-4 w-4" />
                      <span>AI Generated</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4">
                  <Button
                    onClick={() => router.push("/flashcards")}
                    className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-medium py-3 text-lg"
                  >
                    <Zap className="h-5 w-5 mr-2" />
                    Start Studying Now
                  </Button>

                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      onClick={() => {
                        if (currentUser?.user_id) {
                          invalidateUserData(currentUser.user_id);
                        }
                        router.push("/dashboard");
                      }}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700/50"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Return to Dashboard
                    </Button>

                    <Button
                      onClick={() => {
                        setGeneratedFlashcards(null);
                        setForm({
                          topic_id: "",
                          custom_topic: "",
                          topic_name: "",
                          num_flashcards: 10,
                          difficulty: 3,
                          content_source: "",
                          additional_instructions: "",
                        });
                        setNumFlashcardsInput("10");
                      }}
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700/50"
                    >
                      <Layers className="h-4 w-4 mr-2" />
                      Create More Flashcards
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto p-20 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Layers className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
              AI Flashcard Generator
            </h1>
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Create personalized flashcards with AI. Provide your topic and
            content, and our AI will generate effective study materials
            optimized for active recall.
          </p>
        </div>

        {/* Main Form */}
        <div>
          <Card className="bg-gray-800/50 border-gray-700/50 p-8">
            <div className="space-y-8">
              {/* Topic Information */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="h-8 w-8 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    Topic Selection
                  </h2>
                </div>

                {/* Topic Selection */}
                <div className="space-y-4">
                  <Label className="text-gray-300">Topic</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="topic" className="text-sm text-gray-400">
                        Select from existing topics
                      </Label>
                      <select
                        id="topic"
                        value={form.topic_id}
                        onChange={(e) => {
                          const selectedTopic = topics?.find(
                            (t) => t.topic_id === e.target.value
                          );
                          handleInputChange("topic_id", e.target.value);
                          handleInputChange("custom_topic", "");
                          handleInputChange(
                            "topic_name",
                            selectedTopic?.name || ""
                          );
                        }}
                        className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white"
                      >
                        <option value="">Choose a topic...</option>
                        {topics?.map((topic) => (
                          <option key={topic.topic_id} value={topic.topic_id}>
                            {topic.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="custom_topic"
                        className="text-sm text-gray-400"
                      >
                        Or enter custom topic
                      </Label>
                      <Input
                        id="custom_topic"
                        value={form.custom_topic}
                        onChange={(e) => {
                          handleInputChange("custom_topic", e.target.value);
                          handleInputChange("topic_id", "");
                          handleInputChange("topic_name", e.target.value);
                        }}
                        placeholder="e.g., Machine Learning Basics"
                        className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400"
                        disabled={!!form.topic_id}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Flashcard Configuration */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="h-8 w-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <Brain className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    Flashcard Configuration
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Difficulty Level */}
                  <div className="space-y-4">
                    <Label className="text-gray-300">Difficulty Level</Label>
                    <div className="grid grid-cols-5 gap-2">
                      {difficultyLevels.map((level) => (
                        <button
                          key={level.value}
                          onClick={() =>
                            handleInputChange("difficulty", level.value)
                          }
                          className={`p-3 rounded-lg border text-center transition-all ${
                            form.difficulty === level.value
                              ? "border-blue-500 bg-blue-500/20 text-blue-300"
                              : "border-gray-600 bg-gray-700/50 text-gray-400 hover:border-gray-500"
                          }`}
                        >
                          <div className="text-sm font-medium">
                            {level.value}
                          </div>
                          <div className={`text-xs ${level.color}`}>
                            {level.label}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Number of Flashcards */}
                  <div className="space-y-2">
                    <Label htmlFor="num_flashcards" className="text-gray-300">
                      Number of Flashcards (1-50)
                    </Label>
                    <Input
                      id="num_flashcards"
                      type="number"
                      min="1"
                      max="50"
                      value={numFlashcardsInput}
                      onChange={(e) => {
                        const value = e.target.value;
                        setNumFlashcardsInput(value);

                        // Only update form state if it's a valid number
                        if (value !== "" && !isNaN(parseInt(value))) {
                          const numValue = parseInt(value);
                          if (numValue >= 1 && numValue <= 50) {
                            handleInputChange("num_flashcards", numValue);
                          }
                        }
                      }}
                      onBlur={() => {
                        // On blur, ensure we have a valid value
                        if (
                          numFlashcardsInput === "" ||
                          isNaN(parseInt(numFlashcardsInput))
                        ) {
                          setNumFlashcardsInput("10");
                          handleInputChange("num_flashcards", 10);
                        } else {
                          const numValue = parseInt(numFlashcardsInput);
                          const clampedValue = Math.max(
                            1,
                            Math.min(50, numValue)
                          );
                          setNumFlashcardsInput(clampedValue.toString());
                          handleInputChange("num_flashcards", clampedValue);
                        }
                      }}
                      className="bg-gray-700/50 border-gray-600 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Content Source */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="h-8 w-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                    <FileText className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-white">
                    Content & Instructions
                  </h2>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="content_source" className="text-gray-300">
                      Content Source (Optional)
                    </Label>
                    <textarea
                      id="content_source"
                      value={form.content_source}
                      onChange={(e) =>
                        handleInputChange("content_source", e.target.value)
                      }
                      placeholder="Paste your study material, notes, or content that you want the flashcards to be based on..."
                      rows={6}
                      className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder:text-gray-400 resize-vertical"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="additional_instructions"
                      className="text-gray-300"
                    >
                      Additional Instructions (Optional)
                    </Label>
                    <textarea
                      id="additional_instructions"
                      value={form.additional_instructions}
                      onChange={(e) =>
                        handleInputChange(
                          "additional_instructions",
                          e.target.value
                        )
                      }
                      placeholder="Any specific instructions for the AI (e.g., 'Focus on definitions', 'Include examples', etc.)"
                      rows={3}
                      className="w-full p-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder:text-gray-400 resize-vertical"
                    />
                  </div>
                </div>
              </div>

              {/* Generate Button */}
              <div className="pt-6 border-t border-gray-700">
                <Button
                  onClick={handleGenerateFlashcards}
                  disabled={isGenerating || userLoading || !currentUser}
                  className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Generating Flashcards...</span>
                    </div>
                  ) : userLoading ? (
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Loading...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Sparkles className="h-5 w-5" />
                      <span>Generate AI Flashcards</span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Tips Card */}
        <div>
          <Card className="bg-gradient-to-r from-teal-500/10 to-blue-500/10 border-teal-500/20 p-6">
            <div className="flex items-start space-x-4">
              <div className="h-8 w-8 bg-gradient-to-br from-teal-500 to-blue-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                <Lightbulb className="h-4 w-4 text-white" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-teal-300">Pro Tips</h3>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>
                    • Provide detailed content for more accurate flashcards
                  </li>
                  <li>• Use specific topics for better targeted learning</li>
                  <li>
                    • Include clear instructions for optimal AI generation
                  </li>
                  <li>
                    • Start with 10-15 flashcards for effective study sessions
                  </li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
