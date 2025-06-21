"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Plus,
  Sparkles,
  Brain,
  Loader2,
  FileText,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrentUser, useTopics } from "@/hooks/useDatabase";
import { toast } from "react-hot-toast";

interface CreateFlashcardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedTopicId?: string;
}

type CreationMode = "manual" | "ai";

interface ManualFlashcardForm {
  question: string;
  answer: string;
  topic_id: string;
  custom_topic: string;
}

interface AIFlashcardForm {
  topic_id: string;
  custom_topic: string;
  topic_name: string;
  num_flashcards: number;
  difficulty: number;
  content_source: string;
  additional_instructions: string;
}

export function CreateFlashcardModal({
  isOpen,
  onClose,
  onSuccess,
  preselectedTopicId,
}: CreateFlashcardModalProps) {
  const { data: currentUser } = useCurrentUser();
  const { data: topics = [] } = useTopics();

  const [creationMode, setCreationMode] = useState<CreationMode>("manual");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Manual flashcard form
  const [manualForm, setManualForm] = useState<ManualFlashcardForm>({
    question: "",
    answer: "",
    topic_id: preselectedTopicId || "",
    custom_topic: "",
  });

  // AI flashcard form
  const [aiForm, setAIForm] = useState<AIFlashcardForm>({
    topic_id: preselectedTopicId || "",
    custom_topic: "",
    topic_name: "",
    num_flashcards: 10,
    difficulty: 3,
    content_source: "",
    additional_instructions: "",
  });

  // Reset forms when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setManualForm({
        question: "",
        answer: "",
        topic_id: preselectedTopicId || "",
        custom_topic: "",
      });
      setAIForm({
        topic_id: preselectedTopicId || "",
        custom_topic: "",
        topic_name: "",
        num_flashcards: 10,
        difficulty: 3,
        content_source: "",
        additional_instructions: "",
      });
      setCreationMode("manual");
    }
  }, [isOpen, preselectedTopicId]);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("Please log in to create flashcards");
      return;
    }

    if (!manualForm.question.trim() || !manualForm.answer.trim()) {
      toast.error("Question and answer are required");
      return;
    }

    if (!manualForm.topic_id && !manualForm.custom_topic.trim()) {
      toast.error("Please select a topic or create a custom topic");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/flashcards/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: currentUser.user_id,
          question: manualForm.question.trim(),
          answer: manualForm.answer.trim(),
          topic_id: manualForm.topic_id || undefined,
          custom_topic: manualForm.custom_topic.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create flashcard");
      }

      toast.success("Flashcard created successfully!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Create flashcard error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create flashcard"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAISubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error("Please log in to create flashcards");
      return;
    }

    const topicName = aiForm.topic_id
      ? topics.find((t) => t.topic_id === aiForm.topic_id)?.name
      : aiForm.custom_topic.trim();

    if (!topicName) {
      toast.error("Please select a topic or create a custom topic");
      return;
    }

    if (aiForm.num_flashcards < 1 || aiForm.num_flashcards > 50) {
      toast.error("Number of flashcards must be between 1 and 50");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/flashcards/generate/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: currentUser.user_id,
          topic_id: aiForm.topic_id || undefined,
          custom_topic: aiForm.custom_topic.trim() || undefined,
          topic_name: topicName,
          num_flashcards: aiForm.num_flashcards,
          difficulty: aiForm.difficulty,
          content_source: aiForm.content_source.trim() || undefined,
          additional_instructions:
            aiForm.additional_instructions.trim() || undefined,
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

      onSuccess();
      onClose();
    } catch (error) {
      console.error("AI flashcard generation error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to generate flashcards"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const difficultyLabels = [
    "", // Index 0 - unused
    "Beginner",
    "Easy",
    "Medium",
    "Hard",
    "Expert",
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-800/95 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-2xl"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gray-800/95 backdrop-blur-sm border-b border-gray-700/50 p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Create Flashcards
                </h2>
                <p className="text-gray-400 mt-1">
                  Create flashcards manually or generate them with AI
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-white hover:bg-gray-700/50"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Mode Toggle */}
            <div className="flex mt-6 bg-gray-700/50 rounded-lg p-1">
              <button
                onClick={() => setCreationMode("manual")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  creationMode === "manual"
                    ? "bg-blue-500 text-white shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Plus className="h-4 w-4" />
                Manual Creation
              </button>
              <button
                onClick={() => setCreationMode("ai")}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  creationMode === "ai"
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Sparkles className="h-4 w-4" />
                AI Generation
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {creationMode === "manual" ? (
              <form onSubmit={handleManualSubmit} className="space-y-6">
                {/* Topic Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="topic_id" className="text-white mb-2 block">
                      Select Topic
                    </Label>
                    <select
                      id="topic_id"
                      value={manualForm.topic_id}
                      onChange={(e) =>
                        setManualForm({
                          ...manualForm,
                          topic_id: e.target.value,
                          custom_topic: "",
                        })
                      }
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select a topic...</option>
                      {topics.map((topic) => (
                        <option key={topic.topic_id} value={topic.topic_id}>
                          {topic.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label
                      htmlFor="custom_topic"
                      className="text-white mb-2 block"
                    >
                      Or Create New Topic
                    </Label>
                    <Input
                      id="custom_topic"
                      value={manualForm.custom_topic}
                      onChange={(e) =>
                        setManualForm({
                          ...manualForm,
                          custom_topic: e.target.value,
                          topic_id: "",
                        })
                      }
                      placeholder="Enter custom topic name"
                      className="bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400"
                      disabled={!!manualForm.topic_id}
                    />
                  </div>
                </div>

                {/* Question */}
                <div>
                  <Label htmlFor="question" className="text-white mb-2 block">
                    Question *
                  </Label>
                  <textarea
                    id="question"
                    value={manualForm.question}
                    onChange={(e) =>
                      setManualForm({ ...manualForm, question: e.target.value })
                    }
                    placeholder="Enter your flashcard question..."
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                    required
                  />
                </div>

                {/* Answer */}
                <div>
                  <Label htmlFor="answer" className="text-white mb-2 block">
                    Answer *
                  </Label>
                  <textarea
                    id="answer"
                    value={manualForm.answer}
                    onChange={(e) =>
                      setManualForm({ ...manualForm, answer: e.target.value })
                    }
                    placeholder="Enter your flashcard answer..."
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={4}
                    required
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    className="text-gray-400 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        Create Flashcard
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleAISubmit} className="space-y-6">
                {/* Topic Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="ai_topic_id"
                      className="text-white mb-2 block"
                    >
                      Select Topic
                    </Label>
                    <select
                      id="ai_topic_id"
                      value={aiForm.topic_id}
                      onChange={(e) => {
                        const selectedTopic = topics.find(
                          (t) => t.topic_id === e.target.value
                        );
                        setAIForm({
                          ...aiForm,
                          topic_id: e.target.value,
                          custom_topic: "",
                          topic_name: selectedTopic?.name || "",
                        });
                      }}
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="">Select a topic...</option>
                      {topics.map((topic) => (
                        <option key={topic.topic_id} value={topic.topic_id}>
                          {topic.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <Label
                      htmlFor="ai_custom_topic"
                      className="text-white mb-2 block"
                    >
                      Or Create New Topic
                    </Label>
                    <Input
                      id="ai_custom_topic"
                      value={aiForm.custom_topic}
                      onChange={(e) =>
                        setAIForm({
                          ...aiForm,
                          custom_topic: e.target.value,
                          topic_id: "",
                          topic_name: e.target.value,
                        })
                      }
                      placeholder="Enter custom topic name"
                      className="bg-gray-700/50 border-gray-600/50 text-white placeholder-gray-400"
                      disabled={!!aiForm.topic_id}
                    />
                  </div>
                </div>

                {/* Number of Flashcards & Difficulty */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="num_flashcards"
                      className="text-white mb-2 block"
                    >
                      Number of Flashcards
                    </Label>
                    <Input
                      id="num_flashcards"
                      type="number"
                      min="1"
                      max="50"
                      value={aiForm.num_flashcards}
                      onChange={(e) =>
                        setAIForm({
                          ...aiForm,
                          num_flashcards: parseInt(e.target.value) || 10,
                        })
                      }
                      className="bg-gray-700/50 border-gray-600/50 text-white"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="difficulty"
                      className="text-white mb-2 block"
                    >
                      Difficulty Level
                    </Label>
                    <select
                      id="difficulty"
                      value={aiForm.difficulty}
                      onChange={(e) =>
                        setAIForm({
                          ...aiForm,
                          difficulty: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {difficultyLabels.slice(1).map((label, index) => (
                        <option key={index + 1} value={index + 1}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Content Source */}
                <div>
                  <Label
                    htmlFor="content_source"
                    className="text-white mb-2 block"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Content Source (Optional)
                    </div>
                  </Label>
                  <textarea
                    id="content_source"
                    value={aiForm.content_source}
                    onChange={(e) =>
                      setAIForm({ ...aiForm, content_source: e.target.value })
                    }
                    placeholder="Paste your study material, notes, or textbook content here to base the flashcards on..."
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={4}
                  />
                </div>

                {/* Additional Instructions */}
                <div>
                  <Label
                    htmlFor="additional_instructions"
                    className="text-white mb-2 block"
                  >
                    <div className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Additional Instructions (Optional)
                    </div>
                  </Label>
                  <textarea
                    id="additional_instructions"
                    value={aiForm.additional_instructions}
                    onChange={(e) =>
                      setAIForm({
                        ...aiForm,
                        additional_instructions: e.target.value,
                      })
                    }
                    placeholder="Any specific requirements or focus areas for the flashcards..."
                    className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    rows={2}
                  />
                </div>

                {/* AI Feature Highlight */}
                <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/20 p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Brain className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium mb-1">
                        AI-Powered Generation
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Our AI will create educational flashcards optimized for
                        active recall and spaced repetition learning. Each
                        flashcard will test key concepts with clear questions
                        and comprehensive answers.
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Submit Button */}
                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    className="text-gray-400 hover:text-white"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Generate Flashcards
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
