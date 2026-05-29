import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase }     from '../lib/supabase'
import { useAuthStore }  from '../store/auth.store'
import { TipoPartido, EstadoPartido } from '@elplay/shared/types'

// ── Tipos ──────────────────────────────────────────────────────

export interface GrupoConJugadores {
  id:         string
  nombre:     string
  color:      string
  jugadores:  { id: string; nombre: string; numero: number }[]
}

export interface JuegoInterno {
  id:                  string
  equipo_id:           string
  equipo_nombre:       string
  nombre:              string
  fecha:               string
  estado:              EstadoPartido
  carreras_a:          number
  carreras_b:          number
  scorer_id:           string | null
  innings_override:    number | null
}

export interface CreateJuegoInternoInput {
  equipo_id:        string
  nombre?:          string
  fecha:            string
  scorer_id:        string
  innings_override: number | null
  grupos: {
    nombre:      string
    color:       string
    jugador_ids: string[]
  }[]
}

// ── Query Keys ─────────────────────────────────────────────────

export const juegoInternoKeys = {
  byEquipo: (equipoId: string) => ['juegos-internos', equipoId] as const,
  detail:   (id: string)       => ['juego-interno', id] as const,
}

// ── Hooks ──────────────────────────────────────────────────────

export function useJuegosInternos(equipoId: string) {
  return useQuery({
    queryKey: juegoInternoKeys.byEquipo(equipoId),
    queryFn:  async (): Promise<JuegoInterno[]> => {
      const { data, error } = await supabase
        .from('partidos')
        .select('*')
        .eq('tipo', TipoPartido.Interno)
        .or(`equipo_local_id.eq.${equipoId},equipo_visitante_id.eq.${equipoId}`)
        .order('fecha', { ascending: false })

      if (error) throw new Error(error.message)

      const { data: equipo } = await supabase
        .from('equipos')
        .select('nombre')
        .eq('id', equipoId)
        .single()

      return ((data ?? []) as unknown as Record<string, unknown>[]).map((p) => ({
        id:               p['id'] as string,
        equipo_id:        equipoId,
        equipo_nombre:    (equipo as { nombre: string } | null)?.nombre ?? '—',
        nombre:           (p['nombre'] as string | null) ?? `Práctica ${new Date(p['fecha'] as string).toLocaleDateString('es-DO')}`,
        fecha:            p['fecha'] as string,
        estado:           p['estado'] as EstadoPartido,
        carreras_a:       p['carreras_local'] as number,
        carreras_b:       p['carreras_visitante'] as number,
        scorer_id:        p['scorer_id'] as string | null,
        innings_override: p['innings_override'] as number | null,
      }))
    },
    enabled: !!equipoId,
  })
}

export function useCreateJuegoInterno() {
  const queryClient = useQueryClient()
  const userId      = useAuthStore((s) => s.user?.id)

  return useMutation({
    mutationFn: async (input: CreateJuegoInternoInput): Promise<{ id: string }> => {
      if (!userId) throw new Error('No autenticado')

      // Juego interno: equipo_local_id = equipo_visitante_id = equipo_id
      const { data: partido, error } = await supabase
        .from('partidos')
        .insert({
          equipo_local_id:     input.equipo_id,
          equipo_visitante_id: input.equipo_id,
          scorer_id:           input.scorer_id,
          tipo:                TipoPartido.Interno,
          estado:              EstadoPartido.Pendiente,
          fecha:               input.fecha,
          innings_override:    input.innings_override,
          liga_id:             null,
          torneo_id:           null,
        })
        .select('id')
        .single()

      if (error) throw new Error(error.message)
      const partidoId = (partido as { id: string }).id

      // Crear los grupos
      for (const grupo of input.grupos) {
        const { data: grupoData, error: gErr } = await supabase
          .from('juego_grupos')
          .insert({
            partido_id: partidoId,
            nombre:     grupo.nombre,
            color:      grupo.color,
          })
          .select('id')
          .single()

        if (gErr) throw new Error(gErr.message)
        const grupoId = (grupoData as { id: string }).id

        // Asignar jugadores al grupo
        if (grupo.jugador_ids.length > 0) {
          await supabase.from('grupo_jugadores').insert(
            grupo.jugador_ids.map((jugadorId) => ({
              grupo_id:   grupoId,
              jugador_id: jugadorId,
            }))
          )
        }
      }

      return { id: partidoId }
    },
    onSuccess: (_, vars) => {
      void queryClient.invalidateQueries({ queryKey: juegoInternoKeys.byEquipo(vars.equipo_id) })
    },
  })
}
