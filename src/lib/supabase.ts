import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Disable verbose auth logging in all environments
    debug: false,
  },
  // Optimize for better performance and faster connections
  global: {
    headers: {
      'X-Client-Info': 'examcraft-frontend',
      // Add cache control for better performance
      'Cache-Control': 'max-age=300', // 5 minutes
    },
  },
  // Enable connection pooling optimization
  db: {
    schema: 'public',
  },
});

// Import types from centralized database types
import type { User } from "@/types/database";

export interface UserRegistration {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  institution?: string;
  field_of_study?: string;
}

export interface UserLogin {
  email: string;
  password: string;
}
