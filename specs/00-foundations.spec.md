# Spec 00 — Foundations

**Part:** 00  
**Status:** Active  
**Depends on:** —  

## Goal

Clean ElPlay app shell: Expo SDK 54 PWA, feature-first folders, theme tokens, Spanish i18n stub, Supabase client wiring, team docs, CI lint/typecheck. No product scoring yet.

## In scope

- Single Expo app at repo root with `src/` layout
- Design tokens (ElPlay brand) + dark sports shell home screen
- `src/i18n/es.ts` with foundation strings; home uses `t(...)`
- `src/lib/env.ts` + `src/lib/supabase.ts` (safe when env missing)
- Docs: MEMORY, AGENTS, ARCHITECTURE, CONTRIBUTING, TEAM_PLAYBOOK
- GitHub: PR template, Issue templates, CODEOWNERS, CI workflow
- Scripts: `pnpm typecheck`, `pnpm lint`, `pnpm web`, `pnpm test` (placeholder ok)

## Out of scope

- Auth, scorer pad, live dashboard, leagues CRUD

## Technical notes

- Path alias `@/*` → `src/*`
- Strict TypeScript
- English identifiers everywhere

## Split

| Who | Work |
|---|---|
| Owner / Architect / Agents | Structure, docs, CI, shell screen, lib |
| Partner | Clone, run `pnpm web`, open PR confirming local setup |

## Definition of Done

- [x] `pnpm install` works
- [x] `pnpm typecheck` passes
- [x] `pnpm lint` passes (or is wired and clean)
- [x] `pnpm web` shows ElPlay branded home (Spanish copy via i18n)
- [ ] Partner confirms `pnpm start` / Expo Go (mobile)
- [x] MEMORY marks part 00; CONTRIBUTING readable by a new contributor
- [x] No legacy `apps/` / `packages/` monorepo code remains
- [x] Stages documented in README + `docs/STAGES.md`
