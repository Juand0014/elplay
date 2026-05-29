/** Fórmulas y pesos para cálculo de estadísticas */
export const STATS_CONFIG = {
  /** Mínimo de turnos al bate para calificar en rankings */
  MIN_AB_PARA_RANKING: 15,
  /** Decimales en promedio de bateo */
  AVG_DECIMALS:         3,
} as const

/** Labels para mostrar en UI — nunca hardcodear en componentes */
export const STATS_LABELS = {
  AVG:  'Promedio',
  HR:   'Jonrones',
  RBI:  'Carreras Impulsadas',
  H:    'Hits',
  AB:   'Turnos al Bate',
  R:    'Carreras',
  BB:   'Bases por Bolas',
  K:    'Ponches',
  OBP:  'On-Base %',
  SLG:  'Slugging',
  OPS:  'OPS',
  '2B': 'Dobles',
  '3B': 'Triples',
} as const
