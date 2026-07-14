import Constants from 'expo-constants';

type Extra = {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  appEnv?: string;
};

function readExtra(): Extra {
  const extra = Constants.expoConfig?.extra;
  if (extra && typeof extra === 'object') {
    return extra as Extra;
  }
  return {};
}

/**
 * Public client env via Expo public vars (inlined at bundle time) + app.json extra fallback.
 * Never put the service-role key here.
 */
const publicEnv = {
  EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  EXPO_PUBLIC_APP_ENV: process.env.EXPO_PUBLIC_APP_ENV,
} as const;

export const env = {
  supabaseUrl: publicEnv.EXPO_PUBLIC_SUPABASE_URL ?? readExtra().supabaseUrl ?? '',
  supabaseAnonKey:
    publicEnv.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? readExtra().supabaseAnonKey ?? '',
  appEnv: publicEnv.EXPO_PUBLIC_APP_ENV ?? readExtra().appEnv ?? 'development',
} as const;

export function hasSupabaseConfig(): boolean {
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}
