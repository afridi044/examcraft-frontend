"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, lazy, Suspense, useMemo } from "react";
import { Toaster } from "react-hot-toast";

// Dynamically import devtools only in development - optimized
const ReactQueryDevtools = lazy(() =>
  process.env.NODE_ENV === "development"
    ? import("@tanstack/react-query-devtools").then((d) => ({
        default: d.ReactQueryDevtools,
      }))
    : Promise.resolve({ default: () => null })
);

export default function Providers({ children }: { children: React.ReactNode }) {
  // Create a new QueryClient instance for each component tree
  // This ensures that data is not shared between different users/sessions
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Optimized for performance - balance between fresh data and performance
            staleTime: 2 * 60 * 1000, // 2 minutes - reasonable balance
            gcTime: 10 * 60 * 1000, // 10 minutes - keep in cache longer
            refetchOnWindowFocus: false, // Disabled for better performance
            refetchOnMount: true, // IMPORTANT: Enable initial data fetching
            retry: (failureCount, error) => {
              // Don't retry on 4xx errors
              if (error && typeof error === "object" && "status" in error) {
                const status = error.status as number;
                if (status >= 400 && status < 500) {
                  return false;
                }
              }
              // Retry up to 2 times for other errors (reduced from 3)
              return failureCount < 2;
            },
          },
          mutations: {
            retry: false, // Don't retry mutations by default
          },
        },
      })
  );

  // Memoize toast options to prevent recreation on every render
  const toastOptions = useMemo(
    () => ({
      duration: 3000, // Reduced from 4000ms for better UX
      style: {
        background: "#1f2937",
        color: "#f9fafb",
        border: "1px solid #374151",
      },
      success: {
        style: {
          background: "#065f46",
          border: "1px solid #059669",
        },
      },
      error: {
        style: {
          background: "#7f1d1d",
          border: "1px solid #dc2626",
        },
      },
    }),
    []
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-right" toastOptions={toastOptions} />
      {/* Only show devtools in development */}
      {process.env.NODE_ENV === "development" && (
        <Suspense fallback={null}>
          <ReactQueryDevtools initialIsOpen={false} />
        </Suspense>
      )}
    </QueryClientProvider>
  );
}
