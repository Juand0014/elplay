import type { TipoJugada }  from '../enums/jugador.enum'
import type { MediaEntrada } from '../enums/partido.enum'

/** DTO para registrar una jugada en el scorer */
export interface RecordPlayDto {
  partido_id:    string
  jugador_id:    string
  tipo:          TipoJugada
  entrada:       number
  media_entrada: MediaEntrada
  runs_scored:   number           // cuántas carreras anotó esta jugada
  descripcion?:  string           // optional — nota del scorer
  group_name?:   string           // solo para juegos internos
}

// Alias para compatibilidad con el CLAUDE.md
export type RegistrarJugadaDto = RecordPlayDto
