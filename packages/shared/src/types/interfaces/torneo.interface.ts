import type { FormatoTorneo, EstadoTorneo, TipoInscripcion } from '../enums/torneo.enum'
import type { Equipo }                                        from './equipo.interface'

/** Torneo de softball */
export interface Torneo {
  id:                        string
  liga_id:                   string | null
  nombre:                    string
  descripcion:               string | null
  formato:                   FormatoTorneo
  estado:                    EstadoTorneo
  innings_override:          number | null
  outs_por_entrada_override: number | null
  fecha_inicio:              string | null
  fecha_fin:                 string | null
  organizador_id:            string
  created_at:                string
  updated_at:                string
}

/** Inscripción de un equipo en un torneo */
export interface Inscripcion {
  id:          string
  torneo_id:   string
  equipo_id:   string
  tipo:        TipoInscripcion
  seed:        number | null
  inscrito_at: string
}

/** Inscripción con equipo cargado */
export interface InscripcionConEquipo extends Inscripcion {
  equipo: Equipo
}
