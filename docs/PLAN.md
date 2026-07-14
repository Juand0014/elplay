# ElPlay — Master build plan

Canonical execution plan for Owner, Partner, Cursor, and Claude.  
Details live in `MEMORY.md`; this file is the **part-by-part roadmap**.

## Decisions (fixed)

| Topic | Decision |
|---|---|
| Product | One app **ElPlay** — no v1/v2 |
| Client | Expo 54 PWA (web mobile-first + native) |
| Code / UI | English code · Spanish UI via i18n |
| Auth | Guest first · Google primary (Part 03) |
| Board | **Trello** assigns humans ([TRELLO.md](TRELLO.md)) · GitHub = PRs |
| Softbol | WBSC baseline, **7 innings**, mercy configurable |
| Order | Scorer → Live → Google/Guest polish → Roles → Leagues → Standings → Internal → Notes → Tournaments |

## Parts

| # | Name | Spec | Partner focus |
|---|---|---|---|
| 00 | Foundations | `00-foundations` | Local setup |
| 01 | Scorer MVP | `01-scorer-mvp` | Pad UI polish |
| 02 | Live + dashboard | `02-live-dashboard` | Live cards UX |
| 03 | Guest + Google | `03-auth-guest-google` | Auth screens polish |
| 05 | Roles + RLS + invite scorer | `05-roles-rls` | Invite URL UX |
| 06 | Leagues / teams / roster | `06-leagues-teams` | CRUD screens |
| 07 | Standings + KO | `07-standings-ko` | Table UI |
| 08 | Internal games | `08-internal-game` | Roster split UI |
| 09 | Notes | `09-notes` | Notes list UI |
| 10+ | Tournaments, box score, zones, push | later | — |

## Rule

Finish one part → DoD green → only then open the next.

## Softbol / UX reminders

- Diamond **center** = jersey # of the runner in motion
- KO evaluated on half-inning close
- Internal games never on public live
- Thumb-first scorer; scoreboard typography; not generic SaaS

## Tooling suggestions

- Cursor + Claude share `MEMORY.md`
- Trello for 3rd parties; auth Atlassian MCP to automate board
- Figma only for scorer + live key frames
- Sentry when live traffic starts (Part 02+)
