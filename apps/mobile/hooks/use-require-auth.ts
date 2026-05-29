import { useEffect }   from 'react'
import { router }      from 'expo-router'
import { useAuthStore } from '../store/auth.store'

// Redirige a login si no hay sesión activa.
// Usar en pantallas protegidas — llamar al inicio del componente.
export function useRequireAuth() {
  const session    = useAuthStore((s) => s.session)
  const isHydrated = useAuthStore((s) => s.isHydrated)

  useEffect(() => {
    if (isHydrated && !session) {
      router.replace('/(auth)/login')
    }
  }, [isHydrated, session])

  return { isAuthenticated: session !== null, isHydrated }
}
