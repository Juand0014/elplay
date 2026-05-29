import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase }    from '../lib/supabase'
import { useAuthStore } from '../store/auth.store'

// ── Tipos ──────────────────────────────────────────────────────

export interface Equipo {
  id:               string
  liga_id:          string
  nombre:           string
  abreviatura:      string
  logo_url:         string | null
  color_primario:   string
  color_secundario: string
  dueno_id:         string
  activo:           boolean
  created_at:       string
  jugadores_count?: number
}

export interface CreateEquipoInput {
  liga_id:     string
  nombre:      string
  abreviatura: string
  color_primario: string
}

// ── Query Keys ─────────────────────────────────────────────────

export const equipoKeys = {
  all:          ['equipos'] as const,
  byLiga:       (ligaId: string) => ['equipos', 'liga', ligaId] as const,
  detail:       (id: string)     => ['equipos', 'detail', id] as const,
}

// ── Hooks ──────────────────────────────────────────────────────

export function useEquipos(ligaId: string) {
  return useQuery({
    queryKey: equipoKeys.byLiga(ligaId),
    queryFn:  async (): Promise<Equipo[]> => {
      const { data, error } = await supabase
        .from('equipos')
        .select('*')
        .eq('liga_id', ligaId)
        .eq('activo', true)
        .order('nombre')

      if (error) throw new Error(error.message)

      // Enriquecer con conteo de jugadores activos
      const equipos = (data ?? []) as unknown as Equipo[]
      const enriched = await Promise.all(
        equipos.map(async (eq) => {
          const { count } = await supabase
            .from('jugadores')
            .select('*', { count: 'exact', head: true })
            .eq('equipo_id', eq.id)
            .eq('activo', true)
          return { ...eq, jugadores_count: count ?? 0 }
        })
      )
      return enriched
    },
    enabled: !!ligaId,
  })
}

export function useEquipo(id: string) {
  return useQuery({
    queryKey: equipoKeys.detail(id),
    queryFn:  async (): Promise<Equipo | null> => {
      const { data, error } = await supabase
        .from('equipos')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw new Error(error.message)
      const eq = data as unknown as Equipo

      const { count } = await supabase
        .from('jugadores')
        .select('*', { count: 'exact', head: true })
        .eq('equipo_id', id)
        .eq('activo', true)

      return { ...eq, jugadores_count: count ?? 0 }
    },
    enabled: !!id,
  })
}

export function useCreateEquipo() {
  const queryClient = useQueryClient()
  const userId      = useAuthStore((s) => s.user?.id)

  return useMutation({
    mutationFn: async (input: CreateEquipoInput): Promise<Equipo> => {
      if (!userId) throw new Error('No autenticado')

      const { data, error } = await supabase
        .from('equipos')
        .insert({
          ...input,
          color_secundario: '#ff8c00',
          dueno_id: userId,
          activo:   true,
        })
        .select()
        .single()

      if (error) throw new Error(error.message)
      const eq = data as unknown as Equipo

      // Asignar rol de dueno_equipo
      await supabase.from('roles_usuario').insert({
        usuario_id: userId,
        rol:        'dueno_equipo',
        equipo_id:  eq.id,
      })

      return eq
    },
    onSuccess: (_, vars) => {
      void queryClient.invalidateQueries({ queryKey: equipoKeys.byLiga(vars.liga_id) })
    },
  })
}
