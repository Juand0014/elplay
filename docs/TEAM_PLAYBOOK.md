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

1. Spec written (`specs/NN-….spec.md`) → status Spec Ready
2. Design Issue (if UI) → Partner / UX
3. DB/RLS Issue → DBA track
4. Implement Issues split by area → assignees
5. QA Issue → someone who did **not** implement the core
6. PM marks part Done in MEMORY.md and opens the next part

## Collaboration with Cursor + Claude

- Both read MEMORY + AGENTS.md
- Prefer Issues as the contract for “who does what”
- If an agent and a human collide, **human assignee wins**; agent stops and documents

## Communication

- Issue titles / commits: English
- QA steps for Dominican field testing: Spanish is fine in the Issue body
