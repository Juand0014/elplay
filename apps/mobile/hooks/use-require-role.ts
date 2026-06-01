import { useEffect }    from 'react'
import { router }       from 'expo-router'
import { RolUsuario }   from '@elplay/shared/types'
import { useAuthStore } from '../store/auth.store'

// Redirige si el usuario no tiene el rol requerido.
// Usar en pantallas que requieren un rol específico.
export function useRequireRole(requiredRole: RolUsuario) {
  const role       = useAuthStore((s) => s.role)
  const isHydrated = useAuthStore((s) => s.isHydrated)
  const session    = useAuthStore((s) => s.session)

  useEffect(() => {
    if (!isHydrated) return
    if (!session) {
      router.replace('/(auth)/login')
      return
    }
    if (role !== requiredRole) {
      // Sin permiso → regresar a home
      router.replace('/(tabs)')
    }
  }, [isHydrated, session, role, requiredRole])

  return { hasRole: role === requiredRole }
}
