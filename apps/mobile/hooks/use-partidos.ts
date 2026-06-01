import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase }    from '../lib/supabase'
import { useAuthStore } from '../store/auth.store'
import { TipoPartido, EstadoPartido, MediaEntrada } from '@elplay/shared/types'

// ── Tipos ──────────────────────────────────────────────────────

export interface PartidoResumen {
  id:                      string
  liga_id:                 string | null
  torneo_id:               string | null
  equipo_local_id:         string
  equipo_visitante_id:     string
  equipo_local_nombre:     string
  equipo_visitante_nombre: string
  equipo_local_color:      string
  equipo_visitante_color:  string
  scorer_id:               string | null
  tipo:                    TipoPartido
  estado:                  EstadoPartido
  fecha:                   string
  entrada_actual:          number
  media_entrada_actual:    MediaEntrada
  carreras_local:          number
  carreras_visitante:      number
  hits_local:              number
  hits_visitante:          number
  errores_local:           number
  errores_visitante:       number
  innings_override:        number | null
  created_at:              string
  updated_at:              string
}

export interface CreatePartidoInput {
  liga_id:             string
  torneo_id:           string | null
  equipo_local_id:     string
  equipo_visitante_id: string
  scorer_id:           string
  tipo:                TipoPartido
  fecha:               string
  innings_override:    number | null
}

// ── Query Keys ─────────────────────────────────────────────────

export const partidoKeys = {
  all:       ['partidos'] as const,
  byLiga:    (ligaId: string)    => ['partidos', 'liga', ligaId] as const,
  live:      ()                  => ['partidos', 'live'] as const,
  detail:    (id: string)        => ['partidos', 'detail', id] as const,
}

// ── Helper: enriquecer partido con nombres de equipos ─────────

async function enrichPartido(p: Record<string, unknown>): Promise<PartidoResumen> {
  const [local, visitante] = await Promise.all([
    supabase.from('equipos').select('nombre, color_primario').eq('id', p['equipo_local_id']).single(),
    supabase.from('equipos').select('nombre, color_primario').eq('id', p['equipo_visitante_id']).single(),
  ])
  const localData     = local.data     as { nombre: string; color_primario: string } | null
  const visitanteData = visitante.data as { nombre: string; color_primario: string } | null

  const base = p as unknown as Record<string, unknown>
  return {
    id:                      String(base['id'] ?? ''),
    liga_id:                 (base['liga_id'] as string | null) ?? null,
    torneo_id:               (base['torneo_id'] as string | null) ?? null,
    equipo_local_id:         String(base['equipo_local_id'] ?? ''),
    equipo_visitante_id:     String(base['equipo_visitante_id'] ?? ''),
    scorer_id:               (base['scorer_id'] as string | null) ?? null,
    tipo:                    base['tipo'] as TipoPartido,
    estado:                  base['estado'] as EstadoPartido,
    fecha:                   String(base['fecha'] ?? ''),
    entrada_actual:          Number(base['entrada_actual'] ?? 1),
    media_entrada_actual:    (base['media_entrada_actual'] as MediaEntrada) ?? MediaEntrada.Top,
    carreras_local:          Number(base['carreras_local'] ?? 0),
    carreras_visitante:      Number(base['carreras_visitante'] ?? 0),
    hits_local:              Number(base['hits_local'] ?? 0),
    hits_visitante:          Number(base['hits_visitante'] ?? 0),
    errores_local:           Number(base['errores_local'] ?? 0),
    errores_visitante:       Number(base['errores_visitante'] ?? 0),
    innings_override:        (base['innings_override'] as number | null) ?? null,
    created_at:              String(base['created_at'] ?? ''),
    updated_at:              String(base['updated_at'] ?? ''),
    equipo_local_nombre:     localData?.nombre          ?? '—',
    equipo_visitante_nombre: visitanteData?.nombre       ?? '—',
    equipo_local_color:      localData?.color_primario  ?? COLORS_PRIMARY,
    equipo_visitante_color:  visitanteData?.color_primario ?? '#3b82f6',
  }
}

const COLORS_PRIMARY = '#ff4d00'

// ── Hooks ──────────────────────────────────────────────────────

export function usePartidosLiga(ligaId: string) {
  return useQuery({
    queryKey: partidoKeys.byLiga(ligaId),
    queryFn:  async (): Promise<PartidoResumen[]> => {
      const { data, error } = await supabase
        .from('partidos')
        .select('*')
        .eq('liga_id', ligaId)
        .neq('tipo', TipoPartido.Interno)
        .order('fecha', { ascending: false })
        .limit(30)

      if (error) throw new Error(error.message)
      const rows = (data ?? []) as unknown as Record<string, unknown>[]
      return Promise.all(rows.map(enrichPartido))
    },
    enabled: !!ligaId,
  })
}

export function usePartidosEnVivo() {
  return useQuery({
    queryKey: partidoKeys.live(),
    queryFn:  async (): Promise<PartidoResumen[]> => {
      const { data, error } = await supabase
        .from('partidos')
        .select('*')
        .eq('estado', EstadoPartido.EnVivo)
        .neq('tipo', TipoPartido.Interno)

      if (error) throw new Error(error.message)
      const rows = (data ?? []) as unknown as Record<string, unknown>[]
      return Promise.all(rows.map(enrichPartido))
    },
    refetchInterval: 10_000, // refrescar cada 10s si no hay realtime
  })
}

export function usePartido(id: string) {
  return useQuery({
    queryKey: partidoKeys.detail(id),
    queryFn:  async (): Promise<PartidoResumen | null> => {
      const { data, error } = await supabase
        .from('partidos')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw new Error(error.message)
      return enrichPartido(data as unknown as Record<string, unknown>)
    },
    enabled: !!id,
  })
}

export function useCreatePartido() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreatePartidoInput): Promise<PartidoResumen> => {
      const { data, error } = await supabase
        .from('partidos')
        .insert({
          liga_id:             input.liga_id,
          torneo_id:           input.torneo_id,
          equipo_local_id:     input.equipo_local_id,
          equipo_visitante_id: input.equipo_visitante_id,
          scorer_id:           input.scorer_id,
          tipo:                input.tipo,
          estado:              EstadoPartido.Pendiente,
          fecha:               input.fecha,
          innings_override:    input.innings_override,
        })
        .select()
        .single()

      if (error) throw new Error(error.message)
      return enrichPartido(data as unknown as Record<string, unknown>)
    },
    onSuccess: (partido) => {
      if (partido.liga_id) {
        void queryClient.invalidateQueries({ queryKey: partidoKeys.byLiga(partido.liga_id) })
      }
    },
  })
}

export function useIniciarPartido() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (partidoId: string): Promise<void> => {
      const { error } = await supabase
        .from('partidos')
        .update({ estado: EstadoPartido.EnVivo })
        .eq('id', partidoId)

      if (error) throw new Error(error.message)
    },
    onSuccess: (_, id) => {
      void queryClient.invalidateQueries({ queryKey: partidoKeys.detail(id) })
      void queryClient.invalidateQueries({ queryKey: partidoKeys.live() })
    },
  })
}
