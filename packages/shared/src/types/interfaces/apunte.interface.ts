import type { VisibilidadApunte, CategoriaApunte } from '../enums/apunte.enum'

/** Apunte / nota del equipo */
export interface Apunte {
  id:          string
  partido_id:  string | null
  equipo_id:   string | null
  usuario_id:  string
  titulo:      string
  contenido:   string
  visibilidad: VisibilidadApunte
  categoria:   CategoriaApunte
  created_at:  string
  updated_at:  string
}
