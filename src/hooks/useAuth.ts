"use client";

import { useState, useEffect } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export function useAuth() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Get initial session - only once, optimized for speed
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        // Handle refresh token errors
        if (error && error.message.includes('refresh')) {
          console.warn('Refresh token error, clearing session:', error);
          await supabase.auth.signOut();
          if (isMounted) {
            setUser(null);
            setLoading(false);
            setInitialized(true);
          }
          return;
        }

        if (isMounted) {
          setUser(session?.user ?? null);
          setLoading(false);
          setInitialized(true);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        // Clear potentially corrupted session
        try {
          await supabase.auth.signOut();
        } catch (signOutError) {
          console.error("Error clearing session:", signOutError);
        }
        if (isMounted) {
          setUser(null);
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    // Only initialize if not already initialized
    if (!initialized) {
      initializeAuth();
    }

    // Listen for auth changes - but keep it simple
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (isMounted) {
        // Handle TOKEN_REFRESH errors
        if (event === 'TOKEN_REFRESHED' && !session) {
          console.warn('Token refresh failed, signing out');
          await supabase.auth.signOut();
          setUser(null);
          setLoading(false);
          return;
        }

        // Handle sign out - ensure loading is false
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false);
          setSigningOut(false);
          return;
        }

        setUser(session?.user ?? null);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [initialized]); // Only depend on initialized state

  const signUp = async (
    email: string,
    password: string,
    metadata?: Record<string, unknown>
  ) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: metadata ? { data: metadata } : undefined,
      });

      if (error) throw error;

      setLoading(false); // Set loading false for sign-up since it doesn't auto-sign in
      return { data, error: null };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Signup failed";
      setLoading(false);
      return { data: null, error: errorMessage };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Don't set loading to false here - let the auth state change handle it
      // This prevents double loading state changes
      return { data, error: null };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Sign in failed";
      setLoading(false); // Only set loading false on error
      return { data: null, error: errorMessage };
    }
  };

  const signOut = async () => {
    try {
      // Set signing out state to prevent loading screen
      setSigningOut(true);
      // Immediately set loading to false to prevent loading screen
      setLoading(false);
      
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      return { error: null };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Sign out failed";
      setSigningOut(false);
      setLoading(false);
      return { error: errorMessage };
    }
  };

  // Helper function to clear corrupted auth state
  const clearAuthState = async () => {
    try {
      // Clear localStorage auth data
      if (typeof window !== 'undefined') {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
          if (key.startsWith('sb-') || key.includes('supabase')) {
            localStorage.removeItem(key);
          }
        });
      }
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Reset state
      setUser(null);
      setLoading(false);
      
      return { error: null };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to clear auth state";
      return { error: errorMessage };
    }
  };

  return {
    user,
    loading,
    signingOut,
    signUp,
    signIn,
    signOut,
    clearAuthState, // Export the helper function
    isAuthenticated: !!user,
  };
}
