import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { env, hasSupabaseConfig } from './env';

let client: SupabaseClient | null = null;

/**
 * Shared Supabase browser/native client.
 * Returns null when env is not configured (Part 00 shell still runs).
 */
export function getSupabase(): SupabaseClient | null {
  if (!hasSupabaseConfig()) {
    return null;
  }
  if (!client) {
    client = createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return client;
}
