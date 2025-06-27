"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart3, Search, Crown, User, Menu } from "lucide-react";

export function TopNavbar() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowMobileSearch(false);
    }
  };

  return (
    <div className="h-[60px] fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-xl border-b border-gray-700/50">
      <div className="h-full max-w-7xl mx-auto px-2 sm:px-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0"
        >
          <div className="h-6 w-6 sm:h-8 sm:w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
          </div>
          <span className="text-base sm:text-lg font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
            ExamCraft
          </span>
        </Link>

        {/* Desktop Search Bar */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex flex-1 max-w-2xl mx-4 lg:mx-8"
        >
          <div className="relative w-full">
            <Input
              type="search"
              placeholder="Search quizzes, exams, or flashcards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 sm:h-10 pl-10 bg-gray-800/50 border-gray-700/50 text-gray-200 placeholder-gray-500 focus:border-blue-500/50 focus:ring-blue-500/20"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          </div>
        </form>

        {/* Right Side Actions */}
        <div className="flex items-center space-x-1 sm:space-x-2 lg:space-x-4">
          {/* Mobile Search Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="md:hidden text-gray-400 hover:text-white hover:bg-gray-800/50 p-2"
          >
            <Search className="h-4 w-4" />
          </Button>

          {/* Desktop Action Buttons */}
          <div className="hidden sm:flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-gray-800/50 text-xs sm:text-sm px-2 sm:px-3"
            >
              <Crown className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden lg:inline">Upgrade</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-400 hover:text-white hover:bg-gray-800/50 text-xs sm:text-sm px-2 sm:px-3"
            >
              <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden lg:inline">
                {user?.email?.split("@")[0]}
              </span>
            </Button>
          </div>

          {/* Mobile Menu Button (for very small screens) */}
          <Button
            variant="ghost"
            size="sm"
            className="sm:hidden text-gray-400 hover:text-white hover:bg-gray-800/50 p-2"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      {showMobileSearch && (
        <div className="md:hidden bg-gray-900/95 backdrop-blur-xl border-t border-gray-700/50 p-3">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 pl-10 bg-gray-800/50 border-gray-700/50 text-gray-200 placeholder-gray-500 focus:border-blue-500/50 focus:ring-blue-500/20"
                autoFocus
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
