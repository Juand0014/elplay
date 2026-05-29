import { useEffect }       from 'react'
import { Stack, router }  from 'expo-router'
import { StatusBar }      from 'expo-status-bar'
import * as SplashScreen  from 'expo-splash-screen'
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
import { COLORS }         from '@elplay/shared/types'
import { useAuthStore }   from '../store/auth.store'

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

  // Restaurar sesión desde SecureStore al arrancar
  useEffect(() => {
    void hydrate()
  }, [hydrate])

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
      router.replace('/(tabs)/')
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
        <Stack.Screen name="(auth)"              options={{ animation: 'fade' }} />
        <Stack.Screen name="(tabs)"              options={{ animation: 'fade' }} />
        <Stack.Screen name="scorer/[id]"         options={{ presentation: 'modal' }} />
        <Stack.Screen name="partido/[id]"        />
        <Stack.Screen name="equipo/[id]"         />
        <Stack.Screen name="jugador/[id]"        />
        <Stack.Screen name="interno/crear"       />
        <Stack.Screen name="interno/[id]"        />
        <Stack.Screen name="interno/historial"   />
        <Stack.Screen name="publico/[id]"        options={{ animation: 'fade' }} />
        <Stack.Screen name="liga/crear"          />
        <Stack.Screen name="liga/[id]"           />
        <Stack.Screen name="partido/crear"       />
        <Stack.Screen name="liga/crear"          />
        <Stack.Screen name="liga/[id]/posiciones" />
        <Stack.Screen name="equipo/crear"         />
        <Stack.Screen name="equipo/[id]/editar"   />
        <Stack.Screen name="jugador/[id]"         />
        <Stack.Screen name="partido/[id]/lineup"  />
      </Stack>
    </QueryClientProvider>
  )
}
