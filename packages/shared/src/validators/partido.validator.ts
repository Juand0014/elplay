import { z } from 'zod'
import { EstadoPartido, TipoPartido, MediaEntrada } from '../types/enums/partido.enum'

export const GameSchema = z.object({
  id:                   z.string().uuid(),
  liga_id:              z.string().uuid().nullable(),
  torneo_id:            z.string().uuid().nullable(),
  equipo_local_id:      z.string().uuid(),
  equipo_visitante_id:  z.string().uuid(),
  scorer_id:            z.string().uuid().nullable(),
  tipo:                 z.nativeEnum(TipoPartido),
  estado:               z.nativeEnum(EstadoPartido),
  fecha:                z.string().datetime(),
  entrada_actual:       z.number().int().min(1),
  media_entrada_actual: z.nativeEnum(MediaEntrada),
  innings_override:     z.number().int().min(3).max(15).nullable(),
  carreras_local:       z.number().int().min(0),
  carreras_visitante:   z.number().int().min(0),
  hits_local:           z.number().int().min(0),
  hits_visitante:       z.number().int().min(0),
  errores_local:        z.number().int().min(0),
  errores_visitante:    z.number().int().min(0),
  created_at:           z.string().datetime(),
  updated_at:           z.string().datetime(),
})

export const CreateGameSchema = z.object({
  liga_id:              z.string().uuid().nullable(),
  torneo_id:            z.string().uuid().nullable(),
  equipo_local_id:      z.string().uuid(),
  equipo_visitante_id:  z.string().uuid(),
  scorer_id:            z.string().uuid(),
  tipo:                 z.nativeEnum(TipoPartido),
  fecha:                z.string().datetime(),
  innings_override:     z.number().int().min(3).max(15).optional(),
}).refine(
  (data) => data.equipo_local_id !== data.equipo_visitante_id,
  { message: 'Los equipos deben ser distintos', path: ['equipo_visitante_id'] }
).refine(
  (data) => data.tipo !== TipoPartido.Liga || data.liga_id !== null,
  { message: 'Los juegos de liga requieren liga_id', path: ['liga_id'] }
).refine(
  (data) => data.tipo !== TipoPartido.Torneo || data.torneo_id !== null,
  { message: 'Los juegos de torneo requieren torneo_id', path: ['torneo_id'] }
)

export const CreateGroupSchema = z.object({
  name:       z.string().min(1),
  color:      z.string().regex(/^#[0-9a-fA-F]{6}$/),
  player_ids: z.array(z.string().uuid()).min(1),
})

export const CreateInternalGameSchema = z.object({
  equipo_id:        z.string().uuid(),
  scorer_id:        z.string().uuid(),
  fecha:            z.string().datetime(),
  name:             z.string().optional(),
  groups:           z.array(CreateGroupSchema).length(2),
  innings_override: z.number().int().min(3).max(15).optional(),
})

export type GameInput             = z.infer<typeof GameSchema>
export type CreateGameInput       = z.infer<typeof CreateGameSchema>
export type CreateInternalGameInput = z.infer<typeof CreateInternalGameSchema>

// Aliases para compatibilidad con el CLAUDE.md
export const PartidoSchema          = GameSchema
export const CrearPartidoSchema     = CreateGameSchema
export const CrearJuegoInternoSchema = CreateInternalGameSchema
