# ElPlay — Master build plan

Canonical execution plan for Owner, Partner, Cursor, and Claude.  
**Fresh start:** Parte **00** activa. Detalle humano: [STAGES.md](STAGES.md) · Memoria agentes: [MEMORY.md](../MEMORY.md)

## Decisions (fixed)

| Topic | Decision |
|---|---|
| Product | One app **ElPlay** — no v1/v2 |
| Client | Expo 54 PWA (web mobile-first + native via Expo Go / EAS) |
| Code / UI | English code · Spanish UI via i18n |
| Auth | Guest first · Google primary (Part 03) |
| Board | **Trello** assigns humans ([TRELLO.md](TRELLO.md)) · GitHub = PRs |
| Softbol | WBSC baseline, **7 innings**, mercy configurable |
| Order | Foundations → Scorer → Live → Google/Guest → Roles → Leagues → Standings → Internal → Notes → Tournaments |

## Parts

| # | Name | Spec | Status (team) | Partner focus |
|---|---|---|---|---|
| 00 | Foundations (web + mobile runs) | `00-foundations` | **ACTIVE** | Confirm local setup |
| 01 | Scorer MVP | `01-scorer-mvp` | Next | Pad UI polish |
| 02 | Live + dashboard | `02-live-dashboard` | Waiting | Live cards UX |
| 03 | Guest + Google | `03-auth-guest-google` | Waiting | Auth screens polish |
| 05 | Roles + RLS + invite scorer | `05-roles-rls` | Waiting | Invite URL UX |
| 06 | Leagues / teams / roster | `06-leagues-teams` | Waiting | CRUD screens |
| 07 | Standings + KO | `07-standings-ko` | Waiting | Table UI |
| 08 | Internal games | `08-internal-game` | Waiting | Roster split UI |
| 09 | Notes | `09-notes` | Waiting | Notes list UI |
| 10+ | Tournaments, box score, zones, push | later | Later | — |

## Rule

Finish one part → DoD green → only then open the next.

## Softbol / UX reminders

- Diamond **center** = jersey # of the runner in motion
- KO evaluated on half-inning close
- Internal games never on public live
- Thumb-first scorer; scoreboard typography; not generic SaaS

## Tooling

- Cursor + Claude share `MEMORY.md`
- Trello bootstrap: `pnpm trello:bootstrap`
- Figma only for scorer + live key frames
- Sentry when live traffic starts (Part 02+)
