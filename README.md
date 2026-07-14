# ElPlay

PWA **mobile-first** para ligas de softball en República Dominicana.  
**Una sola app Expo** → web (navegador) + mobile (Expo Go / native). Sin v1/v2.

| | |
|---|---|
| Repo | https://github.com/Juand0014/elplay |
| Branch base | `main` |
| Trello | https://trello.com/b/C6kNPrzX/elplay |
| Parte activa | **00 — Fundaciones** (empezamos de cero) |

**Code:** English · **UI:** Spanish only in `src/i18n/es.ts`

---

## Arranque limpio (mobile + web)

Requisitos: **Node ≥ 20**, **pnpm ≥ 9**.

```bash
git clone https://github.com/Juand0014/elplay.git
cd elplay
git checkout main
git pull
pnpm install
cp .env.example .env
```

| Plataforma | Comando | Resultado |
|---|---|---|
| **Web (PWA)** | `pnpm web` | Abre Metro en `http://localhost:8081` |
| **Mobile (Expo)** | `pnpm start` | QR para Expo Go (iOS/Android) |
| Android emulador | `pnpm android` | Si tienes emulador/SDK |
| iOS simulador | `pnpm ios` | Solo macOS |

No necesitas Supabase ni Google para la **Parte 00** ni para probar el shell / scorer local.

Checklist rápido:

1. `pnpm web` → ves la marca **ElPlay** (diamante + naranja `#ff4d00`)
2. `pnpm start` → escaneas QR con Expo Go
3. `pnpm typecheck && pnpm lint && pnpm test` → CI local OK

---

## Equipo

| Persona | Trello | Rol | Empieza por |
|---|---|---|---|
| **Juan** (`juandavidmatos1`) | Owner | Arquitecto / PM | Cards *Doing — Owner* |
| **Yariel** (`yariel`) | Partner | Mobile / UX | Cards *Doing — Partner* |

- **Trello** = quién hace qué  
- **GitHub** = código (PRs + CI)  
- Una sola **parte activa** a la vez  

---

## Etapas del producto (orden fijo)

Detalle completo: [docs/STAGES.md](docs/STAGES.md) · Roadmap: [docs/PLAN.md](docs/PLAN.md)

| # | Etapa | Spec | Estado equipo | Quién lidera |
|---|---|---|---|---|
| **00** | Fundaciones (app corre web+mobile) | `00-foundations` | **ACTIVA — empezar aquí** | Juan + Yariel |
| **01** | Scorer MVP (anotar sin login) | `01-scorer-mvp` | Siguiente | Juan (engine) · Yariel (UX pad) |
| **02** | Live partido + dashboard | `02-live-dashboard` | Esperando | Juan (Realtime) · Yariel (cards) |
| **03** | Guest + Google Auth | `03-auth-guest-google` | Esperando | Juan (Auth) · Yariel (UI) |
| **05** | Roles + RLS + invite scorer | `05-roles-rls` | Esperando | Juan (DB/RLS) · Yariel (invite UX) |
| **06** | Ligas / equipos / roster | `06-leagues-teams` | Esperando | Split |
| **07** | Standings + KO | `07-standings-ko` | Esperando | Juan (KO) · Yariel (tabla) |
| **08** | Juego interno | `08-internal-game` | Esperando | Split |
| **09** | Apuntes | `09-notes` | Esperando | Yariel (lista) |
| **10+** | Torneos, box score, zonas, push | — | Después | — |

**Regla:** no abrir la siguiente etapa hasta DoD verde de la actual.

### Ahora mismo (Parte 00)

| Tarea | Asignado | Lista Trello |
|---|---|---|
| Confirmar `pnpm web` + `pnpm start` (Expo Go) | **Yariel** | Doing — Partner |
| Smoke CI: typecheck / lint / test | **Yariel** | Doing — Partner |
| Revisar estructura + MEMORY / ARCHITECTURE | **Juan** | Doing — Owner |
| Bootstrap Trello (script de cards frescas) | **Juan** | Doing — Owner |
| (Opcional) Supabase project vacío | **Juan** | Spec Ready |

Cuando Parte 00 esté Done → abrir Parte 01 (Scorer).

---

## Scripts

| Comando | Qué hace |
|---|---|
| `pnpm web` | Web / PWA |
| `pnpm start` | Expo (mobile QR) |
| `pnpm android` / `pnpm ios` | Native targets |
| `pnpm typecheck` | TypeScript |
| `pnpm lint` | ESLint |
| `pnpm test` | Jest |
| `pnpm trello:bootstrap` | Recrea cards de etapas en Trello (necesita API key) |

## Docs

| Doc | Para qué |
|---|---|
| [docs/STAGES.md](docs/STAGES.md) | **Etapas** explicadas (este es el mapa) |
| [docs/START_HERE.md](docs/START_HERE.md) | Checklist humano de hoy |
| [docs/PLAN.md](docs/PLAN.md) | Roadmap |
| [docs/TRELLO.md](docs/TRELLO.md) | Board + sync |
| [docs/BOARD.md](docs/BOARD.md) | Asignaciones actuales |
| [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) | Cómo contribuir |
| [MEMORY.md](MEMORY.md) | Memoria Cursor + Claude |
| [specs/](specs/) | Specs por parte |

## Stack

Expo SDK **54** · Expo Router · React Native Web · TypeScript strict · Zustand · TanStack Query · Zod · Supabase (cuando se configure)
