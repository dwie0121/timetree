import { createClient } from '@supabase/supabase-js';

/**
 * Robust environment variable access to prevent runtime crashes.
 */
export const safeGetEnv = (key: string): string | undefined => {
  try {
    // Check import.meta.env (Vite)
    const metaEnv = (import.meta as any).env;
    if (metaEnv && metaEnv[key]) return metaEnv[key];

    // Check process.env (Node fallback)
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {
    // Silent catch for restricted environments
  }
  return undefined;
};

// Use provided credentials as defaults if environment variables are missing
const DEFAULT_URL = 'https://mfuzfqrcnucgkpvhierx.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1mdXpmcXJjbnVjZ2twdmhpZXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc0NTI4NDcsImV4cCI6MjA4MzAyODg0N30.oSpbBxYZWnS4jLlPxJOQtWec5RPXXzt6SNfKYwuxIi0';

const supabaseUrl = safeGetEnv('VITE_SUPABASE_URL') || safeGetEnv('SUPABASE_URL') || DEFAULT_URL;
const supabaseAnonKey = safeGetEnv('VITE_SUPABASE_ANON_KEY') || safeGetEnv('SUPABASE_ANON_KEY') || DEFAULT_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("SyncTree: Supabase credentials not found. Operating in local-sync mode.");
}

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;