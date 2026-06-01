import { createClient }  from '@supabase/supabase-js'
import * as SecureStore   from 'expo-secure-store'
import Constants          from 'expo-constants'

const extra = Constants.expoConfig?.extra as Record<string, string> | undefined

// Priority: app.config.js extra → EXPO_PUBLIC_ env vars → local Supabase CLI fallback
const supabaseUrl: string =
  extra?.['supabaseUrl'] ??
  process.env.EXPO_PUBLIC_SUPABASE_URL ??
  'http://127.0.0.1:54321'

const supabaseAnonKey: string =
  extra?.['supabaseAnonKey'] ??
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  'placeholder-anon-key'

const SecureStoreAdapter = {
  getItem:    (key: string) => SecureStore.getItemAsync(key),
  setItem:    (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
}

// Generic parameter removed — re-add `createClient<Database>` after running `pnpm db:generate`
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage:            SecureStoreAdapter,
    autoRefreshToken:   true,
    persistSession:     true,
    detectSessionInUrl: false,
    flowType:           'pkce',   // PKCE is required for mobile deep-link auth
  },
})
