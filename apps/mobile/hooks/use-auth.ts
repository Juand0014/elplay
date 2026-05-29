import { useAuthStore } from '../store/auth.store'

// Wrapper sobre el auth store — expone solo lo necesario para los componentes
export function useAuth() {
  const user      = useAuthStore((s) => s.user)
  const role      = useAuthStore((s) => s.role)
  const isLoading = useAuthStore((s) => s.isLoading)
  const session   = useAuthStore((s) => s.session)
  const signIn    = useAuthStore((s) => s.signIn)
  const signUp    = useAuthStore((s) => s.signUp)
  const signOut   = useAuthStore((s) => s.signOut)

  const isAuthenticated = session !== null

  return {
    user,
    role,
    isLoading,
    isAuthenticated,
    signIn,
    signUp,
    signOut,
  }
}
