import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase }     from '../lib/supabase'
import { useAuthStore }  from '../store/auth.store'
import { VisibilidadApunte, CategoriaApunte } from '@elplay/shared/types'

// ── Tipos ──────────────────────────────────────────────────────

export interface Apunte {
  id:          string
  partido_id:  string | null
  equipo_id:   string | null
  usuario_id:  string
  titulo:      string
  contenido:   string
  visibilidad: VisibilidadApunte
  categoria:   CategoriaApunte
  created_at:  string
  updated_at:  string
}

export interface CreateApunteInput {
  titulo:      string
  contenido:   string
  visibilidad: VisibilidadApunte
  categoria:   CategoriaApunte
  partido_id?: string
  equipo_id?:  string
}

// ── Query Keys ─────────────────────────────────────────────────

export const apunteKeys = {
  all:    ['apuntes'] as const,
  mine:   () => ['apuntes', 'mine'] as const,
  detail: (id: string) => ['apuntes', 'detail', id] as const,
}

// ── Hooks ──────────────────────────────────────────────────────

export function useApuntes() {
  const userId = useAuthStore((s) => s.user?.id)

  return useQuery({
    queryKey: apunteKeys.mine(),
    queryFn:  async (): Promise<Apunte[]> => {
      if (!userId) return []

      const { data, error } = await supabase
        .from('apuntes')
        .select('*')
        .eq('usuario_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw new Error(error.message)
      return (data ?? []) as unknown as Apunte[]
    },
    enabled: !!userId,
  })
}

export function useCreateApunte() {
  const queryClient = useQueryClient()
  const userId      = useAuthStore((s) => s.user?.id)

  return useMutation({
    mutationFn: async (input: CreateApunteInput): Promise<Apunte> => {
      if (!userId) throw new Error('No autenticado')

      const { data, error } = await supabase
        .from('apuntes')
        .insert({
          ...input,
          usuario_id: userId,
        })
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data as unknown as Apunte
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: apunteKeys.mine() })
    },
  })
}

export function useDeleteApunte() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from('apuntes').delete().eq('id', id)
      if (error) throw new Error(error.message)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: apunteKeys.mine() })
    },
  })
}
