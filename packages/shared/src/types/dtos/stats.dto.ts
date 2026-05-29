/** Estadísticas de temporada para un jugador */
export interface SeasonStatsDto {
  jugador_id: string
  liga_id:    string
  season:     number    // año
  games:      number
  ab:         number
  h:          number
  r:          number
  rbi:        number
  hr:         number
  doubles:    number
  triples:    number
  bb:         number
  k:          number
  avg:        string    // formateado: ".325"
  obp:        string    // formateado: ".400"
  slg:        string    // formateado: ".550"
  ops:        string    // formateado: ".950"
}

/** Tabla de posiciones de una liga */
export interface StandingsDto {
  liga_id:   string
  rows:      StandingsRowDto[]
}

export interface StandingsRowDto {
  equipo_id:   string
  name:        string
  short_name:  string
  games:       number
  wins:        number
  losses:      number
  ties:        number
  pct:         string    // formateado: ".750"
  streak:      string    // ej: "V3" (3 victorias seguidas)
}

// Aliases para compatibilidad con el CLAUDE.md
export type StatsTemporadaDto  = SeasonStatsDto
export type TablaPosicionesDto = StandingsDto
export type PosicionDto        = StandingsRowDto
