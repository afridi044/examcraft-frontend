"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Brain,
  Target,
  TrendingUp,
  Users,
  Star,
  ArrowRight,
  BookOpen,
  Clock,
  Trophy,
  Shield,
  ChevronRight,
  Zap,
} from "lucide-react";

// Animated Counter Component
const AnimatedCounter = ({
  value,
  duration = 2000,
}: {
  value: number;
  duration?: number;
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev < value) {
          return Math.min(prev + Math.ceil(value / (duration / 50)), value);
        }
        return prev;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{count}</span>;
};

// Floating Animation Component
const FloatingElement = ({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) => (
  <motion.div
    animate={{
      y: [-10, 10, -10],
      rotate: [-1, 1, -1],
    }}
    transition={{
      duration: 6,
      repeat: Infinity,
      delay,
      ease: "easeInOut",
    }}
  >
    {children}
  </motion.div>
);

// Gradient Orb Background
const GradientOrb = ({ className }: { className?: string }) => (
  <motion.div
    className={`absolute rounded-full blur-3xl opacity-20 ${className}`}
    animate={{
      scale: [1, 1.2, 1],
      opacity: [0.2, 0.3, 0.2],
    }}
    transition={{
      duration: 8,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

// Feature Card Component
const FeatureCard = ({
  icon: Icon,
  title,
  description,
  delay = 0,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    whileHover={{
      scale: 1.02,
      rotateY: 2,
    }}
    className="group"
  >
    <Card className="p-8 bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 hover:border-purple-500/30 transition-all duration-700 h-full">
      <motion.div
        className="mb-6 p-4 w-16 h-16 bg-gradient-to-br from-purple-600/30 to-blue-600/30 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-500"
        whileHover={{ rotate: 180 }}
        transition={{ duration: 1.2 }}
      >
        <Icon className="w-8 h-8 text-purple-400" />
      </motion.div>
      <h3 className="text-2xl font-bold mb-4 text-white group-hover:text-purple-300 transition-colors">
        {title}
      </h3>
      <p className="text-gray-300 leading-relaxed">{description}</p>
      <motion.div
        className="mt-6 flex items-center text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity"
        initial={{ x: -10 }}
        whileHover={{ x: 0 }}
      >
        <span className="text-sm font-medium">Learn more</span>
        <ChevronRight className="w-4 h-4 ml-2" />
      </motion.div>
    </Card>
  </motion.div>
);

// Testimonial Card Component
const TestimonialCard = ({
  name,
  role,
  content,
  rating,
  delay = 0,
}: {
  name: string;
  role: string;
  content: string;
  rating: number;
  delay?: number;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.8 }}
    whileInView={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.6, delay }}
    whileHover={{ y: -5 }}
    className="group"
  >
    <Card className="p-6 bg-gray-900/50 backdrop-blur-sm border border-gray-700/50 hover:border-purple-500/30 transition-all duration-700 h-full">
      <div className="flex mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-5 h-5 ${
              i < rating ? "text-yellow-400 fill-current" : "text-gray-400"
            }`}
          />
        ))}
      </div>
      <p className="text-gray-300 mb-6 italic leading-relaxed">
        &ldquo;{content}&rdquo;
      </p>
      <div className="flex items-center">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
          {name.charAt(0)}
        </div>
        <div className="ml-4">
          <div className="font-bold text-white">{name}</div>
          <div className="text-sm text-gray-400">{role}</div>
        </div>
      </div>
    </Card>
  </motion.div>
);

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <GradientOrb className="w-96 h-96 bg-purple-500 -top-48 -left-48" />
        <GradientOrb className="w-96 h-96 bg-blue-500 top-1/2 -right-48" />
        <GradientOrb className="w-96 h-96 bg-emerald-500 -bottom-48 left-1/3" />

        {/* Floating Particles */}
        {[
          { left: 22.5, top: 99.5, duration: 4.2, delay: 0.5 },
          { left: 65.6, top: 12.7, duration: 3.8, delay: 1.2 },
          { left: 78.9, top: 83.6, duration: 4.5, delay: 0.3 },
          { left: 56.8, top: 66.9, duration: 3.6, delay: 1.8 },
          { left: 39.5, top: 74.4, duration: 4.1, delay: 0.7 },
          { left: 50.8, top: 28.8, duration: 3.9, delay: 1.5 },
          { left: 22.2, top: 65.8, duration: 4.3, delay: 0.2 },
          { left: 74.3, top: 90.7, duration: 3.7, delay: 1.1 },
          { left: 63.3, top: 64.1, duration: 4.0, delay: 0.9 },
          { left: 56.6, top: 10.6, duration: 3.5, delay: 1.7 },
          { left: 15.7, top: 64.7, duration: 4.4, delay: 0.4 },
          { left: 94.6, top: 92.9, duration: 3.8, delay: 1.3 },
          { left: 84.8, top: 79.6, duration: 4.2, delay: 0.6 },
          { left: 28.3, top: 18.5, duration: 3.9, delay: 1.6 },
          { left: 73.5, top: 68.9, duration: 4.1, delay: 0.8 },
          { left: 89.7, top: 16.3, duration: 3.6, delay: 1.4 },
          { left: 23.3, top: 80.6, duration: 4.3, delay: 0.1 },
          { left: 74.2, top: 41.4, duration: 3.7, delay: 1.0 },
          { left: 48.5, top: 69.6, duration: 4.0, delay: 0.5 },
          { left: 33.4, top: 72.1, duration: 3.8, delay: 1.9 },
        ].map((particle, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
            }}
            animate={{
              y: [-20, -100],
              opacity: [0, 1, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
            }}
          />
        ))}
            </div>

      <div className="relative z-10">
        {/* Navigation */}
        <motion.nav
          className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-md border-b border-gray-800/50"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
            <motion.div
              className="flex items-center space-x-2"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.5 }}
            >
              <Brain className="w-8 h-8 text-purple-400" />
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                ExamCraft
              </span>
            </motion.div>
            <div className="flex items-center space-x-6">
            <Link
              href="#features"
                className="text-gray-400 hover:text-gray-200 transition-colors duration-300"
            >
              Features
            </Link>
            <Link
                href="#testimonials"
                className="text-gray-400 hover:text-gray-200 transition-colors duration-300"
            >
                Reviews
            </Link>
              <Button
                variant="outline"
                className="!border-gray-600 !text-gray-300 !bg-transparent hover:!bg-gray-700 hover:!text-white !transition-all !duration-300"
              >
                <Link href="/auth/signin">Sign In</Link>
              </Button>
              <Button className="!bg-gradient-to-r !from-purple-600 !to-blue-600 hover:!from-purple-700 hover:!to-blue-700 !text-white !transition-all !duration-300">
                <Link href="/auth/signup">Start Free Trial</Link>
              </Button>
            </div>
        </div>
        </motion.nav>

      {/* Hero Section */}
        <section className="pt-32 pb-20 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.h1
                className="text-5xl md:text-7xl font-black mb-6 leading-tight"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
              >
                Master Any Exam with{" "}
                <motion.span
                  className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  AI-Powered
                </motion.span>{" "}
                Preparation
              </motion.h1>

              <motion.p
                className="text-xl md:text-2xl text-gray-400 mb-8 max-w-4xl mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Transform your study materials into personalized quizzes,
                flashcards, and mock exams. Our AI analyzes your performance and
                creates adaptive learning paths for guaranteed success.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                >
                  <Button
                    size="lg"
                    className="!bg-gradient-to-r !from-purple-600 !to-blue-600 hover:!from-purple-700 hover:!to-blue-700 !text-white text-lg px-8 py-4 rounded-full relative overflow-hidden group"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 1.2 }}
                    />
                    <Link
                      href="/auth/signup"
                      className="flex items-center space-x-2 relative z-10"
                    >
                      <span>Start Your Journey</span>
                      <ArrowRight className="w-5 h-5" />
            </Link>
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="!border-2 !border-gray-600 !text-gray-300 !bg-transparent hover:!bg-gray-700 hover:!text-white text-lg px-8 py-4 rounded-full backdrop-blur-sm !transition-all !duration-500"
                  >
                    <Link href="#demo" className="flex items-center space-x-2">
                      <span>Watch Demo</span>
                      <ArrowRight className="w-5 h-5" />
            </Link>
                  </Button>
                </motion.div>
              </motion.div>

              {/* Stats Counter */}
              <motion.div
                className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-400 mb-2">
                    <AnimatedCounter value={50000} />+
                  </div>
                  <div className="text-gray-300">Students Helped</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-pink-400 mb-2">
                    <AnimatedCounter value={94} />%
                  </div>
                  <div className="text-gray-300">Success Rate</div>
          </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-400 mb-2">
                    <AnimatedCounter value={1000} />+
        </div>
                  <div className="text-gray-300">Exams Covered</div>
          </div>
              </motion.div>
            </motion.div>

            {/* 3D Floating Elements */}
            <div className="absolute top-20 left-10 hidden lg:block">
              <FloatingElement delay={0}>
                <div className="p-4 bg-purple-500/20 backdrop-blur-sm rounded-2xl border border-purple-400/30">
                  <Brain className="w-8 h-8 text-purple-400" />
              </div>
              </FloatingElement>
            </div>
            <div className="absolute top-32 right-10 hidden lg:block">
              <FloatingElement delay={1}>
                <div className="p-4 bg-pink-500/20 backdrop-blur-sm rounded-2xl border border-pink-400/30">
                  <Trophy className="w-8 h-8 text-pink-400" />
              </div>
              </FloatingElement>
            </div>
              </div>
        </section>

        {/* Features Section */}
        <section id="features" className="pt-20 pb-20 px-6 scroll-mt-24">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Powerful Features to{" "}
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Boost Your Learning
                </span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Our platform combines cutting-edge AI technology with proven
                learning methods
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={Brain}
                title="AI-Generated Practice"
                description="Upload your notes and our AI creates personalized questions that adapt to your learning style and knowledge gaps."
                delay={0}
              />
              <FeatureCard
                icon={Clock}
                title="Timed Mock Exams"
                description="Simulate real exam conditions with countdown timers, auto-submit functionality, and detailed performance analytics."
                delay={0.1}
              />
              <FeatureCard
                icon={Target}
                title="Smart Flashcards"
                description="Convert incorrect answers into spaced repetition flashcards with our intelligent review algorithm."
                delay={0.2}
              />
              <FeatureCard
                icon={TrendingUp}
                title="Performance Analytics"
                description="Track your progress with detailed insights, identify weak areas, and optimize your study plan."
                delay={0.3}
              />
              <FeatureCard
                icon={Shield}
                title="Adaptive Learning"
                description="Our AI adjusts difficulty and focus areas based on your performance to maximize learning efficiency."
                delay={0.4}
              />
              <FeatureCard
                icon={Users}
                title="Collaborative Study"
                description="Join study groups, share resources, and compete with peers in leaderboards and challenges."
                delay={0.5}
              />
            </div>
              </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                How ExamCraft{" "}
                <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
                  Works
                </span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Get started in minutes and see results in days
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Upload Your Materials",
                  description:
                    "Simply upload your textbooks, notes, or study materials. Our AI processes them instantly.",
                  icon: BookOpen,
                },
                {
                  step: "02",
                  title: "AI Creates Your Plan",
                  description:
                    "Our intelligent system analyzes your content and creates personalized quizzes and study schedules.",
                  icon: Brain,
                },
                {
                  step: "03",
                  title: "Practice & Improve",
                  description:
                    "Take adaptive quizzes, track your progress, and watch your scores improve with each session.",
                  icon: Trophy,
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  className="text-center group"
                >
                  <div className="relative mb-8">
                    <motion.div
                      className="w-20 h-20 mx-auto bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <item.icon className="w-10 h-10 text-purple-400" />
                    </motion.div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {item.step}
            </div>
              </div>
                  <h3 className="text-2xl font-bold mb-4 text-white">
                    {item.title}
              </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {item.description}
              </p>
                </motion.div>
              ))}
            </div>
              </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="pt-20 pb-20 px-6 scroll-mt-24">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                What Students{" "}
                <span className="bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
                  Are Saying
                </span>
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Join thousands of students who improved their grades with
                ExamCraft
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <TestimonialCard
                name="Sarah Chen"
                role="Medical Student"
                content="ExamCraft helped me increase my MCAT score by 15 points. The adaptive learning is incredible!"
                rating={5}
                delay={0}
              />
              <TestimonialCard
                name="Marcus Rodriguez"
                role="Engineering Student"
                content="The AI-generated practice questions were spot-on. I felt completely prepared for my finals."
                rating={5}
                delay={0.1}
              />
              <TestimonialCard
                name="Emily Johnson"
                role="Law Student"
                content="The flashcard system saved me hours of study time. I passed the bar exam on my first try!"
                rating={5}
                delay={0.2}
              />
          </div>
        </div>
      </section>

      {/* CTA Section */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-400/30 rounded-3xl p-12"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 mx-auto mb-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
              >
                <Trophy className="w-8 h-8 text-white" />
              </motion.div>

              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Ready to{" "}
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Transform
                </span>{" "}
                Your Study Experience?
          </h2>

              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Join over 50,000 students who are using ExamCraft to achieve
                better results with less stress. Start your free trial today and
                experience the future of exam preparation.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                >
                  <Button
                    size="lg"
                    className="!bg-gradient-to-r !from-purple-600 !to-blue-600 hover:!from-purple-700 hover:!to-blue-700 !text-white text-lg px-8 py-4 rounded-full relative overflow-hidden group"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"
                      initial={{ x: "-100%" }}
                      whileHover={{ x: "100%" }}
                      transition={{ duration: 1.2 }}
                    />
                    <Link
                      href="/auth/signup"
                      className="flex items-center space-x-2 relative z-10"
                    >
                      <span>Start Free Trial</span>
                      <ArrowRight className="w-5 h-5" />
                    </Link>
                  </Button>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.3 }}
                >
                  <Button
                    size="lg"
                    variant="outline"
                    className="!border-2 !border-gray-600 !text-gray-300 !bg-transparent hover:!bg-gray-700 hover:!text-white text-lg px-8 py-4 rounded-full backdrop-blur-sm !transition-all !duration-500"
                  >
          <Link
                      href="/contact"
                      className="flex items-center space-x-2"
          >
                      <span>Talk to Sales</span>
                      <Users className="w-5 h-5" />
          </Link>
                  </Button>
                </motion.div>
              </div>

              <div className="mt-8 text-sm text-gray-400">
                No credit card required • Free 14-day trial • Cancel anytime
              </div>
            </motion.div>
        </div>
      </section>

      {/* Footer */}
        <footer className="py-12 px-6 border-t border-white/10">
          <div className="max-w-7xl mx-auto text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Target className="w-6 h-6 text-purple-400" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                ExamCraft
              </span>
              </div>
            <p className="text-gray-400 mb-6">
              The AI-powered exam preparation platform that guarantees success.
            </p>
            <div className="flex justify-center space-x-8 text-sm text-gray-400">
              <Link
                href="/privacy"
                className="hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="hover:text-white transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/contact"
                className="hover:text-white transition-colors"
              >
                Contact
              </Link>
              <Link href="/help" className="hover:text-white transition-colors">
                Help
              </Link>
            </div>
            <div className="mt-6 text-xs text-gray-500">
              © 2025 ExamCraft. All rights reserved.
            </div>
          </div>
        </footer>
        </div>
    </div>
  );
}
