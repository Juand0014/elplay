# ElPlay — CLAUDE.md
> Guía de desarrollo para Claude Code · SDD (Spec-Driven Development)
> Versión: 1.0 · Mayo 2026

---

## ¿Qué es ElPlay?

App mobile-first (React Native + Expo) para gestión de ligas de softball en República Dominicana.
Permite llevar ligas, torneos, equipos, jugadores, partidos en vivo con score en tiempo real,
apuntes internos del equipo y estadísticas completas.

---

## Stack

| Capa | Tecnología |
|---|---|
| Mobile | React Native + Expo SDK 51 + Expo Router |
| Web | Next.js 15 + Tailwind CSS |
| Backend | Supabase (PostgreSQL + Auth + Realtime WebSockets) |
| Estado | Zustand |
| Data fetching | React Query (TanStack Query) |
| Validación | Zod |
| Lenguaje | TypeScript estricto en todo |
| CI/CD | GitHub Actions + EAS Build + Vercel |
| Errores | Sentry |

---

## Estructura del Proyecto

```
elplay/
├── apps/
│   ├── mobile/          # React Native + Expo
│   │   ├── app/         # Expo Router (file-based routing)
│   │   │   ├── (auth)/  # Pantallas de login/registro
│   │   │   ├── (tabs)/  # Bottom nav tabs
│   │   │   │   ├── index.tsx          # Dashboard Home
│   │   │   │   ├── live.tsx           # En Vivo
│   │   │   │   ├── ligas.tsx          # Ligas & Torneos
│   │   │   │   ├── apuntes.tsx        # Apuntes
│   │   │   │   └── perfil.tsx         # Perfil & Ajustes
│   │   │   ├── scorer/[id].tsx        # Scorer en vivo
│   │   │   ├── partido/[id].tsx       # Detalle del partido
│   │   │   ├── equipo/[id].tsx        # Stats del equipo
│   │   │   ├── jugador/[id].tsx       # Perfil del jugador
│   │   │   ├── interno/               # Juegos internos
│   │   │   │   ├── crear.tsx
│   │   │   │   ├── [id].tsx
│   │   │   │   └── historial.tsx
│   │   │   └── publico/[id].tsx       # Dashboard público (sin auth)
│   │   ├── components/  # Componentes reutilizables
│   │   ├── hooks/       # Custom hooks
│   │   └── store/       # Zustand stores
│   └── web/             # Next.js (dashboard web)
│       └── app/
├── packages/
│   ├── db/              # Schema Supabase + tipos generados
│   │   ├── schema.sql
│   │   ├── migrations/
│   │   ├── seed.sql
│   │   └── types.ts     # Generado con supabase gen types
│   ├── shared/          # Lógica compartida mobile+web
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── validators/  # Schemas Zod
│   └── ui/              # Componentes UI compartidos
├── supabase/
│   ├── functions/       # Edge Functions
│   ├── migrations/
│   └── config.toml
├── CLAUDE.md            # Este archivo
├── package.json         # Workspace root (pnpm)
└── turbo.json           # Turborepo
```

---

## Los 3 Tipos de Juego

Esto es CRÍTICO para entender la lógica del sistema:

### 1. Juego de Liga 🏆
- Partido oficial entre dos equipos distintos de la misma liga
- **SÍ** cuenta para tabla de posiciones (W/L/PCT)
- **SÍ** suma a stats de temporada del jugador
- Visible en dashboard público sin login
- Puede pertenecer a un torneo (torneo_id) o ser regular (torneo_id = null)

### 2. Juego de Torneo 🎯
- Igual que el de liga pero con config override del torneo
- Hereda: innings, KO rules del torneo (no de la liga)
- Formato: eliminación directa / doble eliminación / grupos+bracket

### 3. Juego Interno 🔵 (Práctica)
- El mismo equipo dividido en dos grupos (Grupo A vs Grupo B)
- El dueño del equipo divide el roster libremente
- Solo el scorer asignado puede anotarlo
- Score y apuntes visibles SOLO para miembros del equipo
- **NO** cuenta para liga, torneo ni tabla de posiciones
- Stats guardadas en tabla separada (no afecta stats oficiales)

---

## Sistema de Knockout / Misericordia

