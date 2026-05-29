/** Estado del ciclo de vida de un partido */
export enum EstadoPartido {
  Pendiente  = 'pending',
  EnVivo     = 'live',
  Finalizado = 'done',
  Knockout   = 'ko',        // Terminado por misericordia
}

/** Los 3 tipos de juego que existen en ElPlay */
export enum TipoPartido {
  Liga     = 'liga',        // Oficial — cuenta para tabla de posiciones
  Torneo   = 'torneo',      // Dentro de un torneo
  Interno  = 'interno',     // Práctica — privado al equipo, no afecta liga
}

/** Media entrada: top (visitante al bate) o bottom (local al bate) */
export enum MediaEntrada {
  Top    = 'top',
  Bottom = 'bottom',
}
