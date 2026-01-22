import { createClient } from '@supabase/supabase-js';

/**
 * Supabase Client Configuration
 * 
 * SECURITY NOTES:
 * - VITE_SUPABASE_ANON_KEY is SAFE to expose in frontend code
 * - It's designed to be public and is protected by Row Level Security (RLS)
 * - The anon key can only do what RLS policies allow
 * - NEVER use the SERVICE_ROLE_KEY here - it bypasses all security
 * 
 * See SECURITY.md for detailed security information.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create a dummy client if env vars are missing (for development)
// This allows the app to run without Supabase configured, but auth won't work
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a mock client that will fail gracefully
    // This is better than crashing the app
    console.warn(
      'Supabase environment variables not found. Authentication features will not work.\n' +
      'Please create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.\n' +
      'See .env.example for reference.'
    );
    
    // Create a client with dummy values - it will fail on actual operations
    return createClient('https://placeholder.supabase.co', 'placeholder-key');
  }
  
  return createClient(supabaseUrl, supabaseAnonKey);
};

export const supabase = createSupabaseClient();