Jerarquía de herencia (de menor a mayor prioridad):

```
Liga (default) → Torneo (override) → Juego (override manual)
```

Cada nivel puede tener múltiples reglas apiladas:
```typescript
// Ejemplo de reglas de knockout
[
  { diferencia_carreras: 15, desde_entrada: 5 },  // 15+ desde 5ta
  { diferencia_carreras: 10, desde_entrada: 7 },  // 10+ desde 7ta
]
```

El engine del scorer evalúa todas las reglas activas al terminar cada entrada.
Si alguna se cumple → juego termina con estado `ko`.

---

## Modelo de Datos (10 tablas)

```sql
-- Las tablas principales y sus relaciones:

ligas           -- root de todo
  └── equipos          (liga_id)
        └── jugadores        (equipo_id)
  └── torneos          (liga_id nullable — torneo puede existir sin liga)
        └── inscripciones    (torneo_id, equipo_id)
  └── partidos         (liga_id nullable, torneo_id nullable)
        └── jugadas          (partido_id, jugador_id)
        └── juego_grupos     (partido_id) — solo juegos internos
              └── grupo_jugadores  (grupo_id, jugador_id)
        └── apuntes          (partido_id nullable, usuario_id)

knockout_rules  -- polimórfico: liga_id | torneo_id | partido_id
```

### Campo `tipo` en `partidos`
```typescript
type TipoPartido = 'liga' | 'torneo' | 'interno'
```

### Campo `estado` en `partidos`
```typescript
type EstadoPartido = 'pending' | 'live' | 'done' | 'ko'
```

### Campo `visibilidad` en `apuntes`
```typescript
type VisibilidadApunte = 'privado' | 'equipo' | 'publico'
```

---

## Roles & Permisos

```typescript
type Rol = 'comisionado' | 'dueno_equipo' | 'scorer' | 'miembro' | 'publico'
```

| Acción | Comisionado | Dueño Equipo | Scorer | Miembro | Público |
|---|:---:|:---:|:---:|:---:|:---:|
| Crear liga | ✓ | - | - | - | - |
| Crear torneo | ✓ | ✓ | - | - | - |
| Crear equipo | ✓ | ✓ | - | - | - |
| Crear juego interno | - | ✓ | - | - | - |
| Anotar partido | ✓ | ✓ | ✓ | - | - |
| Ver juego interno | - | ✓ | ✓ | ✓ | - |
| Ver stats oficiales | ✓ | ✓ | ✓ | ✓ | ✓ |

> Los permisos se implementan con Supabase **Row Level Security (RLS)**.
> Nunca validar permisos solo en el frontend.

---

## Fases de Desarrollo

### Fase 1 — MVP Core (Semanas 1–8) ← ESTAMOS AQUÍ
**Objetivo:** App funcional con los 2 tipos de juego principales

- [ ] Setup monorepo (pnpm + Turborepo)
- [ ] Supabase: schema completo + RLS policies + seed data
- [ ] Auth: registro, login, manejo de roles
- [ ] CRUD: Ligas, Equipos, Jugadores
- [ ] **Juego de Liga** — crear partido, scorer en vivo, KO automático
- [ ] **Juego Interno** — dividir roster, scorer privado, stats del equipo
- [ ] Dashboard Home (mobile)
- [ ] Dashboard Público (sin login, tiempo real)
- [ ] Tabla de posiciones
- [ ] Apuntes básicos (crear, vincular a partido)

### Fase 2 — Stats & Torneos (Semanas 9–16)
- [ ] Torneos completos (todos los formatos)
- [ ] Box score completo
- [ ] Perfil del jugador (stats, game log, rachas)
- [ ] Stats del equipo (lista ordenable)
- [ ] Head-to-head
- [ ] Historial juegos internos
- [ ] Apuntes avanzados (categorías, búsqueda)

### Fase 3 — Pro (Semana 17+)
- [ ] Push notifications
- [ ] Exportar PDF
- [ ] Comparar stats oficiales vs internas
- [ ] Multi-liga
- [ ] MVP automático

---

## Agentes SDD para Claude Code

Usar `--agents` con estas definiciones:

