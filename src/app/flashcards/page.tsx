"use client";

import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import { useUserFlashcards, useCurrentUser } from "@/hooks/useDatabase";
import { Loader2, Plus, Pencil, Trash2, RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { FlashcardWithTopic } from "@/types/database";

// Type for FlashCard props
interface FlashCardProps {
  flashcard: FlashcardWithTopic;
  index: number;
}

// Flashcard component with 3D flip animation
const FlashCard = ({ flashcard, index }: FlashCardProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Detect touch device on mount
  useEffect(() => {
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
  }, []);

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
        delay: index * 0.1 
      }}
      onHoverStart={() => !isTouchDevice && setIsHovered(true)}
      onHoverEnd={() => !isTouchDevice && setIsHovered(false)}
      onTouchStart={() => isTouchDevice && setIsHovered(true)} 
      onTouchEnd={() => isTouchDevice && setTimeout(() => setIsHovered(false), 1000)}
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
            damping: 20
          }}
          style={{
            transformStyle: "preserve-3d"
          }}
        >
          {/* Front side of the card */}
          <div
            className={`absolute w-full h-full bg-gray-800/70 border border-gray-700 rounded-xl p-4 sm:p-6 flex flex-col justify-center items-center transition-all shadow-lg ${
              isHovered && !isFlipped ? "shadow-blue-500/30" : "shadow-black/20"
            }`}
            style={{
              backfaceVisibility: "hidden"
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
              isHovered && isFlipped ? "shadow-purple-500/30" : "shadow-black/20"
            }`}
            style={{ 
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)"
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
        onClick={e => e.stopPropagation()}
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
        onClick={e => e.stopPropagation()}
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
  // Get current user profile data to access database user_id
  const { data: currentUser, isLoading: userLoading } = useCurrentUser();
  
  // Use the database user_id instead of the Supabase auth user ID
  const { data: flashcards, isLoading: isLoadingFlashcards } = useUserFlashcards(
    currentUser?.user_id || ""
  );
  
  useEffect(() => {
    // Add CSS for 3D perspective to document head
    const style = document.createElement('style');
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
    
    if (user) {
      console.log("Auth User ID (Supabase):", user.id);
    }
    
    if (currentUser) {
      console.log("Database User ID:", currentUser.user_id);
    }
    
    if (flashcards) {
      console.log("Fetched flashcards for user:", currentUser?.user_id);
      console.log("Total flashcards:", flashcards.length);
    }
    
    return () => {
      document.head.removeChild(style);
    };
  }, [flashcards, user, currentUser]);

  // Show loading state while auth user or database user is loading
  if (loading || userLoading || !user) {
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
            <p className="text-sm sm:text-base text-gray-400">Preparing your learning materials...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 mt-14 sm:mt-16 md:mt-20">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Flashcards</h1>
          <motion.button 
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center sm:justify-start gap-2 hover:opacity-90 transition-opacity w-full sm:w-auto"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Plus size={18} />
            <span>Create Flashcard</span>
          </motion.button>
        </div>
        
        {isLoadingFlashcards ? (
          <div className="flex justify-center my-8 sm:my-12">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-2" />
              <p className="text-gray-400">Loading your flashcards...</p>
            </div>
          </div>
        ) : !flashcards || flashcards.length === 0 ? (
          <motion.div 
            className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 sm:p-8 text-center my-6 sm:my-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 260,
              damping: 20
            }}
          >
            <h3 className="text-lg sm:text-xl font-medium text-gray-300 mb-2">No flashcards yet</h3>
            <p className="text-gray-400 mb-6">Create your first flashcard to start learning</p>
            <motion.button 
              className="px-4 sm:px-5 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center gap-2 mx-auto hover:opacity-90 transition-opacity"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Plus size={18} />
              <span>Create your first flashcard</span>
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {flashcards.map((flashcard, index) => (
              <FlashCard 
                key={flashcard.flashcard_id} 
                flashcard={flashcard} 
                index={index} 
              />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}