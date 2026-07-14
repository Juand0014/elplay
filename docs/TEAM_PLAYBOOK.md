# Team playbook — ElPlay

How each role works on this repo. Humans and AI agents share the same rules.

## Roles

| Role | Owns | Does not |
|---|---|---|
| **PM** | Active part, prioritization, DoD sign-off, scope control | Silent scope creep mid-part |
| **Architect** | Folder structure, boundaries, scale notes in ARCHITECTURE.md, veto on god-files | Feature UI polish without boundary review |
| **DBA** | Migrations, RLS, indexes, generated types | Client-only permission checks |
| **Mobile / Web** | Screens, hooks wiring, PWA behavior, i18n usage | Ad-hoc colors / raw Spanish strings |
| **UX / UI** | Scorer ergonomics, live board readability, sports visual direction | Designing 40 screens before Part 01 |
| **Reviewer** | RLS, EN-code/ES-i18n, no `any`, Realtime cleanup, PR size | Rubber-stamping failing CI |
| **Partner / Contributors** | Assigned Issues only | Jumping parts or unassigned refactors |

## Cadence per part

1. Spec written (`specs/NN-….spec.md`) → Spec Ready
2. **Trello card** assigned to Partner / 3rd party (see [TRELLO.md](TRELLO.md))
3. Design / UX card if UI-heavy
4. DB/RLS card → DBA track
5. Implement → Review → GitHub PR
6. QA by someone who did **not** implement the core
7. PM marks part Done in MEMORY.md and opens the next part

## Assigning 3rd parties

- Invite them to the **Trello** board `ElPlay Build` (not required on GitHub until they open PRs)
- One card per person in `Doing — Partner` or `Doing — Contributor`
- Card must link the spec path and Done-when checklist
- Agents never take those Doing lists unless the card explicitly says so

## Collaboration with Cursor + Claude

- Both read MEMORY + AGENTS.md
- Trello = human assignment · GitHub = code
- If an agent and a human collide, **human assignee wins**; agent stops and documents

## Communication

- Issue / Trello titles / commits: English
- QA steps for Dominican field testing: Spanish is fine in the card body
- UX bar: sports scoreboard clarity, thumb-first scorer, no generic SaaS chrome (see MEMORY brand + entry screen)