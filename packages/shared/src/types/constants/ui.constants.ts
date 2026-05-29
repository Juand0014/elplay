/** Colores del design system — único lugar donde viven, NO en componentes */
export const COLORS = {
  PRIMARY:    '#ff4d00',
  SECONDARY:  '#ff8c00',
  SUCCESS:    '#22c55e',
  INFO:       '#3b82f6',
  WARNING:    '#f59e0b',
  DANGER:     '#ef4444',
  PURPLE:     '#a855f7',
  CYAN:       '#06b6d4',

  BG:         '#0a0a0f',
  SURFACE:    '#0f0f1a',
  SURFACE2:   '#141420',
  BORDER:     '#1e1e2e',

  TEXT:       '#ffffff',
  TEXT2:      '#aaaaaa',
  TEXT3:      '#55556a',
} as const

/** Tipografías */
export const FONTS = {
  DISPLAY: 'BebasNeue_400Regular',
  BODY:    'Inter_400Regular',
  BOLD:    'Inter_700Bold',
  BLACK:   'Inter_900Black',
  MONO:    'DMMonoRegular',
} as const

/** Espaciado base (8pt grid) */
export const SPACING = {
  XS:   4,
  SM:   8,
  MD:   16,
  LG:   24,
  XL:   32,
  XXL:  48,
} as const

/** Border radius */
export const RADIUS = {
  SM:   4,
  MD:   8,
  LG:   12,
  XL:   16,
  FULL: 9999,
} as const
