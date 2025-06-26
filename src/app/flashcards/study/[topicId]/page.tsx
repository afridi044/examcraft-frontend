"use client";

import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentUser } from "@/hooks/useDatabase";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  RotateCcw,
  Trophy,
  Target,
  Brain,
  BookOpen,
  Zap,
  Star,
} from "lucide-react";
import type { FlashcardWithTopic } from "@/types/database";

interface StudySession {
  topic_id: string;
  topic_name: string;
  total_cards: number;
  mastery_status: "learning" | "under_review" | "mastered" | "all";
  cards: FlashcardWithTopic[];
  session_id: string;
}

type PerformanceType = "know" | "dont_know";

interface StudySessionPageProps {
  params: Promise<{ topicId: string }>;
}

interface SessionStats {
  totalSeen: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
  cardsRemaining: number;
}

export default function StudySessionPage({ params }: StudySessionPageProps) {
  const router = useRouter();
  const { user, loading, signingOut } = useAuth();
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();

  // Redirect to landing page if user is signed out
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [loading, user, router]);
  
  const queryClient = useQueryClient();

  const [topicId, setTopicId] = useState<string>("");
  const [session, setSession] = useState<StudySession | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  // Simplified loading logic
  const isAuthenticating = loading && !signingOut;
  const isLoadingUserData = userLoading && !signingOut;
  const isLoadingStudyData = dataLoading && !signingOut;
  
  // Show loading screen only when necessary and aggressively prevent during sign out
  const showLoadingScreen = user && !signingOut && (isAuthenticating || isLoadingUserData || isLoadingStudyData);

  // Fixed stats tracking
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    totalSeen: 0,
    correctAnswers: 0,
    incorrectAnswers: 0,
    accuracy: 0,
    cardsRemaining: 0,
  });

  // Track which cards have been answered to prevent double counting
  const [answeredCards, setAnsweredCards] = useState<Set<string>>(new Set());

  // OPTIMIZED: Streamlined session initialization with useCallback
  const initializeSession = useCallback(
    async (resolvedTopicId: string, userId: string) => {
      try {
        setDataLoading(true);
        const response = await fetch("/api/flashcards/study-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_id: userId,
            topic_id: resolvedTopicId,
            mastery_status: "learning",
          }),
        });

        const data = await response.json();
        if (data.success) {
          setSession(data.session);
          setSessionStats((prev) => ({
            ...prev,
            cardsRemaining: data.session.cards.length,
          }));
        }
      } catch {
        // Silent error handling - user will see "no cards" state
      } finally {
        setDataLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    let isMounted = true;

    const init = async () => {
      const p = await params;
      const resolvedTopicId = p.topicId;

      if (!isMounted) return;
      setTopicId(resolvedTopicId);

      if (currentUser?.user_id && resolvedTopicId) {
        await initializeSession(resolvedTopicId, currentUser.user_id);
      }
    };

    init();

    return () => {
      isMounted = false;
    };
  }, [currentUser?.user_id, params, initializeSession]);

  const handlePerformance = async (performance: PerformanceType) => {
    if (!session || !session.cards[currentCardIndex] || isUpdating) return;

    const currentCard = session.cards[currentCardIndex];
    const cardId = currentCard.flashcard_id;

    setIsUpdating(true);

    // IMMEDIATE UI UPDATES - Move to next card instantly for snappy UX
    const isLastCard = currentCardIndex >= session.cards.length - 1;

    // Update stats immediately (optimistic update)
    if (!answeredCards.has(cardId)) {
      setAnsweredCards((prev) => new Set(prev).add(cardId));

      setSessionStats((prev) => {
        const newCorrect =
          performance === "know"
            ? prev.correctAnswers + 1
            : prev.correctAnswers;
        const newIncorrect =
          performance === "dont_know"
            ? prev.incorrectAnswers + 1
            : prev.incorrectAnswers;
        const newTotalSeen = prev.totalSeen + 1;
        const newAccuracy =
          newTotalSeen > 0 ? Math.round((newCorrect / newTotalSeen) * 100) : 0;
        const newRemaining = Math.max(0, session.cards.length - newTotalSeen);

        return {
          totalSeen: newTotalSeen,
          correctAnswers: newCorrect,
          incorrectAnswers: newIncorrect,
          accuracy: newAccuracy,
          cardsRemaining: newRemaining,
        };
      });
    }

    // Move to next card immediately
    if (!isLastCard) {
      setCurrentCardIndex((prev) => prev + 1);
      setIsFlipped(false);
    }

    setIsUpdating(false);

    // BACKGROUND UPDATES - Fire and forget for database sync
    // Don't await these - let them happen in background
    updateFlashcardInBackground(cardId, performance, currentCard, isLastCard);
  };

  // Separate function for background database updates
  const updateFlashcardInBackground = async (
    cardId: string,
    performance: PerformanceType,
    currentCard: FlashcardWithTopic,
    isLastCard: boolean
  ) => {
    try {
      // Update flashcard progress in database
      const updateResponse = await fetch("/api/flashcards/update-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flashcard_id: cardId,
          performance: performance,
        }),
      });

      if (updateResponse.ok) {
        const updateData = await updateResponse.json();

        // Update the session data with new mastery status
        if (updateData.success) {
          setSession((prevSession) => {
            if (!prevSession) return prevSession;
            const updatedCards = [...prevSession.cards];
            const cardIndex = updatedCards.findIndex(
              (card) => card.flashcard_id === cardId
            );
            if (cardIndex !== -1) {
              updatedCards[cardIndex] = {
                ...updatedCards[cardIndex],
                mastery_status: updateData.mastery_status,
                consecutive_correct: updateData.consecutive_correct,
              };
            }
            return { ...prevSession, cards: updatedCards };
          });
        }

        // Invalidate cache for fresh data when navigating back (non-blocking)
        queryClient.invalidateQueries({
          queryKey: ["flashcards", "user", currentUser?.user_id],
        });
      }

      // Navigate to completion page if this was the last card
      if (isLastCard) {
        router.push(`/flashcards/study/${topicId}/complete`);
      }
    } catch (error) {
      console.error("Background update error:", error);
      // Don't show error to user since UI already updated
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleBack = () => {
    router.push("/flashcards");
  };

  const handleRestart = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setAnsweredCards(new Set());
    setSessionStats({
      totalSeen: 0,
      correctAnswers: 0,
      incorrectAnswers: 0,
      accuracy: 0,
      cardsRemaining: session?.cards.length || 0,
    });
  };

  // OPTIMIZED: Memoized calculations with null safety
  const { currentCard, progressPercentage } = useMemo(() => {
    if (!session?.cards?.length) {
      return { currentCard: null, progressPercentage: 0 };
    }

    const card = session.cards[currentCardIndex] || null;
    const progress = (sessionStats.totalSeen / session.cards.length) * 100;

    return { currentCard: card, progressPercentage: progress };
  }, [session?.cards, currentCardIndex, sessionStats.totalSeen]);

  // Guard clause for null currentCard
  if (!currentCard) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
          <div className="text-center max-w-md mx-auto">
            <div className="h-16 w-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-8 w-8 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Loading Flashcard...
            </h2>
            <p className="text-slate-400 mb-8">
              Please wait while we prepare your study session.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show loading screen only when necessary
  if (showLoadingScreen) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="h-12 w-12 bg-purple-500 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-white mb-1">
              Loading Study Session
            </h2>
            <p className="text-slate-400 text-sm">Please wait...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // No session found
  if (!session || !session.cards || session.cards.length === 0) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900">
          <div className="text-center max-w-md mx-auto">
            <div className="h-16 w-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-8 w-8 text-slate-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              No Flashcards Available
            </h2>
            <p className="text-slate-400 mb-8">
              This topic doesn&apos;t have any flashcards yet. Create some
              flashcards to start studying!
            </p>
            <motion.button
              onClick={handleBack}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-medium hover:opacity-90 transition-opacity"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Back to Flashcards
            </motion.button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900/10 to-slate-900 p-20">
        {/* Header */}
        <div className="border-b border-slate-800/50 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.button
                  onClick={handleBack}
                  className="p-2 bg-slate-800/50 text-slate-300 rounded-xl border border-slate-700/50 hover:border-purple-400/50 hover:text-purple-400 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft size={20} />
                </motion.button>
                <div>
                  <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    <Target className="h-5 w-5 text-purple-400" />
                    {session.topic_name}
                  </h1>
                  <p className="text-sm text-slate-400">
                    {session.mastery_status === "learning" &&
                      "🎯 Learning Mode"}
                    {session.mastery_status === "under_review" &&
                      "📝 Review Mode"}
                    {session.mastery_status === "mastered" &&
                      "⭐ Mastered Mode"}
                    {session.mastery_status === "all" && "📚 All Cards"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <motion.button
                  onClick={handleRestart}
                  className="p-2 bg-slate-800/50 text-slate-300 rounded-xl border border-slate-700/50 hover:border-orange-400/50 hover:text-orange-400 transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  title="Restart Session"
                >
                  <RotateCcw size={18} />
                </motion.button>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">
                    {currentCardIndex + 1} / {session.cards.length}
                  </p>
                  <p className="text-xs text-slate-400">Cards</p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-400">
                  Progress: {sessionStats.totalSeen} / {session.cards.length}{" "}
                  answered
                </span>
                <span className="text-xs text-slate-400">
                  {Math.round(progressPercentage)}% complete
                </span>
              </div>
              <div className="w-full bg-slate-800/50 rounded-full h-3 relative overflow-hidden">
                {/* Progress fill */}
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-slate-500">
                  Card {currentCardIndex + 1}
                </span>
                <span className="text-xs text-slate-500">
                  {session.cards.length} total
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-8">
          {/* Current Session Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 text-center backdrop-blur-sm">
              <div className="flex items-center justify-center mb-2">
                <Brain className="h-5 w-5 text-blue-400 mr-2" />
                <span className="text-2xl font-bold text-white">
                  {sessionStats.totalSeen}
                </span>
              </div>
              <p className="text-xs text-slate-400">This Session</p>
            </div>

            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 text-center backdrop-blur-sm">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="h-5 w-5 text-green-400 mr-2" />
                <span className="text-2xl font-bold text-green-400">
                  {sessionStats.correctAnswers}
                </span>
              </div>
              <p className="text-xs text-slate-400">Known</p>
            </div>

            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 text-center backdrop-blur-sm">
              <div className="flex items-center justify-center mb-2">
                <XCircle className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-2xl font-bold text-red-400">
                  {sessionStats.incorrectAnswers}
                </span>
              </div>
              <p className="text-xs text-slate-400">Learning</p>
            </div>

            <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 text-center backdrop-blur-sm">
              <div className="flex items-center justify-center mb-2">
                <Zap className="h-5 w-5 text-yellow-400 mr-2" />
                <span className="text-2xl font-bold text-yellow-400">
                  {sessionStats.accuracy}%
                </span>
              </div>
              <p className="text-xs text-slate-400">Accuracy</p>
            </div>
          </div>

          {/* Main Flashcard */}
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="relative w-full h-96 cursor-pointer mb-8"
              onClick={handleFlip}
              whileHover={{ scale: 1.02 }}
              style={{ perspective: "1000px" }}
            >
              <motion.div
                className="absolute w-full h-full"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Question Side */}
                <div
                  className="absolute w-full h-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-slate-700/50 rounded-2xl p-8 flex flex-col justify-center items-center shadow-2xl backdrop-blur-sm"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <div className="text-center w-full">
                    <div className="mb-6">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-full mb-4">
                        <BookOpen className="h-6 w-6 text-purple-400" />
                      </div>
                      <p className="text-sm text-slate-400 uppercase tracking-wider font-medium">
                        Question
                      </p>
                    </div>
                    <h2 className="text-2xl md:text-3xl text-white font-medium leading-relaxed mb-6 max-w-2xl mx-auto">
                      {currentCard.question}
                    </h2>

                    {/* Mastery Status Indicator */}
                    <div className="mb-4">
                      {currentCard.mastery_status === "learning" && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/20 border border-yellow-400/30 text-yellow-300 rounded-full text-sm">
                          <Brain className="h-4 w-4" />
                          Learning
                        </div>
                      )}
                      {currentCard.mastery_status === "under_review" && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 border border-blue-400/30 text-blue-300 rounded-full text-sm">
                          <Target className="h-4 w-4" />
                          Under Review
                        </div>
                      )}
                      {currentCard.mastery_status === "mastered" && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-400/30 text-green-300 rounded-full text-sm">
                          <Star className="h-4 w-4" />
                          Mastered
                        </div>
                      )}
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700/30 rounded-full">
                      <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                      <span className="text-sm text-slate-300">
                        Click to reveal answer
                      </span>
                    </div>
                  </div>
                </div>

                {/* Answer Side */}
                <div
                  className="absolute w-full h-full bg-gradient-to-br from-purple-800/90 to-pink-800/90 border border-purple-600/50 rounded-2xl p-8 flex flex-col justify-center items-center shadow-2xl backdrop-blur-sm"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  <div className="text-center w-full">
                    <div className="mb-6">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-full mb-4">
                        <Star className="h-6 w-6 text-white" />
                      </div>
                      <p className="text-sm text-purple-100 uppercase tracking-wider font-medium">
                        Answer
                      </p>
                    </div>
                    <h2 className="text-2xl md:text-3xl text-white font-medium leading-relaxed max-w-2xl mx-auto">
                      {currentCard.answer}
                    </h2>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Action Buttons */}
            <AnimatePresence>
              {isFlipped && (
                <motion.div
                  className="flex justify-center gap-6 max-w-2xl mx-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.button
                    onClick={() => handlePerformance("dont_know")}
                    className="flex-1 max-w-xs p-6 bg-gradient-to-r from-red-500/20 to-red-600/20 border border-red-400/30 text-red-300 rounded-2xl transition-all duration-200 hover:from-red-500/30 hover:to-red-600/30 hover:border-red-400/50 hover:scale-105"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-center">
                      <XCircle className="h-8 w-8 mx-auto mb-3 text-red-400" />
                      <span className="text-lg font-semibold block mb-1">
                        I Don&apos;t Know
                      </span>
                      <p className="text-sm opacity-80">Need more practice</p>
                    </div>
                  </motion.button>

                  <motion.button
                    onClick={() => handlePerformance("know")}
                    className="flex-1 max-w-xs p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 text-green-300 rounded-2xl transition-all duration-200 hover:from-green-500/30 hover:to-emerald-500/30 hover:border-green-400/50 hover:scale-105"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-center">
                      <CheckCircle className="h-8 w-8 mx-auto mb-3 text-green-400" />
                      <span className="text-lg font-semibold block mb-1">
                        I Know This
                      </span>
                      <p className="text-sm opacity-80">
                        Mastering this concept
                      </p>
                    </div>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom Stats */}
            <div className="mt-12 text-center">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800/30 border border-slate-700/50 text-slate-300 rounded-full backdrop-blur-sm">
                <Trophy className="h-4 w-4 text-yellow-400" />
                <span className="text-sm font-medium">
                  {sessionStats.cardsRemaining} cards remaining
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
