import type { EstadoPartido, TipoPartido, MediaEntrada } from '../enums/partido.enum'
import type { KnockoutRule }                             from './liga.interface'
import type { Equipo }                                   from './equipo.interface'
import type { TipoJugada }                               from '../enums/jugador.enum'

/** Partido en base de datos — refleja exactamente la tabla `partidos` */
export interface Partido {
  id:                   string
  liga_id:              string | null
  torneo_id:            string | null
  equipo_local_id:      string
  equipo_visitante_id:  string
  scorer_id:            string | null
  tipo:                 TipoPartido
  estado:               EstadoPartido
  fecha:                string              // ISO timestamp
  entrada_actual:       number
  media_entrada_actual: MediaEntrada
  innings_override:     number | null       // null = hereda de liga/torneo
  carreras_local:       number
  carreras_visitante:   number
  hits_local:           number
  hits_visitante:       number
  errores_local:        number
  errores_visitante:    number
  created_at:           string
  updated_at:           string
}

/** Partido con relaciones cargadas — para UI */
export interface PartidoConRelaciones extends Partido {
  equipo_local:     Equipo
  equipo_visitante: Equipo
  knockout_rules:   KnockoutRule[]
}

/** Estado de un partido en vivo — para el scorer y realtime */
export interface LiveGameState {
  partido_id:  string
  outs:        number           // 0 | 1 | 2
  strikes:     number           // 0 | 1 | 2
  balls:       number           // 0 | 1 | 2 | 3
  base_1:      string | null    // jugador_id o null
  base_2:      string | null
  base_3:      string | null
  batter_id:   string | null
  pitcher_id:  string | null
}

/** Jugada registrada */
export interface Jugada {
  id:                string
  partido_id:        string
  jugador_id:        string
  tipo:              TipoJugada
  entrada:           number
  media_entrada:     MediaEntrada
  carreras_anotadas: number
  descripcion:       string | null
  grupo_nombre:      string | null
  anotado_por:       string
  anotado_at:        string
}

/** Grupo de juego interno */
export interface JuegoGrupo {
  id:         string
  partido_id: string
  nombre:     string
  color:      string
  created_at: string
}

// Alias para compatibilidad
export type EstadoEnVivo = LiveGameState