### Agent: `backend`
**Responsabilidad:** Todo lo relacionado a Supabase
- Schema SQL y migraciones
- RLS policies por rol
- Edge Functions (KO engine, stats calculadas)
- Tipos TypeScript generados (`supabase gen types`)
- Seed data para desarrollo

**Prompt base:**
```
You are a Supabase/PostgreSQL expert working on ElPlay.
Focus: schema design, RLS policies, Edge Functions.
Always use TypeScript strict mode.
Never bypass RLS — all permissions must be enforced at DB level.
Reference CLAUDE.md for table structure and roles.
```

### Agent: `mobile`
**Responsabilidad:** React Native + Expo
- Pantallas y navegación (Expo Router)
- Componentes UI (design system ElPlay)
- Hooks de Supabase Realtime
- Zustand stores
- Integración con Supabase client

**Prompt base:**
```
You are a React Native / Expo expert working on ElPlay.
Focus: mobile-first UI, Expo Router file-based navigation.
Always use TypeScript strict mode.
Use Zustand for global state, React Query for server state.
Design system: dark theme, primary #ff4d00, font Bebas Neue (display) + Inter (body).
Reference CLAUDE.md for screen inventory and game type logic.
```

### Agent: `scorer-engine`
**Responsabilidad:** Lógica del scorer y tiempo real
- KO engine (evaluar reglas al terminar cada entrada)
- Supabase Realtime subscriptions
- Play-by-play logic
- Stats calculation (AVG, OPS, etc.)

**Prompt base:**
```
You are working on the ElPlay scorer engine.
Focus: knockout rule evaluation, real-time score updates, stats calculation.
The KO engine reads active rules (liga → torneo → juego hierarchy) and
evaluates after each half-inning. If any rule triggers → set partido.estado = 'ko'.
Always emit Supabase Realtime events for every score change.
Reference CLAUDE.md for the 3 game types and KO hierarchy.
```

### Agent: `reviewer`
**Responsabilidad:** Code review antes de cada merge
- Verificar RLS policies están completas
- Verificar tipos TypeScript sin `any`
- Verificar que juegos internos NO afectan stats oficiales
- Verificar KO engine cubre todos los casos

**Usar:** `claude ultrareview` antes de cada PR

---

## Estándares de Tipos e Interfaces

Esta sección define cómo organizar y escribir tipos en todo el proyecto.
**El código debe ser auto-documentado.** Si alguien lee un tipo, debe entender
el dominio sin necesidad de comentarios extra.

---

### Estructura de archivos de tipos

Cada dominio tiene su propia carpeta con archivos separados por responsabilidad:

```
packages/shared/src/types/
├── index.ts              # Re-exporta todo — único punto de entrada
│
├── enums/
│   ├── index.ts          # Re-exporta todos los enums
│   ├── partido.enum.ts   # Enums de partidos
│   ├── jugador.enum.ts   # Enums de jugadores
│   ├── torneo.enum.ts    # Enums de torneos
│   ├── apunte.enum.ts    # Enums de apuntes
│   └── auth.enum.ts      # Enums de autenticación y roles
│
├── constants/
│   ├── index.ts          # Re-exporta todas las constantes
│   ├── juego.constants.ts
│   ├── stats.constants.ts
│   └── ui.constants.ts
│
├── interfaces/
│   ├── index.ts
│   ├── liga.interface.ts
│   ├── equipo.interface.ts
│   ├── jugador.interface.ts
│   ├── partido.interface.ts
│   ├── torneo.interface.ts
│   └── apunte.interface.ts
│
├── dtos/                 # Data Transfer Objects — lo que entra y sale de la API
│   ├── index.ts
│   ├── partido.dto.ts
│   ├── jugada.dto.ts
│   └── stats.dto.ts
│
└── utils/
    ├── index.ts
    └── type-guards.ts    # is* functions para narrowing
```

---

### Enums

Usar `enum` para valores fijos del dominio que tienen significado semántico.
Nunca usar strings literales sueltos donde debería haber un enum.

```typescript
// packages/shared/src/types/enums/partido.enum.ts

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
```

