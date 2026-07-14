# Trello — human assignment board (3rd parties & partners)

**Live board:** https://trello.com/b/C6kNPrzX/elplay (`ElPlay`)

**Trello** assigns work to Partner / freelancers / designers.  
**GitHub** stays source of truth for code (PRs, CI).

## Board name

`ElPlay`

## Lists (columns)

1. `Backlog`
2. `Spec Ready`
3. `Doing — Owner`
4. `Doing — Partner`
5. `Doing — Contributor`
6. `Review`
7. `Blocked`
8. `Done`

## Labels

`part-00`…`part-09`, `part-10plus`, `role:ux`, `role:mobile`, `role:dba`, `role:qa`, `priority:now`, `good-first`, `owner`, `partner`

## Active now (`priority:now`)

- Partner: confirm `pnpm web`
- Partner: polish scorer pad UX
- Partner/Owner: QA 2–3 innings
- Owner: invite Partner to this board
- Owner: optional Supabase + Google setup

## Workflow

1. One product part with `priority:now`
2. One assignee per card
3. Code ready → `Review` + GitHub PR
4. Merged + DoD → `Done` · update MEMORY active part
5. Agents do **not** take `Doing — Partner` / `Doing — Contributor` unless the card says so

## Sync rule

| Artifact | Owns |
|---|---|
| Trello card | Human assignment |
| GitHub PR | Code review / CI |
| `specs/*.spec.md` | Behavior |
| `MEMORY.md` | Active part for agents |
