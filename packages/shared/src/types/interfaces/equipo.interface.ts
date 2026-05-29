/** Equipo dentro de una liga */
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
  updated_at:       string
}

/** Fila de la tabla de posiciones */
export interface StandingsRow {
  equipo_id:   string
  team:        Equipo
  games:       number
  wins:        number    // W
  losses:      number    // L
  ties:        number    // T
  pct:         number    // Win % — calculado: W / (W + L)
  runs_for:    number    // Carreras anotadas
  runs_against: number   // Carreras en contra
}

// Alias para compatibilidad
export type PosicionTabla = StandingsRow
