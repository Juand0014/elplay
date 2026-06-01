import { createClient }  from '@supabase/supabase-js'
import * as SecureStore   from 'expo-secure-store'
import Constants          from 'expo-constants'

const extra = Constants.expoConfig?.extra as Record<string, string> | undefined

// Fallback to local Supabase CLI — replace when real credentials are available
const supabaseUrl: string    = extra?.['supabaseUrl']    ?? 'http://127.0.0.1:54321'
const supabaseAnonKey: string = extra?.['supabaseAnonKey'] ?? 'placeholder-anon-key'

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
  },
})
