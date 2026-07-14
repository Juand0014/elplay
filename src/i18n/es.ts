/**
 * Spanish UI copy — the only place user-visible strings live.
 * Code identifiers stay in English; screens call t('key').
 */
export const es = {
  brand: {
    name: 'ElPlay',
    tagline: 'Tu liga, tu diamante.',
  },
  home: {
    title: 'ElPlay',
    subtitle: 'Softball en vivo para ligas de República Dominicana.',
    activePart: 'Parte activa: fundamentos',
    nextPart: 'Siguiente: scorer MVP (invitado, sin registro obligatorio)',
    guestCta: 'Entrar como invitado',
    googleCta: 'Continuar con Google',
    guestHint: 'Sin cuenta. Anota y mira partidos en vivo.',
    googleHint: 'Para liderar ligas, equipos y guardar tu perfil.',
    welcomeGuest: 'Estás en modo invitado',
    welcomeUser: 'Sesión con Google',
    signOut: 'Cerrar sesión',
    googleNotConfigured:
      'Google Auth se activa cuando Supabase tenga el provider Google (Parte 03).',
    googleError: 'No se pudo iniciar sesión con Google',
  },
  common: {
    loading: 'Cargando…',
    error: 'Algo salió mal',
    retry: 'Reintentar',
  },
} as const;

export type TranslationTree = typeof es;

type Join<K, P> = K extends string | number
  ? P extends string | number
    ? `${K}.${P}`
    : never
  : never;

type Leaves<T> = T extends Record<string, unknown>
  ? {
      [K in keyof T]-?: T[K] extends Record<string, unknown>
        ? Join<K, Leaves<T[K]>>
        : K & string;
    }[keyof T]
  : never;

export type TranslationKey = Leaves<TranslationTree>;

function lookup(tree: Record<string, unknown>, path: string): string {
  const parts = path.split('.');
  let current: unknown = tree;
  for (const part of parts) {
    if (current === null || typeof current !== 'object' || !(part in current)) {
      return path;
    }
    current = (current as Record<string, unknown>)[part];
  }
  return typeof current === 'string' ? current : path;
}

/** Resolve a Spanish UI string by dot path (e.g. `home.title`). */
export function t(key: TranslationKey): string {
  return lookup(es as unknown as Record<string, unknown>, key);
}
