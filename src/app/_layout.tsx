import {
  BebasNeue_400Regular,
  useFonts as useBebas,
} from '@expo-google-fonts/bebas-neue';
import {
  Inter_400Regular,
  Inter_700Bold,
  Inter_900Black,
  useFonts as useInter,
} from '@expo-google-fonts/inter';
import { ThemeProvider, DarkTheme } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useAuthBootstrap } from '@/features/auth';
import { createQueryClient } from '@/lib/query';
import { colors } from '@/theme';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.bg,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.primary,
  },
};

function AuthBootstrap() {
  useAuthBootstrap();
  return null;
}

export default function RootLayout() {
  const [queryClient] = useState(() => createQueryClient());
  const [bebasLoaded] = useBebas({ BebasNeue_400Regular });
  const [interLoaded] = useInter({
    Inter_400Regular,
    Inter_700Bold,
    Inter_900Black,
  });
  const fontsLoaded = bebasLoaded && interLoaded;

  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider value={navigationTheme}>
        <AuthBootstrap />
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="game/create" />
          <Stack.Screen name="scorer/[id]" />
          <Stack.Screen name="scorer/invite/[token]" />
          <Stack.Screen name="live/index" />
          <Stack.Screen name="live/[id]" />
          <Stack.Screen name="auth/index" />
        </Stack>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
