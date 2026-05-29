import { Stack }  from 'expo-router'
import { COLORS } from '@elplay/shared/types'

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown:  false,
        contentStyle: { backgroundColor: COLORS.BG },
      }}
    >
      <Stack.Screen name="login"           />
      <Stack.Screen name="register"        />
      <Stack.Screen name="forgot-password" />
    </Stack>
  )
}
