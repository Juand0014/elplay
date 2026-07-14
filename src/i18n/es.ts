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
    nextPart: 'Siguiente: scorer MVP (sin login)',
    ctaSoon: 'El pad de anotación llega en la Parte 01',
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
