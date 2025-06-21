"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Eye, EyeOff, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export function SignInForm() {
  const router = useRouter();
  // Lazy initialize auth hook to reduce initial load time
  const { signIn, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  // Use lazy initial state for better performance
  const [formData, setFormData] = useState(() => ({
    email: "",
    password: "",
  }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    const { error } = await signIn(formData.email, formData.password);

    if (error) {
      setError(error);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Optimized Floating Elements - Delayed start for faster initial load */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-16 h-16 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-xl"
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          x: [0, 30, 0],
          y: [0, 20, 0],
        }}
        transition={{
          opacity: { delay: 1, duration: 0.5 },
          x: { delay: 1.5, duration: 8, repeat: Infinity, ease: "easeInOut" },
          y: { delay: 1.5, duration: 8, repeat: Infinity, ease: "easeInOut" },
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-xl"
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          x: [0, -30, 0],
          y: [0, -20, 0],
        }}
        transition={{
          opacity: { delay: 1.2, duration: 0.5 },
          x: { delay: 2, duration: 10, repeat: Infinity, ease: "easeInOut" },
          y: { delay: 2, duration: 10, repeat: Infinity, ease: "easeInOut" },
        }}
      />
      <motion.div
        className="absolute top-1/3 right-1/3 w-12 h-12 bg-gradient-to-br from-indigo-500/20 to-blue-500/20 rounded-full blur-xl"
        initial={{ opacity: 0 }}
        animate={{
          opacity: 1,
          x: [0, 20, 0],
          y: [0, -30, 0],
        }}
        transition={{
          opacity: { delay: 1.4, duration: 0.5 },
          x: { delay: 2.2, duration: 9, repeat: Infinity, ease: "easeInOut" },
          y: { delay: 2.2, duration: 9, repeat: Infinity, ease: "easeInOut" },
        }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              ExamCraft
            </span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent mb-2">
            Welcome back
          </h1>
          <p className="text-gray-400">
            Sign in to continue your learning journey
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          className="bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-xl shadow-black/20 p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john.doe@example.com"
                required
                className="bg-gray-700/50 border-gray-600/50 text-gray-200 placeholder-gray-400 focus:border-blue-500/50 focus:ring-blue-500/50"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className="bg-gray-700/50 border-gray-600/50 text-gray-200 placeholder-gray-400 focus:border-blue-500/50 focus:ring-blue-500/50"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors duration-200"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/40 hover:shadow-xl hover:shadow-blue-500/50 transition-all duration-300 hover:-translate-y-0.5"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Links */}
          <div className="mt-6 space-y-4">
            <div className="text-center">
              <Link
                href="/auth/forgot-password"
                className="text-sm text-blue-400 hover:text-blue-300 transition-colors duration-200"
              >
                Forgot your password?
              </Link>
            </div>

            <div className="text-center">
              <p className="text-gray-400">
                Don&apos;t have an account?{" "}
                <Link
                  href="/auth/signup"
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </motion.div>

        {/* Feature Highlights */}
      </div>
    </div>
  );
}
