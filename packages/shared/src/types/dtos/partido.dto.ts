import type { TipoPartido } from '../enums/partido.enum'

/** DTO para crear un partido oficial (liga o torneo) */
export interface CreateGameDto {
  liga_id:              string | null
  torneo_id:            string | null
  equipo_local_id:      string
  equipo_visitante_id:  string
  scorer_id:            string
  tipo:                 TipoPartido
  fecha:                string
  innings_override?:    number        // optional — hereda de liga/torneo si no se define
}

/** DTO para crear un juego interno (el equipo dividido en 2 grupos) */
export interface CreateInternalGameDto {
  equipo_id:          string                  // el equipo dueño
  scorer_id:          string
  fecha:              string
  name?:              string                  // ej: "Práctica 29 Mayo"
  groups:             CreateGroupDto[]
  innings_override?:  number
}

export interface CreateGroupDto {
  name:        string                         // "Grupo A" | "Grupo B"
  color:       string                         // hex color
  player_ids:  string[]                       // IDs del roster asignados a este grupo
}

/** DTO para actualizar el score de un partido */
export interface UpdateScoreDto {
  partido_id:         string
  carreras_local:     number
  carreras_visitante: number
  hits_local:         number
  hits_visitante:     number
  errores_local:      number
  errores_visitante:  number
}

// Aliases para compatibilidad con el CLAUDE.md
export type CrearPartidoDto       = CreateGameDto
export type CrearJuegoInternoDto  = CreateInternalGameDto
export type CrearGrupoDto         = CreateGroupDto
export type ActualizarScoreDto    = UpdateScoreDto
