/** Regla de knockout — puede pertenecer a liga, torneo o partido */
export interface KnockoutRule {
  id:                  string
  liga_id:             string | null
  torneo_id:           string | null
  partido_id:          string | null
  diferencia_carreras: number    // ej: 15
  desde_entrada:       number    // ej: 5 (desde la 5ta entrada)
  activa:              boolean
}

/** Configuración de juego — usada en liga, torneo y juego individual */
export interface GameConfig {
  innings:          number
  innings_minimos:  number
  outs_por_entrada: number
  knockout_rules:   KnockoutRule[]
}

/** Liga de softball */
export interface Liga {
  id:               string
  nombre:           string
  descripcion:      string | null
  logo_url:         string | null
  innings:          number
  innings_minimos:  number
  outs_por_entrada: number
  comisionado_id:   string
  activa:           boolean
  created_at:       string
  updated_at:       string
}
