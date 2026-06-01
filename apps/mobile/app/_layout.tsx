import { useEffect }         from 'react'
import { Stack, router }    from 'expo-router'
import { StatusBar }        from 'expo-status-bar'
import * as SplashScreen    from 'expo-splash-screen'
import * as Linking         from 'expo-linking'
import {
  useFonts,
  BebasNeue_400Regular,
} from '@expo-google-fonts/bebas-neue'
import {
  Inter_400Regular,
  Inter_700Bold,
  Inter_900Black,
} from '@expo-google-fonts/inter'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { COLORS }           from '@elplay/shared/types'
import { useAuthStore }     from '../store/auth.store'
import { supabase }         from '../lib/supabase'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:  1000 * 60,      // 1 minuto
      retry:      2,
      gcTime:     1000 * 60 * 5,  // 5 minutos
    },
  },
})

// Mantener el splash screen hasta que las fuentes y la sesión carguen
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  const hydrate    = useAuthStore((s) => s.hydrate)
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const session    = useAuthStore((s) => s.session)

  const [fontsLoaded] = useFonts({
    BebasNeue_400Regular,
    Inter_400Regular,
    Inter_700Bold,
    Inter_900Black,
  })

  // Restore session from SecureStore on startup
  useEffect(() => {
    void hydrate()
  }, [hydrate])

  // Handle email confirmation and magic-link deep links (elplay://?code=xxx)
  useEffect(() => {
    const handleUrl = async (url: string) => {
      const { queryParams } = Linking.parse(url)
      const code       = queryParams?.['code']       as string | undefined
      const tokenHash  = queryParams?.['token_hash'] as string | undefined
      const type       = queryParams?.['type']       as string | undefined

      if (code) {
        // PKCE flow — exchange authorization code for a session
        await supabase.auth.exchangeCodeForSession(code)
      } else if (tokenHash && type) {
        // Legacy token-hash flow (password recovery, email change, etc.)
        await supabase.auth.verifyOtp({ token_hash: tokenHash, type: type as 'signup' | 'recovery' | 'email' })
      }
    }

    // App already open — incoming deep link
    const sub = Linking.addEventListener('url', ({ url }) => { void handleUrl(url) })

    // App cold-started via deep link
    Linking.getInitialURL().then((url) => { if (url) void handleUrl(url) })

    return () => sub.remove()
  }, [])

  // Ocultar splash cuando fonts + hydration están listos
  useEffect(() => {
    if (fontsLoaded && isHydrated) {
      void SplashScreen.hideAsync()
    }
  }, [fontsLoaded, isHydrated])

  // Redirigir según estado de sesión una vez hidratado
  useEffect(() => {
    if (!isHydrated || !fontsLoaded) return
    if (session) {
      router.replace('/(tabs)')
    } else {
      router.replace('/(auth)/login')
    }
  }, [isHydrated, fontsLoaded, session])

  if (!fontsLoaded || !isHydrated) return null

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" backgroundColor={COLORS.BG} />
      <Stack
        screenOptions={{
          headerShown:  false,
          contentStyle: { backgroundColor: COLORS.BG },
          animation:    'slide_from_right',
        }}
      >
        {/*
         * Only declare screens that need non-default presentation.
         * Expo Router auto-discovers every other route from the file system.
         */}
        <Stack.Screen name="(auth)"       options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)"       options={{ animation: 'fade' }} />
        <Stack.Screen name="scorer/[id]"  options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="publico/[id]" options={{ animation: 'fade' }} />
      </Stack>
    </QueryClientProvider>
  )
}
