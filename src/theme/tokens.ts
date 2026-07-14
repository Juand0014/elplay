/** ElPlay design tokens — single source of visual truth. Never hardcode in components. */

export const colors = {
  primary: '#ff4d00',
  secondary: '#ff8c00',
  success: '#22c55e',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  bg: '#0a0a0f',
  surface: '#0f0f1a',
  surface2: '#141420',
  field: '#1a1a2e',
  border: '#1e1e2e',
  text: '#ffffff',
  textMuted: '#aaaaaa',
  textDim: '#55556a',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
} as const;

export const typography = {
  display: 'BebasNeue_400Regular',
  body: 'Inter_400Regular',
  bodyBold: 'Inter_700Bold',
  bodyBlack: 'Inter_900Black',
  mono: 'SpaceMono',
} as const;

export const fonts = typography;

export type ColorToken = keyof typeof colors;
export type SpacingToken = keyof typeof spacing;
