import { useQuery } from '@tanstack/react-query'
import { supabase }  from '../lib/supabase'
import { TipoPartido, EstadoPartido } from '@elplay/shared/types'

// ── Tipos ──────────────────────────────────────────────────────

export interface FilaTabla {
  equipo_id:     string
  nombre:        string
  abreviatura:   string
  color_primario: string
  j:    number   // juegos
  g:    number   // ganados
  p:    number   // perdidos
  cf:   number   // carreras a favor
  cc:   number   // carreras en contra
  dif:  number   // diferencial
  pct:  number   // porcentaje
}

// ── Query Keys ─────────────────────────────────────────────────

export const tablaKeys = {
  byLiga: (ligaId: string) => ['tabla', ligaId] as const,
}

// ── Hook ────────────────────────────────────────────────────────

export function useTablaPosticiones(ligaId: string) {
  return useQuery({
    queryKey: tablaKeys.byLiga(ligaId),
    queryFn:  async (): Promise<FilaTabla[]> => {
      // Traer todos los partidos oficiales (liga) finalizados
      const { data: partidos, error } = await supabase
        .from('partidos')
        .select('equipo_local_id, equipo_visitante_id, carreras_local, carreras_visitante, estado')
        .eq('liga_id', ligaId)
        .eq('tipo', TipoPartido.Liga)
        .in('estado', [EstadoPartido.Finalizado, EstadoPartido.Knockout])

      if (error) throw new Error(error.message)

      // Traer equipos de la liga
      const { data: equipos, error: eqError } = await supabase
        .from('equipos')
        .select('id, nombre, abreviatura, color_primario')
        .eq('liga_id', ligaId)
        .eq('activo', true)

      if (eqError) throw new Error(eqError.message)

      // Calcular stats por equipo
      const stats: Record<string, FilaTabla> = {}

      for (const eq of (equipos ?? [])) {
        const e = eq as { id: string; nombre: string; abreviatura: string; color_primario: string }
        stats[e.id] = {
          equipo_id:     e.id,
          nombre:        e.nombre,
          abreviatura:   e.abreviatura,
          color_primario: e.color_primario,
          j: 0, g: 0, p: 0, cf: 0, cc: 0, dif: 0, pct: 0,
        }
      }

      for (const p of (partidos ?? [])) {
        const partido = p as {
          equipo_local_id: string
          equipo_visitante_id: string
          carreras_local: number
          carreras_visitante: number
        }
        const localStats     = stats[partido.equipo_local_id]
        const visitanteStats = stats[partido.equipo_visitante_id]

        if (!localStats || !visitanteStats) continue

        localStats.j++
        visitanteStats.j++
        localStats.cf     += partido.carreras_local
        localStats.cc     += partido.carreras_visitante
        visitanteStats.cf += partido.carreras_visitante
        visitanteStats.cc += partido.carreras_local

        if (partido.carreras_local > partido.carreras_visitante) {
          localStats.g++
          visitanteStats.p++
        } else if (partido.carreras_visitante > partido.carreras_local) {
          visitanteStats.g++
          localStats.p++
        }
      }

      // Calcular diferencial y PCT
      const tabla = Object.values(stats).map((row) => ({
        ...row,
        dif: row.cf - row.cc,
        pct: row.j === 0 ? 0 : row.g / row.j,
      }))

      // Ordenar: PCT desc, luego Dif desc
      return tabla.sort((a, b) => b.pct - a.pct || b.dif - a.dif)
    },
    enabled: !!ligaId,
  })
}