```typescript
// packages/shared/src/types/enums/jugador.enum.ts

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
  Pitcher          = 'P',
  Catcher          = 'C',
  PrimeraBse       = '1B',
  SegundaBase      = '2B',
  TerceraBase      = '3B',
  CortoCampo       = 'SS',
  JardineroIzq     = 'LF',
  JardineroCenter  = 'CF',
  JardineroRight   = 'RF',
  BateadorDesig    = 'DH',
}
```

```typescript
// packages/shared/src/types/enums/torneo.enum.ts

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
  Propia  = 'self',    // El equipo se anotó solo
  Manual  = 'admin',   // El organizador lo agregó manualmente
}
```

```typescript
// packages/shared/src/types/enums/auth.enum.ts

/** Roles del sistema — definen qué puede hacer cada usuario */
export enum RolUsuario {
  Comisionado   = 'comisionado',   // Dueño de la liga — máximo poder
  DuenoEquipo   = 'dueno_equipo',  // Capitán/manager del equipo
  Scorer        = 'scorer',        // Anotador asignado a un partido
  Miembro       = 'miembro',       // Jugador del roster del equipo
  Publico       = 'publico',       // Sin cuenta — solo lectura pública
}
```

```typescript
// packages/shared/src/types/enums/apunte.enum.ts

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
```

---

### Constantes

Usar `const` con `as const` para valores fijos que no son enums semánticos
pero que se repiten en el código. Nunca usar números o strings mágicos.

```typescript
// packages/shared/src/types/constants/juego.constants.ts

/** Configuración por defecto de un juego — puede ser sobreescrita por liga/torneo/juego */
export const DEFAULT_GAME_CONFIG = {
  INNINGS:           9,
  INNINGS_MINIMOS:   5,    // Mínimo para que un juego sea oficial
  OUTS_POR_ENTRADA:  3,
  JUGADORES_LINEUP:  9,
} as const

/** Límites de configuración — no se puede salir de estos rangos */
export const GAME_CONFIG_LIMITS = {
  INNINGS_MIN:  3,
  INNINGS_MAX:  15,
  OUTS_MIN:     2,
  OUTS_MAX:     3,
} as const

/** Grupos del juego interno */
export const GRUPOS_INTERNO = {
  A: 'Grupo A',
  B: 'Grupo B',
} as const

/** Estados que indican que un partido ya terminó */
export const ESTADOS_PARTIDO_TERMINADO = [
  EstadoPartido.Finalizado,
  EstadoPartido.Knockout,
] as const

/** Estados que permiten anotar jugadas */
export const ESTADOS_PARTIDO_ACTIVO = [
  EstadoPartido.EnVivo,
] as const
```

```typescript
// packages/shared/src/types/constants/stats.constants.ts

/** Fórmulas y pesos para cálculo de estadísticas */
export const STATS_CONFIG = {
  /** Mínimo de turnos al bate para calificar en rankings */
  MIN_AB_PARA_RANKING:  15,
  /** Decimales en promedio de bateo */
  AVG_DECIMALS:          3,
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
```

```typescript
// packages/shared/src/types/constants/ui.constants.ts

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
```

---

### Interfaces

Una interfaz por entidad del dominio. Las interfaces describen la forma
de los datos, no el comportamiento.

```typescript
// packages/shared/src/types/interfaces/partido.interface.ts

import type { EstadoPartido, TipoPartido, MediaEntrada } from '../enums'
import type { KnockoutRule }                              from './liga.interface'
import type { Equipo }                                    from './equipo.interface'

/** Partido en base de datos — refleja exactamente la tabla `partidos` */
export interface Partido {
  id:                    string
  liga_id:               string | null
  torneo_id:             string | null
  equipo_local_id:       string
  equipo_visitante_id:   string
  scorer_id:             string | null
  tipo:                  TipoPartido
  estado:                EstadoPartido
  fecha:                 string            // ISO timestamp
  entrada_actual:        number
  media_entrada:         MediaEntrada
  innings_override:      number | null     // null = hereda de liga/torneo
  carreras_local:        number
  carreras_visitante:    number
  hits_local:            number
  hits_visitante:        number
  errores_local:         number
  errores_visitante:     number
  created_at:            string
  updated_at:            string
}

/** Partido con relaciones cargadas — para UI */
export interface PartidoConRelaciones extends Partido {
  equipo_local:      Equipo
  equipo_visitante:  Equipo
  knockout_rules:    KnockoutRule[]
}

/** Estado de un partido en vivo — para el scorer y realtime */
export interface EstadoEnVivo {
  partido_id:    string
  outs:          number           // 0 | 1 | 2
  strikes:       number           // 0 | 1 | 2
  bolas:         number           // 0 | 1 | 2 | 3
  base_1:        string | null    // jugador_id o null
  base_2:        string | null
  base_3:        string | null
  bateador_id:   string | null
  pitcher_id:    string | null
}
```

