# Trello — human assignment board (3rd parties & partners)

**Trello is how we assign work to people outside Cursor/Claude** (Partner, freelancers, designers).  
**GitHub** stays the source of truth for code (PRs, CI, reviews).

Agents read this file + [BOARD.md](BOARD.md). When Atlassian MCP is authenticated in Cursor, the agent can create/update the board; until then, create it manually with the structure below.

## Board name

`ElPlay Build`

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

| Label | Color idea | Use |
|---|---|---|
| `part-00` … `part-09` | orange scale | Which product part |
| `role:ux` | pink | Design / UX |
| `role:mobile` | blue | App UI impl |
| `role:dba` | teal | Schema / RLS |
| `role:qa` | green | Verification |
| `priority:now` | red | Current active part only |
| `good-first` | lime | Safe for new 3rd parties |

## Members

- Owner (you)
- Partner(s) / 3rd parties — invite by email on the Trello board
- Optional: designer, QA

## Card template (copy into every card)

```
Title: feat(part-01): Scorer pad UI

Part: 01
Spec: specs/01-scorer-mvp.spec.md
Assignee: @partner
Repo PR: (link when open)

## Goal
…

## Done when
- [ ]
- [ ]

## Out of scope
…

## Notes for 3rd party
- Code: English / UI: Spanish via src/i18n/es.ts
- Read MEMORY.md + CONTRIBUTING.md first
- One active part — do not start Part N+1
```

## Seed cards to create now

| List | Card | Assignee |
|---|---|---|
| Doing — Partner | Confirm local setup (`pnpm web`) | Partner |
| Spec Ready | Part 01 — Scorer pad UI | Partner |
| Spec Ready | Part 01 — Schema games/plays | Owner |
| Backlog | Part 02 — Live dashboard UI | Partner / Contributor |
| Backlog | Part 03 — Guest + Google polish | Partner |
| Backlog | UX pass — scorer thumb reach & contrast | role:ux |

## Workflow with multiple 3rd parties

1. PM moves at most **one product part** to `priority:now`
2. Each person gets **one card** in their Doing list (no silent double-assign)
3. When code is ready → card to `Review` + open GitHub PR
4. After merge + DoD → `Done`, update MEMORY active part
5. Agents **do not** take cards in `Doing — Partner` / `Doing — Contributor` unless the card says so

## Sync rule

| Artifact | Owns |
|---|---|
| Trello card | Human assignment, due dates, who is blocked |
| GitHub PR | Code review, CI |
| `specs/*.spec.md` | Behavior contract |
| `MEMORY.md` | Active part for agents |

If Trello and GitHub disagree on priority, **MEMORY active part** wins for agents; PM fixes the board.

## Enable agent automation

1. In Cursor, authenticate the **Atlassian** MCP (Trello/Jira)
2. Ask the agent: “Create ElPlay Build board from docs/TRELLO.md”
3. Invite 3rd parties to the board (not necessarily to GitHub until they need PRs)
