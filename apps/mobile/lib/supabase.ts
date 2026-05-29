import { createClient }   from '@supabase/supabase-js'
import * as SecureStore    from 'expo-secure-store'
import Constants           from 'expo-constants'
import type { Database }   from '@elplay/db'

const extra = Constants.expoConfig?.extra as Record<string, string> | undefined

const supabaseUrl: string =
  extra?.['supabaseUrl'] ??
  process.env['EXPO_PUBLIC_SUPABASE_URL'] ??
  'http://127.0.0.1:54321'   // fallback: Supabase local CLI

const supabaseAnonKey: string =
  extra?.['supabaseAnonKey'] ??
  process.env['EXPO_PUBLIC_SUPABASE_ANON_KEY'] ??
  'placeholder-anon-key'

// Adapter de SecureStore para persistir la sesión de Supabase en el dispositivo
const SecureStoreAdapter = {
  getItem:    (key: string) => SecureStore.getItemAsync(key),
  setItem:    (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage:            SecureStoreAdapter,
    autoRefreshToken:   true,
    persistSession:     true,
    detectSessionInUrl: false,
  },
})
