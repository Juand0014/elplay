import { z } from 'zod'
import { TipoJugada }  from '../types/enums/jugador.enum'
import { MediaEntrada } from '../types/enums/partido.enum'

export const RecordPlaySchema = z.object({
  partido_id:    z.string().uuid(),
  jugador_id:    z.string().uuid(),
  tipo:          z.nativeEnum(TipoJugada),
  entrada:       z.number().int().min(1),
  media_entrada: z.nativeEnum(MediaEntrada),
  runs_scored:   z.number().int().min(0).max(4),  // max 4 en un turno (grand slam)
  descripcion:   z.string().max(500).optional(),
  group_name:    z.string().optional(),
})

export type RecordPlayInput = z.infer<typeof RecordPlaySchema>

// Alias para compatibilidad con el CLAUDE.md
export const RegistrarJugadaSchema = RecordPlaySchema
export type  RegistrarJugadaInput  = RecordPlayInput
