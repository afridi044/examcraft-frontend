import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ExamCraft - AI-Powered Exam Preparation",
  description:
    "Transform your study materials into interactive quizzes, take timed mock exams, and track your progress with intelligent analytics. Master your exams with AI-powered learning.",
  keywords:
    "exam preparation, AI quizzes, mock exams, flashcards, study analytics, learning platform",
  authors: [{ name: "ExamCraft Team" }],
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload critical resources for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Supabase connection optimization */}
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_SUPABASE_URL || "https://supabase.com"} />
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL || "https://supabase.com"} />
        
        {/* Additional performance optimizations */}
        <link rel="dns-prefetch" href="https://api.supabase.com" />
        <link rel="dns-prefetch" href="https://supabase.com" />
        
        <meta name="theme-color" content="#1f2937" />
        
        {/* Resource hints for better performance */}
        <link rel="prefetch" href="/api/health" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
