# ElPlay — Specs SDD

## ¿Cómo funciona SDD en este proyecto?

Cada feature tiene su propio archivo `.spec.md`.
Claude Code lee el spec y genera el código completo.

## Flujo por spec

```
1. Lees el spec
2. Le das a Claude Code: "Implementa el spec /specs/fase-1/01-monorepo-setup.spec.md"
3. Claude Code genera el código
4. Corres `claude ultrareview` para review
5. Haces commit y pasas al siguiente spec
```

## Reglas

- Un spec a la vez — no saltes specs
- Siempre hacer `claude ultrareview` antes de pasar al siguiente
- Si un spec falla, corrígelo antes de continuar
- El orden importa — cada spec depende del anterior

---

## Fase 1 — MVP Core

| # | Spec | Depende de |
|---|---|---|
| 01 | Monorepo Setup | — |
| 02 | Supabase Schema | 01 |
| 03 | RLS Policies | 02 |
| 04 | TypeScript Types | 02 |
| 05 | Auth | 03, 04 |
| 06 | Ligas CRUD | 05 |
| 07 | Equipos & Jugadores CRUD | 06 |
| 08 | Juego de Liga — Crear Partido | 07 |
| 09 | Scorer en Vivo | 08 |
| 10 | KO Engine | 09 |
| 11 | Dashboard Público | 09 |
| 12 | Juego Interno | 07, 09 |
| 13 | Apuntes | 08, 12 |
| 14 | Dashboard Home | 09, 13 |
| 15 | Tabla de Posiciones | 09 |

## Fase 2 — Stats & Torneos

| # | Spec | Depende de |
|---|---|---|
| 16 | Box Score | 09 |
| 17 | Stats Jugador | 16 |
| 18 | Stats Equipo | 17 |
| 19 | Torneos CRUD | 06 |
| 20 | Inscripción Torneo | 19 |
| 21 | Vista Torneo | 20 |
| 22 | Historial Interno | 12 |
| 23 | Apuntes Avanzados | 13 |
| 24 | Detalle Partido | 16 |

## Fase 3 — Pro

| # | Spec | Depende de |
|---|---|---|
| 25 | Push Notifications | 09 |
| 26 | Exportar PDF | 16, 17 |
| 27 | Compartir Partido | 11 |
| 28 | Comparar Stats | 17, 22 |
