import { EstadoPartido, TipoPartido } from '../enums/partido.enum'
import type { Partido, PartidoConRelaciones } from '../interfaces/partido.interface'

/** Verifica si un partido ya terminó */
export const isGameOver = (partido: Partido): boolean =>
  partido.estado === EstadoPartido.Finalizado ||
  partido.estado === EstadoPartido.Knockout

/** Verifica si un partido está en vivo */
export const isGameLive = (partido: Partido): boolean =>
  partido.estado === EstadoPartido.EnVivo

/** Verifica si un partido está pendiente */
export const isGamePending = (partido: Partido): boolean =>
  partido.estado === EstadoPartido.Pendiente

/** Verifica si un partido es interno (práctica) */
export const isInternalGame = (partido: Partido): boolean =>
  partido.tipo === TipoPartido.Interno

/** Verifica si un partido es oficial de liga */
export const isLeagueGame = (partido: Partido): boolean =>
  partido.tipo === TipoPartido.Liga

/** Verifica si un partido es de torneo */
export const isTournamentGame = (partido: Partido): boolean =>
  partido.tipo === TipoPartido.Torneo

/** Verifica si el partido tiene relaciones cargadas */
export const hasRelations = (
  partido: Partido
): partido is PartidoConRelaciones =>
  'equipo_local' in partido && 'equipo_visitante' in partido

/** Verifica si un valor es un EstadoPartido válido */
export const isEstadoPartido = (value: unknown): value is EstadoPartido =>
  Object.values(EstadoPartido).includes(value as EstadoPartido)

/** Verifica si un valor es un TipoPartido válido */
export const isTipoPartido = (value: unknown): value is TipoPartido =>
  Object.values(TipoPartido).includes(value as TipoPartido)

/** Verifica si un string es un UUID válido */
export const isUUID = (value: unknown): value is string => {
  if (typeof value !== 'string') return false
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

// Aliases para compatibilidad con nombres del CLAUDE.md
export const isPartidoTerminado    = isGameOver
export const isPartidoEnVivo       = isGameLive
export const isPartidoPendiente    = isGamePending
export const isJuegoInterno        = isInternalGame
export const isJuegoLiga           = isLeagueGame
export const isJuegoTorneo         = isTournamentGame
export const isPartidoConRelaciones = hasRelations