```typescript
// packages/shared/src/types/interfaces/liga.interface.ts

/** Regla de knockout — puede pertenecer a liga, torneo o partido */
export interface KnockoutRule {
  id:                  string
  liga_id:             string | null
  torneo_id:           string | null
  partido_id:          string | null
  diferencia_carreras: number    // ej: 15
  desde_entrada:       number    // ej: 5 (desde la 5ta entrada)
  activa:              boolean
}

/** Configuración de juego — usada en liga, torneo y juego individual */
export interface GameConfig {
  innings:          number
  innings_minimos:  number
  outs_por_entrada: number
  knockout_rules:   KnockoutRule[]
}
```

```typescript
// packages/shared/src/types/interfaces/jugador.interface.ts

import type { Posicion } from '../enums'

/** Jugador del roster */
export interface Jugador {
  id:         string
  equipo_id:  string
  nombre:     string
  numero:     number
  posicion:   Posicion
  activo:     boolean
  created_at: string
}

/** Estadísticas de bateo — calculadas, no guardadas directamente */
export interface StatsBateo {
  jugador_id:  string
  juegos:      number
  ab:          number    // At Bats
  h:           number    // Hits
  r:           number    // Carreras anotadas
  rbi:         number    // Carreras impulsadas
  hr:          number    // Jonrones
  doubles:     number    // Dobles
  triples:     number    // Triples
  bb:          number    // Bases por bolas
  k:           number    // Ponches
  avg:         number    // Promedio — calculado: H / AB
  obp:         number    // On-base % — calculado: (H + BB) / (AB + BB)
  slg:         number    // Slugging — calculado: bases_totales / AB
  ops:         number    // OPS — calculado: OBP + SLG
}

/** Stats de un juego individual — para el game log */
export interface StatsJuego extends StatsBateo {
  partido_id:   string
  fecha:        string
  rival:        string    // nombre del equipo rival
  resultado:    'W' | 'L' | 'T'
  es_interno:   boolean   // true si fue juego interno
}
```

---

### DTOs (Data Transfer Objects)

Los DTOs definen exactamente qué datos entran y salen de cada operación.
No mezclar DTOs con interfaces de dominio.

```typescript
// packages/shared/src/types/dtos/partido.dto.ts

import type { TipoPartido } from '../enums'

/** Lo que necesita el usuario para crear un partido */
export interface CrearPartidoDto {
  liga_id:              string | null
  torneo_id:            string | null
  equipo_local_id:      string
  equipo_visitante_id:  string
  scorer_id:            string
  tipo:                 TipoPartido
  fecha:                string
  innings_override?:    number        // opcional — hereda de liga/torneo si no se define
}

/** Para crear un juego interno — extiende CrearPartidoDto */
export interface CrearJuegoInternoDto {
  equipo_id:  string                          // el equipo dueño
  scorer_id:  string
  fecha:      string
  nombre?:    string                          // ej: "Práctica 29 Mayo"
  grupos:     CrearGrupoDto[]
  innings_override?: number
}

export interface CrearGrupoDto {
  nombre:      string                         // "Grupo A" | "Grupo B"
  color:       string                         // hex color
  jugador_ids: string[]                       // IDs del roster asignados a este grupo
}
```

```typescript
// packages/shared/src/types/dtos/jugada.dto.ts

import type { TipoJugada } from '../enums'

/** Lo que registra el scorer al anotar una jugada */
export interface RegistrarJugadaDto {
  partido_id:        string
  jugador_id:        string
  tipo:              TipoJugada
  entrada:           number
  carreras_anotadas: number          // cuántas carreras anotó esta jugada
  descripcion?:      string          // opcional — nota del scorer
}
```

---

