# ElPlay

PWA mobile-first para ligas de softball en República Dominicana.

**Code:** English · **UI:** Spanish (`src/i18n/es.ts`) · **Sin v1/v2** — un solo producto.

| | |
|---|---|
| Repo | https://github.com/Juand0014/elplay |
| Branch | `main` |
| Trello | https://trello.com/b/C6kNPrzX/elplay |
| Parte activa | **01 Scorer MVP** |

---

## Collaborators — cómo empezar (léelo primero)

### Equipo

| Persona | Rol en Trello | Empieza por |
|---|---|---|
| **Juan** (`juandavidmatos1`) | Owner | Cards en *Doing — Owner* |
| **Yariel** (`yariel`) | Partner | Cards en *Doing — Partner* (prioridad `priority:now`) |

### 1) Clonar e instalar

```bash
git clone https://github.com/Juand0014/elplay.git
cd elplay
git checkout main
git pull origin main
pnpm install
cp .env.example .env
# Windows PowerShell:
# copy .env.example .env
pnpm web
```

Abre la URL de Expo (suele ser `http://localhost:8081`).

**Requisitos:** Node ≥ 20, pnpm ≥ 9. No necesitas Supabase ni Google para probar el scorer.

### 2) Qué debe hacer Yariel ahora (en orden)

1. Abre Trello → lista **Doing — Partner**  
2. Card **Confirm local env (`pnpm web`)** → sigue la descripción → comenta `OK local`  
3. Card **QA: Score 2–3 innings** → prueba el anotador  
4. Card **Polish scorer pad UX** → crea branch, pulir UI, abre PR  

```bash
git checkout -b feat/part-01-scorer-polish
# ...cambios...
git add -A
git commit -m "feat(scorer): polish pad UX for thumb-first scoring"
git push -u origin feat/part-01-scorer-polish
# Abre PR a main en GitHub
```

### 3) Flujo del partido de prueba

1. **Entrar como invitado**  
2. Crear 2 equipos → **Empezar a anotar**  
3. Escribir el # del bateador/corredor → debe verse en el **centro del diamante**  
4. Probar bola / strike / out / hits / +1 carrera / deshacer / copiar link  

### 4) Reglas del equipo

- Una sola **parte activa** a la vez (ahora: Parte 01)  
- No empieces Part 02 (Live) hasta que Parte 01 esté en **Done**  
- Código/comentarios/commits: **inglés**  
- Textos de pantalla: **español** solo en `src/i18n/es.ts`  
- Antes de PR: `pnpm typecheck` · `pnpm lint` · `pnpm test`  
- Trello = quién hace qué · GitHub = código  

### 5) Qué hace Juan ahora

- Cards *Doing — Owner* (Supabase/Google opcional, sync DB)  
- Review de PRs de Yariel  
- Prioridad en Trello con label `priority:now`  

---

## Scripts

| Comando | Qué hace |
|---|---|
| `pnpm web` | App en navegador (PWA) |
| `pnpm start` | Expo |
| `pnpm typecheck` | TypeScript |
| `pnpm lint` | ESLint |
| `pnpm test` | Jest |

## Docs

| Doc | Para qué |
|---|---|
| [docs/START_HERE.md](docs/START_HERE.md) | Checklist humano |
| [docs/PLAN.md](docs/PLAN.md) | Roadmap parte por parte |
| [docs/TRELLO.md](docs/TRELLO.md) | Cómo usar el board |
| [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) | Cómo contribuir |
| [MEMORY.md](MEMORY.md) | Memoria Cursor + Claude |
| [specs/](specs/) | Specs por parte |

## Stack (resumen)

Expo SDK 54 · Expo Router · React Native Web · TypeScript strict · Zustand · TanStack Query · Zod · Supabase (cuando se configure)
