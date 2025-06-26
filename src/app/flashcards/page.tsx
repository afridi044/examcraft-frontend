"use client";

import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import {
  useUserFlashcards,
  useCurrentUser,
  useInvalidateUserData,
} from "@/hooks/useDatabase";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
  BookOpen,
  Filter,
  X,
  Hash,
  ArrowLeft,
  Play,
  Brain,
  Target,
  Star,
  Trophy,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import type { FlashcardWithTopic, Topic } from "@/types/database";

// Type for FlashCard props
interface FlashCardProps {
  flashcard: FlashcardWithTopic;
  index: number;
}

// Type for TopicCard props
interface TopicCardProps {
  topicId: string;
  topicName: string;
  count: number;
  progress: {
    learning: number;
    under_review: number;
    mastered: number;
    total: number;
  };
  isSelected: boolean;
  onClick: () => void;
  onStudy: () => void;
  index: number;
}

// Topic Card component
const TopicCard = ({
  topicId,
  topicName,
  count,
  progress,
  isSelected,
  onClick,
  onStudy,
  index,
}: TopicCardProps) => {
  return (
    <motion.div
      className="relative overflow-hidden rounded-xl p-6 cursor-pointer transition-all duration-300 bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 hover:border-purple-400/50 hover:shadow-lg hover:shadow-purple-500/20 group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: index * 0.05,
      }}
      whileHover={{ scale: 1.03, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      {/* Background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-400/20 group-hover:border-purple-400/40 transition-colors">
            <BookOpen className="h-6 w-6 text-purple-400 group-hover:text-purple-300 transition-colors" />
          </div>
          <div className="flex items-center space-x-1 px-3 py-1.5 rounded-full bg-gray-700/50 text-xs font-medium text-gray-300 group-hover:bg-purple-500/20 group-hover:text-purple-300 transition-colors">
            <Hash className="h-3 w-3" />
            <span>{count}</span>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-lg text-white group-hover:text-purple-300 transition-colors mb-2">
            {topicName}
          </h3>
          <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors mb-4">
            {count} flashcard{count !== 1 ? "s" : ""}
          </p>

          {/* Topic Progress */}
          <div className="mb-4 space-y-3">
            {/* Progress Bar */}
            <div className="w-full bg-gray-800/50 rounded-full h-2 overflow-hidden">
              <div className="h-full flex">
                {progress.learning > 0 && (
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-orange-400 transition-all duration-300"
                    style={{
                      width: `${(progress.learning / progress.total) * 100}%`,
                    }}
                  />
                )}
                {progress.under_review > 0 && (
                  <div
                    className="bg-gradient-to-r from-blue-400 to-cyan-400 transition-all duration-300"
                    style={{
                      width: `${(progress.under_review / progress.total) * 100}%`,
                    }}
                  />
                )}
                {progress.mastered > 0 && (
                  <div
                    className="bg-gradient-to-r from-green-400 to-emerald-400 transition-all duration-300"
                    style={{
                      width: `${(progress.mastered / progress.total) * 100}%`,
                    }}
                  />
                )}
              </div>
            </div>

            {/* Progress Stats */}
            <div className="flex justify-between text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400"></div>
                <span className="text-gray-400">{progress.learning}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400"></div>
                <span className="text-gray-400">{progress.under_review}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-400"></div>
                <span className="text-gray-400">{progress.mastered}</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onStudy();
            }}
            className="w-full px-4 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/30 text-purple-300 rounded-lg hover:from-purple-500/30 hover:to-blue-500/30 hover:border-purple-400/50 transition-all text-sm font-medium flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Play className="h-4 w-4" />
            Study Now
          </motion.button>
        </div>
      </div>

      {/* Hover indicator */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

// OPTIMIZED: Flashcard component with reduced re-renders
const FlashCard = ({ flashcard, index }: FlashCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // OPTIMIZED: Calculate touch device once and memoize
  const [isTouchDevice] = useState(
    () =>
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0)
  );

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <motion.div
      className="relative group w-full h-56 sm:h-60 md:h-64"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: index * 0.1,
      }}
      onHoverStart={() => !isTouchDevice && setIsHovered(true)}
      onHoverEnd={() => !isTouchDevice && setIsHovered(false)}
      onTouchStart={() => isTouchDevice && setIsHovered(true)}
      onTouchEnd={() =>
        isTouchDevice && setTimeout(() => setIsHovered(false), 1000)
      }
      whileHover={{ scale: 1.02 }}
    >
      <div
        className="relative w-full h-full cursor-pointer perspective-1000"
        onClick={handleFlip}
      >
        <motion.div
          className="absolute w-full h-full backface-hidden rounded-xl preserve-3d"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}
          style={{
            transformStyle: "preserve-3d",
          }}
        >
          {/* Front side of the card */}
          <div
            className={`absolute w-full h-full bg-gray-800/70 border border-gray-700 rounded-xl p-4 sm:p-6 flex flex-col justify-center items-center transition-all shadow-lg ${
              isHovered && !isFlipped ? "shadow-blue-500/30" : "shadow-black/20"
            }`}
            style={{
              backfaceVisibility: "hidden",
            }}
          >
            <motion.p
              className="text-base sm:text-lg md:text-xl font-medium text-white text-center"
              animate={{ scale: isHovered && !isFlipped ? 1.03 : 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {flashcard.question}
            </motion.p>

            {/* Hint for desktop */}
            <motion.div
              className="absolute bottom-3 sm:bottom-4 text-xs text-gray-400 hidden md:block"
              animate={{ opacity: isHovered && !isFlipped ? 1 : 0 }}
              initial={{ opacity: 0 }}
            >
              Click to flip
            </motion.div>

            {/* Hint for mobile */}
            <motion.div
              className="absolute bottom-3 text-xs text-gray-400 block md:hidden"
              initial={{ opacity: 0.7 }}
              animate={{ opacity: [0.7, 0.3, 0.7] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              Tap to flip
            </motion.div>
          </div>

          {/* Back side of the card */}
          <div
            className={`absolute w-full h-full bg-gray-800/70 border border-gray-700 rounded-xl p-4 sm:p-6 flex flex-col justify-center items-center transition-all shadow-lg ${
              isHovered && isFlipped
                ? "shadow-purple-500/30"
                : "shadow-black/20"
            }`}
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <motion.p
              className="text-base sm:text-lg text-gray-200 text-center"
              animate={{ scale: isHovered && isFlipped ? 1.03 : 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {flashcard.answer}
            </motion.p>

            {/* Hint for desktop */}
            <motion.div
              className="absolute bottom-3 sm:bottom-4 text-xs text-gray-400 hidden md:block"
              animate={{ opacity: isHovered && isFlipped ? 1 : 0 }}
              initial={{ opacity: 0 }}
            >
              Click to flip back
            </motion.div>

            {/* Hint for mobile */}
            <motion.div
              className="absolute bottom-3 text-xs text-gray-400 block md:hidden"
              initial={{ opacity: 0.7 }}
              animate={{ opacity: [0.7, 0.3, 0.7] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              Tap to flip back
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Topic info */}
      <div
        className="absolute bottom-0 left-0 right-0 mt-4 px-3 sm:px-5 py-2 sm:py-3 border-t border-gray-700 flex justify-between items-center bg-gray-800/90 rounded-b-xl z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-xs sm:text-sm text-gray-400 truncate max-w-[70%]">
          {flashcard.topic?.name || "General"}
        </span>
        <motion.div
          whileHover={{ rotate: 180 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.3 }}
        >
          <RotateCcw
            size={16}
            className="text-blue-400 opacity-60 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setIsFlipped(false);
            }}
          />
        </motion.div>
      </div>

      {/* Action buttons (visible on hover/touch) */}
      <motion.div
        className="absolute top-2 right-2 flex gap-1 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
      >
        <motion.button
          className="p-1.5 bg-gray-700/80 rounded-md hover:bg-gray-600/80 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Edit flashcard"
        >
          <Pencil size={14} className="text-blue-400" />
        </motion.button>
        <motion.button
          className="p-1.5 bg-gray-700/80 rounded-md hover:bg-gray-600/80 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Delete flashcard"
        >
          <Trash2 size={14} className="text-red-400" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default function FlashcardsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // Get current user profile data to access database user_id
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  const invalidateUserData = useInvalidateUserData();

  // Use the database user_id instead of the Supabase auth user ID
  const {
    data: flashcards,
    isLoading: isLoadingFlashcards,
    refetch: refetchFlashcards,
  } = useUserFlashcards(currentUser?.user_id || "");

  // State for topic selection (null = show topics, string = show flashcards for that topic)
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  // Redirect to landing page if not authenticated and not loading
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [loading, user, router]);

  // Only invalidate data if it's stale or on explicit user action
  // Removed automatic invalidation on mount for better performance
  // Data will now update automatically due to improved query settings

  const handleCreateFlashcard = (topicId?: string) => {
    if (topicId) {
      router.push(`/flashcards/create?topic_id=${topicId}`);
    } else {
      router.push("/flashcards/create");
    }
  };

  // OPTIMIZED: Combined topic stats and overall progress calculation
  const {
    topicStats,
    selectedTopicFlashcards,
    selectedTopicName,
    overallProgress,
  } = useMemo(() => {
    if (!flashcards)
      return {
        topicStats: [],
        selectedTopicFlashcards: [],
        selectedTopicName: "",
        overallProgress: {
          learning: 0,
          under_review: 0,
          mastered: 0,
          total: 0,
        },
      };

    // Group flashcards by topic and calculate overall progress in one pass
    const topicGroups = new Map<string, FlashcardWithTopic[]>();
    const overallProgress = {
      learning: 0,
      under_review: 0,
      mastered: 0,
      total: 0,
    };

    flashcards.forEach((flashcard) => {
      const topicId = flashcard.topic_id || "general";

      // Group by topic
      if (!topicGroups.has(topicId)) {
        topicGroups.set(topicId, []);
      }
      topicGroups.get(topicId)!.push(flashcard);

      // Calculate overall progress
      overallProgress.total++;
      switch (flashcard.mastery_status) {
        case "learning":
          overallProgress.learning++;
          break;
        case "under_review":
          overallProgress.under_review++;
          break;
        case "mastered":
          overallProgress.mastered++;
          break;
      }
    });

    // Create topic stats with progress breakdown
    const stats = Array.from(topicGroups.entries())
      .map(([topicId, cards]) => {
        // Calculate progress for this topic
        const progress = cards.reduce(
          (acc, card) => {
            acc.total++;
            switch (card.mastery_status) {
              case "learning":
                acc.learning++;
                break;
              case "under_review":
                acc.under_review++;
                break;
              case "mastered":
                acc.mastered++;
                break;
            }
            return acc;
          },
          { learning: 0, under_review: 0, mastered: 0, total: 0 }
        );

        return {
          topicId,
          topicName: cards[0]?.topic?.name || "General",
          count: cards.length,
          flashcards: cards,
          progress,
        };
      })
      .sort((a, b) => b.count - a.count); // Sort by count descending

    // Get selected topic's flashcards
    const selectedCards = selectedTopicId
      ? topicGroups.get(selectedTopicId) || []
      : [];
    const selectedName = selectedTopicId
      ? stats.find((s) => s.topicId === selectedTopicId)?.topicName || ""
      : "";

    return {
      topicStats: stats,
      selectedTopicFlashcards: selectedCards,
      selectedTopicName: selectedName,
      overallProgress,
    };
  }, [flashcards, selectedTopicId]);

  // OPTIMIZED: Only inject CSS once on mount, remove debug logs
  useEffect(() => {
    // Check if CSS is already injected
    if (document.querySelector("#flashcard-3d-styles")) return;

    const style = document.createElement("style");
    style.id = "flashcard-3d-styles";
    style.innerHTML = `
      .perspective-1000 {
        perspective: 1000px;
      }
      .preserve-3d {
        transform-style: preserve-3d;
      }
      .backface-hidden {
        backface-visibility: hidden;
      }
    `;
    document.head.appendChild(style);

    return () => {
      const existingStyle = document.querySelector("#flashcard-3d-styles");
      if (existingStyle) {
        document.head.removeChild(existingStyle);
      }
    };
  }, []); // Only run once on mount

  // Add visibility change listener to refetch data when user comes back from study session
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && currentUser?.user_id) {
        // Page became visible, refetch flashcards to get latest data
        refetchFlashcards();
      }
    };

    const handleFocus = () => {
      if (currentUser?.user_id) {
        // Window regained focus, refetch to get latest data
        refetchFlashcards();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [currentUser?.user_id, refetchFlashcards]);

  // FIXED: Proper loading state handling to prevent flickering
  // Improved loading logic - don't show loading state when user is signing out
  const isMainLoading = loading || (loading === false && user && userLoading) || (loading === false && user && !currentUser);
  const isDataLoading = currentUser?.user_id && isLoadingFlashcards;
  
  // Show full loading screen for both auth and initial data load, but not during sign out
  const showFullLoadingScreen = isMainLoading || isDataLoading;

  if (showFullLoadingScreen) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center mt-14 sm:mt-16 md:mt-20">
          <div className="text-center">
            <div className="relative">
              <div className="h-14 w-14 sm:h-16 sm:w-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/50">
                <Loader2 className="h-7 w-7 sm:h-8 sm:w-8 animate-spin text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/30 to-purple-600/30 rounded-2xl blur-xl"></div>
            </div>
            <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
              Loading Flashcards
            </h2>
            <p className="text-sm sm:text-base text-gray-400">
              Preparing your learning materials...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show topics view or flashcards view based on selection
  if (!selectedTopicId) {
    // TOPICS VIEW - Show all topics with flashcard counts
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 mt-14 sm:mt-16 md:mt-20">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Flashcard Topics
              </h1>
              <p className="text-gray-400 mt-1">
                Choose a topic to study your flashcards
              </p>
            </div>
            <motion.button
              onClick={() => handleCreateFlashcard()}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity w-full sm:w-auto"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Plus size={18} />
              <span>Create Flashcard</span>
            </motion.button>
          </div>

          {/* Overall Progress Section */}
          {flashcards && flashcards.length > 0 && (
            <motion.div
              className="mb-6 sm:mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-400/30">
                    <Trophy className="h-5 w-5 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    Overall Progress
                  </h3>
                  <div className="ml-auto text-sm text-gray-400">
                    {overallProgress.total} total flashcards
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <motion.div
                    className="text-center p-4 rounded-lg bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-400/20"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <Brain className="h-5 w-5 text-yellow-400 mr-2" />
                      <span className="text-2xl font-bold text-yellow-400">
                        {overallProgress.learning}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 font-medium">
                      Learning
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {overallProgress.total > 0
                        ? Math.round(
                            (overallProgress.learning / overallProgress.total) *
                              100
                          )
                        : 0}
                      %
                    </p>
                  </motion.div>

                  <motion.div
                    className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/20"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <Target className="h-5 w-5 text-blue-400 mr-2" />
                      <span className="text-2xl font-bold text-blue-400">
                        {overallProgress.under_review}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 font-medium">
                      Under Review
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {overallProgress.total > 0
                        ? Math.round(
                            (overallProgress.under_review /
                              overallProgress.total) *
                              100
                          )
                        : 0}
                      %
                    </p>
                  </motion.div>

                  <motion.div
                    className="text-center p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/20"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex items-center justify-center mb-2">
                      <Star className="h-5 w-5 text-green-400 mr-2" />
                      <span className="text-2xl font-bold text-green-400">
                        {overallProgress.mastered}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 font-medium">
                      Mastered
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {overallProgress.total > 0
                        ? Math.round(
                            (overallProgress.mastered / overallProgress.total) *
                              100
                          )
                        : 0}
                      %
                    </p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Topics Grid */}
          {topicStats.length === 0 && flashcards && flashcards.length === 0 ? (
            <motion.div
              className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 sm:p-8 text-center my-6 sm:my-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
              }}
            >
              <h3 className="text-lg sm:text-xl font-medium text-gray-300 mb-2">
                No flashcards yet
              </h3>
              <p className="text-gray-400 mb-6">
                Create your first flashcard to start learning
              </p>
              <motion.button
                onClick={() => handleCreateFlashcard()}
                className="px-4 sm:px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center gap-2 mx-auto hover:opacity-90 transition-opacity"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus size={18} />
                <span>Create your first flashcard</span>
              </motion.button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {topicStats.map((topic, index) => (
                <TopicCard
                  key={topic.topicId}
                  topicId={topic.topicId}
                  topicName={topic.topicName}
                  count={topic.count}
                  progress={topic.progress}
                  isSelected={false}
                  onClick={() => setSelectedTopicId(topic.topicId)}
                  onStudy={() =>
                    router.push(`/flashcards/study/${topic.topicId}`)
                  }
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // FLASHCARDS VIEW - Show flashcards for selected topic
  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 mt-14 sm:mt-16 md:mt-20">
        {/* Header with Back Button */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <motion.button
                onClick={() => setSelectedTopicId(null)}
                className="p-2 bg-gray-800/50 text-gray-300 rounded-lg border border-gray-600/50 hover:border-purple-400/50 hover:text-purple-400 transition-all"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowLeft size={20} />
              </motion.button>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                {selectedTopicName}
              </h1>
            </div>
            <p className="text-gray-400">
              {selectedTopicFlashcards.length} flashcard
              {selectedTopicFlashcards.length !== 1 ? "s" : ""} in this topic
            </p>
          </div>
          <motion.button
            onClick={() => handleCreateFlashcard(selectedTopicId || undefined)}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity w-full sm:w-auto"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Plus size={18} />
            <span>Create Flashcard</span>
          </motion.button>
        </div>

        {/* Flashcards Grid */}
        {selectedTopicFlashcards.length === 0 && flashcards ? (
          <motion.div
            className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 sm:p-8 text-center my-6 sm:my-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
          >
            <h3 className="text-lg sm:text-xl font-medium text-gray-300 mb-2">
              No flashcards in this topic
            </h3>
            <p className="text-gray-400 mb-6">
              No flashcards found for {selectedTopicName}
            </p>
            <motion.button
              onClick={() => setSelectedTopicId(null)}
              className="px-4 sm:px-5 py-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center gap-2 mx-auto hover:opacity-90 transition-opacity"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowLeft size={18} />
              <span>Back to Topics</span>
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {selectedTopicFlashcards.map((flashcard, index) => (
              <FlashCard
                key={flashcard.flashcard_id}
                flashcard={flashcard}
                index={index}
              />
            ))}
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
