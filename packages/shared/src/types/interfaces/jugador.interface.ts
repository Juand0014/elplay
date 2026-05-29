import type { Posicion } from '../enums/jugador.enum'

/** Jugador del roster */
export interface Jugador {
  id:         string
  equipo_id:  string
  usuario_id: string | null
  nombre:     string
  numero:     number
  posicion:   Posicion
  activo:     boolean
  created_at: string
  updated_at: string
}

/** Estadísticas de bateo — calculadas, no guardadas directamente */
export interface BattingStats {
  jugador_id: string
  games:      number
  ab:         number    // At Bats
  h:          number    // Hits
  r:          number    // Carreras anotadas
  rbi:        number    // Carreras impulsadas
  hr:         number    // Jonrones
  doubles:    number    // Dobles
  triples:    number    // Triples
  bb:         number    // Bases por bolas
  k:          number    // Ponches
  avg:        number    // Promedio — calculado: H / AB
  obp:        number    // On-base % — calculado: (H + BB) / (AB + BB)
  slg:        number    // Slugging — calculado: bases_totales / AB
  ops:        number    // OPS — calculado: OBP + SLG
}

/** Stats de un juego individual — para el game log */
export interface GameStats extends BattingStats {
  partido_id:  string
  fecha:       string
  rival:       string              // nombre del equipo rival
  result:      'W' | 'L' | 'T'
  is_internal: boolean             // true si fue juego interno
}

// Alias para compatibilidad con nombres del CLAUDE.md
export type StatsBateo = BattingStats
export type StatsJuego = GameStats
