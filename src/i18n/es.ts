/**
 * Spanish UI copy — the only place user-visible strings live.
 */
export const es = {
  brand: {
    name: 'ElPlay',
    tagline: 'Tu liga, tu diamante.',
  },
  home: {
    title: 'ElPlay',
    subtitle: 'Anota el juego. La grada lo ve en vivo.',
    guestCta: 'Entrar como invitado',
    googleCta: 'Continuar con Google',
    guestHint: 'Sin cuenta. Listo para el terreno.',
    googleHint: 'Para liderar ligas y equipos.',
    welcomeGuest: 'Modo invitado',
    welcomeUser: 'Conectado con Google',
    signOut: 'Salir',
    continuePlay: 'Ir al diamante',
    runnerA11y: 'Corredor en el diamante, número',
    googleNotConfigured:
      'Activa Google en Supabase para iniciar sesión (Parte 03).',
    googleError: 'No se pudo iniciar con Google',
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

export function t(key: TranslationKey): string {
  return lookup(es as unknown as Record<string, unknown>, key);
}
