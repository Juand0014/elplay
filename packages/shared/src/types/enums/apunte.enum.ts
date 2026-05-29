/** Categoría del apunte */
export enum CategoriaApunte {
  Partido  = 'partido',    // Nota sobre un partido específico
  Tactica  = 'tactica',    // Nota táctica / estratégica
  Jugador  = 'jugador',    // Nota sobre un jugador
  Resumen  = 'resumen',    // Resumen de semana o temporada
  General  = 'general',    // Sin categoría específica
}

/** Quién puede ver el apunte */
export enum VisibilidadApunte {
  Privado = 'privado',   // Solo el autor
  Equipo  = 'equipo',    // Todos los miembros del equipo
  Publico = 'publico',   // Cualquiera, sin login
}
