"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export default function Providers({ children }: { children: React.ReactNode }) {
  // Optimized QueryClient with better caching and performance settings
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Increased stale time for better performance
            staleTime: 5 * 60 * 1000, // 5 minutes
            // Cache data for longer to reduce network requests
            gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
            // Retry strategy optimized for different error types
            retry: (failureCount, error) => {
              // Don't retry on authentication errors (4xx)
              if (error && typeof error === "object" && "status" in error) {
                const status = error.status as number;
                if (status >= 400 && status < 500) return false;
                if (status === 500) return failureCount < 2; // Retry server errors twice
              }
              // Retry network errors up to 3 times
              return failureCount < 3;
            },
            // Reduce background refetching for better performance
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            // Only refetch on mount if data is stale
            refetchOnMount: (query) => query.state.data === undefined,
          },
          mutations: {
            // Don't retry mutations by default for safety
            retry: false,
            // Add network error retry for mutations
            networkMode: "offlineFirst",
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Only show devtools in development */}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} position="bottom-right" />
      )}
    </QueryClientProvider>
  );
}
