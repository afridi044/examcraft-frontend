"use client";

import { useState, useEffect } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export function useAuth() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // Get initial session - only once
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (isMounted) {
          setUser(session?.user ?? null);
          setLoading(false);
          setInitialized(true);
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
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
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (isMounted) {
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

      return { data, error: null };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Signup failed";
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
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

      return { data, error: null };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Sign in failed";
      return { data: null, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      return { error: null };
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Sign out failed";
      return { error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user,
  };
}
