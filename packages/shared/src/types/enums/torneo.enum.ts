/** Formatos de torneo disponibles */
export enum FormatoTorneo {
  EliminacionDirecta = 'SE',   // Single Elimination — pierde = fuera
  DobleEliminacion   = 'DE',   // Double Elimination — necesitas perder 2 veces
  GruposMasElim      = 'GE',   // Fase de grupos + bracket final
}

/** Estado del ciclo de vida de un torneo */
export enum EstadoTorneo {
  Borrador    = 'draft',    // En configuración, no visible
  Inscripcion = 'open',     // Aceptando inscripciones de equipos
  EnCurso     = 'active',   // Partidos en juego
  Finalizado  = 'done',     // Campeón definido
}

/** Cómo fue inscrito un equipo en el torneo */
export enum TipoInscripcion {
  Propia = 'self',    // El equipo se anotó solo
  Manual = 'admin',   // El organizador lo agregó manualmente
}
