import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase }    from '../lib/supabase'
import { Posicion }    from '@elplay/shared/types'

// ── Tipos ──────────────────────────────────────────────────────

export interface Jugador {
  id:          string
  equipo_id:   string
  usuario_id:  string | null
  nombre:      string
  numero:      number
  posicion:    Posicion
  activo:      boolean
  created_at:  string
}

export interface CreateJugadorInput {
  equipo_id:  string
  nombre:     string
  numero:     number
  posicion:   Posicion
}

export interface UpdateJugadorInput extends Partial<Omit<CreateJugadorInput, 'equipo_id'>> {
  activo?: boolean
}

// ── Query Keys ─────────────────────────────────────────────────

export const rosterKeys = {
  byEquipo:  (equipoId: string) => ['roster', equipoId] as const,
  jugador:   (id: string)       => ['jugador', id] as const,
}

// ── Hooks ──────────────────────────────────────────────────────

export function useRoster(equipoId: string) {
  return useQuery({
    queryKey: rosterKeys.byEquipo(equipoId),
    queryFn:  async (): Promise<Jugador[]> => {
      const { data, error } = await supabase
        .from('jugadores')
        .select('*')
        .eq('equipo_id', equipoId)
        .eq('activo', true)
        .order('numero')

      if (error) throw new Error(error.message)
      return (data ?? []) as unknown as Jugador[]
    },
    enabled: !!equipoId,
  })
}

export function useJugador(id: string) {
  return useQuery({
    queryKey: rosterKeys.jugador(id),
    queryFn:  async (): Promise<Jugador | null> => {
      const { data, error } = await supabase
        .from('jugadores')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw new Error(error.message)
      return data as unknown as Jugador
    },
    enabled: !!id,
  })
}

export function useAddJugador() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateJugadorInput): Promise<Jugador> => {
      // Verificar que el número no está duplicado
      const { data: existing } = await supabase
        .from('jugadores')
        .select('id')
        .eq('equipo_id', input.equipo_id)
        .eq('numero', input.numero)
        .eq('activo', true)
        .maybeSingle()

      if (existing) {
        throw new Error(`El número #${input.numero} ya está en uso en este equipo`)
      }

      const { data, error } = await supabase
        .from('jugadores')
        .insert({ ...input, activo: true })
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data as unknown as Jugador
    },
    onSuccess: (jugador) => {
      void queryClient.invalidateQueries({ queryKey: rosterKeys.byEquipo(jugador.equipo_id) })
    },
  })
}

export function useUpdateJugador() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, equipoId, updates }: { id: string; equipoId: string; updates: UpdateJugadorInput }): Promise<Jugador> => {
      const { data, error } = await supabase
        .from('jugadores')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw new Error(error.message)
      return data as unknown as Jugador
    },
    onSuccess: (jugador) => {
      void queryClient.invalidateQueries({ queryKey: rosterKeys.byEquipo(jugador.equipo_id) })
      void queryClient.invalidateQueries({ queryKey: rosterKeys.jugador(jugador.id) })
    },
  })
}

export function useDesactivarJugador() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, equipoId }: { id: string; equipoId: string }): Promise<void> => {
      const { error } = await supabase
        .from('jugadores')
        .update({ activo: false })
        .eq('id', id)

      if (error) throw new Error(error.message)
    },
    onSuccess: (_, { equipoId }) => {
      void queryClient.invalidateQueries({ queryKey: rosterKeys.byEquipo(equipoId) })
    },
  })
}
