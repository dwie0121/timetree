import { createClient } from '@supabase/supabase-js';

/**
 * Safely access environment variables. 
 * In standard Vite environments, these are on import.meta.env.
 * We use a fallback check to prevent runtime crashes if the env object is undefined.
 */
const getEnvVar = (key: string): string | undefined => {
  try {
    // Attempt to access via import.meta.env (Vite standard)
    const env = (import.meta as any).env;
    if (env && env[key]) return env[key];
  } catch (e) {
    // Fallback if import.meta is restricted or env is missing
  }
  return undefined;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing. SyncTree is running in Local Mode (LocalStorage/BroadcastChannel).");
}

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