### Type Guards

Funciones para narrowing seguro — nunca hacer casting con `as`.

```typescript
// packages/shared/src/types/utils/type-guards.ts

import { EstadoPartido, TipoPartido } from '../enums'
import type { Partido, PartidoConRelaciones } from '../interfaces'

/** Verifica si un partido ya terminó */
export const isPartidoTerminado = (partido: Partido): boolean =>
  partido.estado === EstadoPartido.Finalizado ||
  partido.estado === EstadoPartido.Knockout

/** Verifica si un partido está en vivo */
export const isPartidoEnVivo = (partido: Partido): boolean =>
  partido.estado === EstadoPartido.EnVivo

/** Verifica si un partido es interno (práctica) */
export const isJuegoInterno = (partido: Partido): boolean =>
  partido.tipo === TipoPartido.Interno

/** Verifica si el partido tiene relaciones cargadas */
export const isPartidoConRelaciones = (
  partido: Partido
): partido is PartidoConRelaciones =>
  'equipo_local' in partido && 'equipo_visitante' in partido

/** Verifica si un valor es un EstadoPartido válido */
export const isEstadoPartido = (value: unknown): value is EstadoPartido =>
  Object.values(EstadoPartido).includes(value as EstadoPartido)
```

---

### Reglas TypeScript

```typescript
// ✓ Usar enum para valores del dominio
if (partido.estado === EstadoPartido.EnVivo) { ... }

// ✗ Nunca strings literales sueltos
if (partido.estado === 'live') { ... }   // PROHIBIDO

// ✓ Usar constantes para números mágicos
if (entrada >= DEFAULT_GAME_CONFIG.INNINGS_MINIMOS) { ... }

// ✗ Nunca números mágicos
if (entrada >= 5) { ... }   // PROHIBIDO — ¿qué significa 5?

// ✓ Usar type guards para narrowing
if (isPartidoEnVivo(partido)) {
  // TypeScript sabe que partido.estado === EstadoPartido.EnVivo
}

// ✗ Nunca casting con as
const p = data as Partido   // PROHIBIDO — usar type guards o Zod

// ✓ Usar Zod para validar datos externos (API, forms)
const PartidoSchema = z.object({
  tipo:   z.nativeEnum(TipoPartido),
  estado: z.nativeEnum(EstadoPartido),
})

// ✓ Exportar todo desde index.ts — un único punto de entrada
import { EstadoPartido, TipoPartido, DEFAULT_GAME_CONFIG } from '@elplay/shared/types'

// ✗ Nunca importar desde rutas internas
import { EstadoPartido } from '@elplay/shared/types/enums/partido.enum'  // PROHIBIDO
```

---

## Convenciones de Código

### Supabase Queries
```typescript
// ✓ Siempre manejar errores
const { data, error } = await supabase
  .from('partidos')
  .select('*, equipo_local:equipos!equipo_local_id(*)')
  .eq('id', id)
  .single()

if (error) throw new Error(error.message)
```

### Realtime (score en vivo)
```typescript
// ✓ Suscribirse a cambios de jugadas
const channel = supabase
  .channel(`partido:${partidoId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'jugadas',
    filter: `partido_id=eq.${partidoId}`
  }, (payload) => {
    // actualizar score en UI
  })
  .subscribe()

