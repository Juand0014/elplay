/** Tipos de jugada que puede registrar el scorer */
export enum TipoJugada {
  Sencillo     = '1B',
  Doble        = '2B',
  Triple       = '3B',
  Jonron       = 'HR',
  BasePorBolas = 'BB',
  HitPorPitch  = 'HBP',
  Ponche       = 'K',
  Out          = 'OUT',
  Error        = 'E',
  Dobleplay    = 'DP',
}

/** Posiciones defensivas */
export enum Posicion {
  Pitcher         = 'P',
  Catcher         = 'C',
  PrimeraBase     = '1B',
  SegundaBase     = '2B',
  TerceraBase     = '3B',
  CortoCampo      = 'SS',
  JardineroIzq    = 'LF',
  JardineroCenter = 'CF',
  JardineroRight  = 'RF',
  BateadorDesig   = 'DH',
}
