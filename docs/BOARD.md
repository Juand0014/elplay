# ElPlay Build Board

**Trello:** https://trello.com/b/C6kNPrzX/elplay  
**Reinicio:** Parte **00 Fundaciones** — base web + mobile corriendo.

## Asignaciones

| Persona | Trello user | Rol |
|---|---|---|
| Juan David Matos | `juandavidmatos1` | Owner |
| Yariel | `yariel` | Partner |

## Ahora (`priority:now`) — Parte 00

| Card | Quién | Lista |
|---|---|---|
| Confirm local env (`pnpm web` + `pnpm start`) | **Yariel** | Doing — Partner |
| Smoke CI typecheck/lint/test | **Yariel** | Doing — Partner |
| Review MEMORY / ARCHITECTURE / STAGES | **Juan** | Doing — Owner |
| Bootstrap Trello stages (`pnpm trello:bootstrap`) | **Juan** | Doing — Owner |
| (Opcional) Crear proyecto Supabase vacío | **Juan** | Spec Ready |

## Siguiente (Parte 01 — cuando 00 esté Done)

| Card | Quién |
|---|---|
| QA Scorer 2–3 innings | Yariel + Juan |
| Polish scorer pad UX | Yariel |
| Scorer engine / invite link hardening | Juan |

## Cómo refrescar el board

```bash
export TRELLO_API_KEY=...
export TRELLO_TOKEN=...
pnpm trello:bootstrap --archive-open
```

Ver [TRELLO.md](TRELLO.md) y [STAGES.md](STAGES.md).
