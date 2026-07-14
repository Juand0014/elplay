# Empieza aquí — ElPlay (tú)

Este archivo es tu checklist humano. El plan técnico está en [PLAN.md](docs/PLAN.md) y la memoria de agentes en [MEMORY.md](../MEMORY.md).

## Paso 0 — Traer el código limpio

1. Abre el PR: https://github.com/Juand0014/elplay/pull/4  
2. Revísalo y **haz merge a `main`** (ahí está Foundations + Scorer MVP + plan).  
3. En tu máquina:

```bash
git checkout main
git pull origin main
pnpm install
cp .env.example .env
pnpm web
```

4. Prueba: **Entrar como invitado** → crea 2 equipos → anota outs/bolas/carreras.  
   El número del corredor debe verse en el **centro del diamante**.

---

## Paso 1 — Invitar a la otra persona (Partner)

1. Invítale al **repo** GitHub (rol Write si va a hacer PRs).  
2. Crea el tablero Trello **ElPlay Build** siguiendo [TRELLO.md](TRELLO.md).  
3. Invítalo al tablero Trello (puede trabajar con cards aunque aún no haga PRs).  
4. Asigna estas cards ahora:

| Card | Quién |
|---|---|
| Confirmar `pnpm web` en su PC | Partner |
| Probar Scorer 2–3 entradas (QA) | Partner o tú |
| Polish UX del pad (Issue #6) | Partner |

Issue Partner polish: https://github.com/Juand0014/elplay/issues/6

---

## Paso 2 — (Opcional hoy) Supabase + Google

Solo si quieres auth real ya:

1. Crea/abre proyecto Supabase.  
2. Pega en `.env`:

```
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

3. Corre la migración `supabase/migrations/20260714000000_part01_games_plays.sql` (SQL editor o CLI).  
4. Authentication → Providers → **Google** (Client ID/Secret).  
5. Redirect URLs: `http://localhost:8081` y tu dominio / `elplay://`.

Si no haces esto hoy, el scorer **sigue funcionando en local** (Zustand).

---

## Paso 3 — Cerrar Parte 01

Marca Parte 01 como OK cuando:

- [ ] Tú anotaste un partido de prueba  
- [ ] Partner pudo abrir la app  
- [ ] No hay blockers de UX graves  

Luego dime: **“Parte 01 OK, sigue con Live”** y arrancamos Parte 02 (dashboard en vivo).

---

## Paso 4 — Lo que NO hagas todavía

- No empieces ligas/torneos/roles completos  
- No borres `MEMORY.md` / `docs/PLAN.md`  
- No subas `.env` con secrets  
- No mezcles trabajo de dos partes a la vez  

---

## Mapa rápido de docs

| Doc | Para qué |
|---|---|
| [PLAN.md](PLAN.md) | Roadmap parte por parte |
| [MEMORY.md](../MEMORY.md) | Cursor + Claude |
| [TRELLO.md](TRELLO.md) | Asignar al 3ro |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Cómo contribuir |
| `specs/01-scorer-mvp.spec.md` | Contrato del scorer |
