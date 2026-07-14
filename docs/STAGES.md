# ElPlay — Etapas (Stages)

Mapa canónico de construcción. Una etapa = 1 spec + cards Trello + DoD.  
**Empezamos de cero en la Parte 00** con una base que corre en **web y mobile**.

Board: https://trello.com/b/C6kNPrzX/elplay

---

## Principios

1. **Una app:** Expo PWA (web) + mismo código en mobile (Expo Go / EAS).
2. **Una parte activa** — no mezclar Partes en el mismo sprint de producto.
3. **Code English / UI Spanish** vía `src/i18n/es.ts`.
4. **Trello asigna humanos** · **GitHub** revisa código.
5. Softbol: WBSC baseline, **7 innings**, KO al cerrar media entrada, internos nunca en live público.

---

## Parte 00 — Fundaciones (ACTIVA)

**Spec:** `specs/00-foundations.spec.md`  
**Objetivo:** repo limpio, app abre en web y mobile, docs + CI, onboarding listo.

### Incluye

- Estructura feature-first (`src/app`, `src/features`, `src/theme`, `src/i18n`)
- Tokens de marca (naranja `#ff4d00`, Bebas + Inter)
- Cliente Supabase stub (sin obligar env)
- CI: typecheck + lint
- MEMORY / ARCHITECTURE / CONTRIBUTING / Trello docs

### DoD

- [ ] `pnpm web` muestra shell ElPlay
- [ ] `pnpm start` abre en Expo Go (o emulador)
- [ ] `pnpm typecheck` · `pnpm lint` · `pnpm test` OK
- [ ] Partner confirma setup en Trello (`OK local`)

### Asignaciones

| Card | Quién |
|---|---|
| Confirm web + mobile local | Yariel |
| Smoke CI local | Yariel |
| Review docs / arquitectura | Juan |
| Bootstrap Trello stages | Juan |

---

## Parte 01 — Scorer MVP

**Spec:** `specs/01-scorer-mvp.spec.md`  
**Objetivo:** anotar un partido rápido sin login (guest).

### Flujo

Crear partido (2 nombres) → pad (outs, B/S, hits, bases, undo) → invite link.

### DoD

- [ ] Juego de 2–3 innings anotado en un teléfono
- [ ] Diamante muestra # del corredor en el centro
- [ ] Tests del engine verdes

### Asignaciones

| Card | Quién |
|---|---|
| Engine / store / schema mínimo | Juan |
| Polish pad UX | Yariel |
| QA 2–3 innings | Yariel + Juan |

> En `main` ya hay un Scorer MVP jugable. En el reinicio de equipo: validar DoD y pulir, no reescribir sin necesidad.

---

## Parte 02 — Live + dashboard

**Spec:** `specs/02-live-dashboard.spec.md`  
`/live` lista · `/live/[id]` resumen · Realtime · **sin** juegos internos.

| Card | Quién |
|---|---|
| Queries + Realtime + índices | Juan |
| Live cards / summary UX | Yariel |

---

## Parte 03 — Guest + Google

**Spec:** `specs/03-auth-guest-google.spec.md`  
Guest first-class · Google primary · sin password wall.

| Card | Quién |
|---|---|
| Supabase Google + session | Juan |
| Auth UI polish | Yariel |

---

## Parte 05 — Roles + RLS + invite

**Spec:** `specs/05-roles-rls.spec.md`  
Roles en DB · invite con nombre · token con expiración.

| Card | Quién |
|---|---|
| Migraciones RLS / roles | Juan |
| Invite name UX | Yariel |

---

## Parte 06 — Ligas / equipos / roster

**Spec:** `specs/06-leagues-teams.spec.md`  
CRUD liga + equipos + jugadores · partido elige equipos reales.

---

## Parte 07 — Standings + KO

**Spec:** `specs/07-standings-ko.spec.md`  
Tabla W/L/PCT · misericordia al cerrar media entrada.

---

## Parte 08 — Juego interno

**Spec:** `specs/08-internal-game.spec.md`  
Split A/B · privado · stats separadas · nunca en live público.

---

## Parte 09 — Apuntes

**Spec:** `specs/09-notes.spec.md`  
Privado / equipo / público · vincular a partido.

---

## Parte 10+ — Después del MVP

Torneos, box score completo, zonas geográficas, push, PDF, multi-liga.

---

## Cómo avanzar de etapa

```
DoD Parte N verde → card(s) a Done → actualizar MEMORY.md
→ mover priority:now a Parte N+1 → crear/activar cards Trello
```

Script: `pnpm trello:bootstrap` (ver [TRELLO.md](TRELLO.md)).
