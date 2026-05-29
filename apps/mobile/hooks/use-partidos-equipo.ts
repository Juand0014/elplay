import { useQuery } from '@tanstack/react-query'
import { supabase }  from '../lib/supabase'
import { TipoPartido } from '@elplay/shared/types'
import type { PartidoResumen } from './use-partidos'

export function usePartidosEquipo(equipoId: string) {
  return useQuery({
    queryKey: ['partidos', 'equipo', equipoId],
    queryFn:  async (): Promise<PartidoResumen[]> => {
      const { data, error } = await supabase
        .from('partidos')
        .select('*')
        .or(`equipo_local_id.eq.${equipoId},equipo_visitante_id.eq.${equipoId}`)
        .neq('tipo', TipoPartido.Interno)
        .order('fecha', { ascending: false })
        .limit(20)

      if (error) throw new Error(error.message)

      const rows = (data ?? []) as unknown as Record<string, unknown>[]

      // Enriquecer con nombres de equipos
      return Promise.all(
        rows.map(async (p) => {
          const [local, visitante] = await Promise.all([
            supabase.from('equipos').select('nombre, color_primario').eq('id', p['equipo_local_id']).single(),
            supabase.from('equipos').select('nombre, color_primario').eq('id', p['equipo_visitante_id']).single(),
          ])
          const l = local.data     as { nombre: string; color_primario: string } | null
          const v = visitante.data as { nombre: string; color_primario: string } | null
          return {
            ...(p as unknown as PartidoResumen),
            equipo_local_nombre:     l?.nombre ?? '—',
            equipo_visitante_nombre: v?.nombre ?? '—',
            equipo_local_color:      l?.color_primario ?? '#ff4d00',
            equipo_visitante_color:  v?.color_primario ?? '#3b82f6',
          }
        })
      )
    },
    enabled: !!equipoId,
  })
}
