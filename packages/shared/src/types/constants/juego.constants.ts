import { EstadoPartido } from '../enums/partido.enum'

/** Configuración por defecto de un juego — puede ser sobreescrita por liga/torneo/juego */
export const DEFAULT_GAME_CONFIG = {
  INNINGS:           9,
  INNINGS_MINIMOS:   5,    // Mínimo para que un juego sea oficial
  OUTS_POR_ENTRADA:  3,
  JUGADORES_LINEUP:  9,
} as const

/** Límites de configuración — no se puede salir de estos rangos */
export const GAME_CONFIG_LIMITS = {
  INNINGS_MIN:  3,
  INNINGS_MAX:  15,
  OUTS_MIN:     2,
  OUTS_MAX:     3,
} as const

/** Grupos del juego interno */
export const GRUPOS_INTERNO = {
  A: 'Grupo A',
  B: 'Grupo B',
} as const

/** Estados que indican que un partido ya terminó */
export const ESTADOS_PARTIDO_TERMINADO = [
  EstadoPartido.Finalizado,
  EstadoPartido.Knockout,
] as const

/** Estados que permiten anotar jugadas */
export const ESTADOS_PARTIDO_ACTIVO = [
  EstadoPartido.EnVivo,
] as const
