// Connection warmup utility to reduce cold start latency
import { supabase } from "./database";

let connectionWarmed = false;
let warmupPromise: Promise<void> | null = null;

// Warm up the database connection with a simple query
export async function warmupConnection(): Promise<void> {
  // If already warmed up or warming up, return
  if (connectionWarmed || warmupPromise) {
    return warmupPromise || Promise.resolve();
  }

  // Start warming up
  warmupPromise = (async () => {
    try {
      // Make a simple query to establish connection
      // This is a lightweight query that just checks if the connection works
      await supabase.from("topics").select("count").limit(1);
      connectionWarmed = true;
    } catch (error) {
      // Don't throw - warmup failures shouldn't break the app
      console.warn("Connection warmup failed:", error);
    } finally {
      warmupPromise = null;
    }
  })();

  return warmupPromise;
}

// Auto-warmup on import (non-blocking)
if (typeof window !== "undefined") {
  // Only warm up in browser environment
  setTimeout(() => {
    warmupConnection().catch(() => {
      // Ignore errors - this is just an optimization
    });
  }, 100); // Small delay to not block initial page load
}