// ✓ Siempre limpiar subscriptions
return () => supabase.removeChannel(channel)
```

### Nomenclatura
```
Archivos:        kebab-case     (crear-partido.tsx)
Componentes:     PascalCase     (ScoreBoard.tsx)
Hooks:           camelCase      (usePartidoLive.ts)
Stores Zustand:  camelCase      (useScoreStore.ts)
Tablas DB:       snake_case     (equipo_local_id)
Variables:       camelCase      (partidoId)
Constantes:      UPPER_SNAKE    (MAX_INNINGS)
```

### Commits (Conventional Commits)
```
feat(scorer): add KO engine evaluation per half-inning
feat(mobile): add internal game roster split screen
fix(rls): restrict juego_interno visibility to team members
feat(db): add juego_grupos and grupo_jugadores tables
chore(setup): init monorepo with pnpm + turborepo
```

---

## KO Engine — Pseudocódigo

```typescript
// Llamar después de cada half-inning completado
async function evaluateKnockout(partidoId: string): Promise<boolean> {
  const partido = await getPartido(partidoId)

  // 1. Obtener reglas activas (jerarquía: juego > torneo > liga)
  const rules = await getActiveKnockoutRules(partido)
  if (!rules.length) return false

  // 2. Calcular diferencia de carreras actual
  const diff = Math.abs(partido.carreras_local - partido.carreras_visitante)

  // 3. Evaluar cada regla
  for (const rule of rules) {
    if (
      partido.entrada_actual >= rule.desde_entrada &&
      diff >= rule.diferencia_carreras
    ) {
      // KO activado
      await supabase
        .from('partidos')
        .update({ estado: 'ko' })
        .eq('id', partidoId)
      return true
    }
  }

  return false
}
```

---

## Comandos de Desarrollo

```bash
# Setup inicial
pnpm install
pnpm db:generate     # genera tipos TypeScript de Supabase
pnpm db:migrate      # corre migraciones
pnpm db:seed         # carga datos de prueba

# Desarrollo
pnpm dev:mobile      # inicia Expo
pnpm dev:web         # inicia Next.js
pnpm dev             # ambos en paralelo (Turborepo)

# Claude Code — agentes SDD
claude --model opus --agents '{
  "backend":        { "description": "Supabase schema, RLS, Edge Functions" },
  "mobile":         { "description": "React Native, Expo Router, UI components" },
  "scorer-engine":  { "description": "KO logic, Realtime, stats calculation" }
}'

# Correr en sesiones paralelas
claude agents   # panel de agentes background

# Code review antes de PR
claude ultrareview

# Build para producción
pnpm build:mobile    # EAS Build
pnpm build:web       # Next.js build
```

---

## Variables de Entorno

```bash
# apps/mobile/.env
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_APP_ENV=development

# apps/web/.env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # Solo server-side, nunca exponer

# supabase/.env
SUPABASE_ACCESS_TOKEN=
PROJECT_REF=
```

---

## Pantallas — 20 en total

| # | Pantalla | Fase | Tipo |
|---|---|---|---|
| 01 | Dashboard Home | F1 | Tab |
| 02 | Scorer en Vivo | F1 | Modal/Stack |
| 03 | Dashboard Público | F1 | Web + Mobile |
| 04 | Apuntes | F1 | Tab |
| 05 | Crear Liga | F1 | Stack |
| 06 | Gestión Liga | F1 | Stack |
| 07 | Crear Equipo | F1 | Stack |
| 08 | Crear Partido | F1 | Stack |
| 09 | Tabla Posiciones | F1 | Stack |
| 10 | Juego Interno — Crear | F1 | Stack |
| 11 | Juego Interno — Scorer | F1 | Modal/Stack |
| 12 | Historial Interno | F2 | Stack |
| 13 | Box Score | F2 | Stack |
| 14 | Stats Equipo | F2 | Stack |
| 15 | Perfil Jugador | F2 | Stack |
| 16 | Crear Torneo | F2 | Stack |
| 17 | Vista Torneo | F2 | Stack |
| 18 | Inscripción Torneo | F2 | Stack |
| 19 | Detalle Partido | F2 | Stack |
| 20 | Perfil & Ajustes | F3 | Tab |

---

## Reglas Importantes para Claude

1. **Nunca** saltarse RLS. Todo permiso va en la DB, no solo en el frontend.
2. **Nunca** mezclar stats de juegos internos con stats oficiales.
3. **Siempre** evaluar KO al finalizar cada half-inning, no solo al anotar carreras.
4. **Siempre** limpiar subscriptions de Supabase Realtime en el cleanup.
5. **Nunca** usar `any` en TypeScript. Usar los tipos generados de Supabase.
6. Los juegos internos (`tipo = 'interno'`) **nunca** aparecen en el dashboard público.
7. El campo `tipo` en `partidos` es la fuente de verdad para diferenciar los 3 tipos de juego.
8. Un torneo puede existir **sin** liga (`liga_id = null`). Un partido puede existir sin torneo (`torneo_id = null`).
9. Antes de cualquier PR, correr `claude ultrareview`.
10. Seguir Conventional Commits en todos los commits.
