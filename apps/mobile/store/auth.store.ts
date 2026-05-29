import { create }             from 'zustand'
import type { User, Session } from '@supabase/supabase-js'
import { supabase }           from '../lib/supabase'
import { RolUsuario }         from '@elplay/shared/types'

interface AuthState {
  user:        User | null
  session:     Session | null
  role:        RolUsuario | null
  isLoading:   boolean
  isHydrated:  boolean

  // Actions
  signIn:   (email: string, password: string) => Promise<string | null>
  signUp:   (email: string, password: string, nombre: string) => Promise<string | null>
  signOut:  () => Promise<void>
  hydrate:  () => Promise<void>
  setRole:  (role: RolUsuario | null) => void
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user:       null,
  session:    null,
  role:       null,
  isLoading:  false,
  isHydrated: false,

  signIn: async (email, password) => {
    set({ isLoading: true })
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      set({ isLoading: false })
      return error.message
    }
    // Cargar el rol del usuario desde la DB
    const role = await fetchUserRole(data.user.id)
    set({ user: data.user, session: data.session, role, isLoading: false })
    return null
  },

  signUp: async (email, password, nombre) => {
    set({ isLoading: true })
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre } },
    })
    set({ isLoading: false })
    if (error) return error.message
    return null
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ user: null, session: null, role: null })
  },

  hydrate: async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      const role = await fetchUserRole(session.user.id)
      set({ user: session.user, session, role, isHydrated: true })
    } else {
      set({ isHydrated: true })
    }

    // Escuchar cambios de sesión para mantener el store sincronizado
    supabase.auth.onAuthStateChange((_event, newSession) => {
      if (newSession) {
        fetchUserRole(newSession.user.id).then((role) => {
          set({ user: newSession.user, session: newSession, role })
        })
      } else {
        set({ user: null, session: null, role: null })
      }
    })
  },

  setRole: (role) => set({ role }),
}))

// Obtener el rol del usuario desde la tabla roles_usuario
// Devuelve RolUsuario.Publico si no tiene rol asignado
async function fetchUserRole(userId: string): Promise<RolUsuario> {
  const { data } = await supabase
    .from('roles_usuario')
    .select('rol')
    .eq('usuario_id', userId)
    .limit(1)
    .maybeSingle()

  const rol = data?.['rol']
  if (typeof rol === 'string') {
    return rol as RolUsuario
  }
  return RolUsuario.Publico
}
