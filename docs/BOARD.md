# ElPlay Build Board (mirror)

Source of truth: **GitHub Issues**. This file helps Cursor/Claude and partners see ownership at a glance.

## Columns

Backlog → Spec Ready → Doing Owner → Doing Partner → Review → Done

## Part 00 — Foundations

| Issue | Owner | Status |
|---|---|---|
| Spec 00 written | Owner | Done |
| App shell + docs + CI | Owner / Agents | In progress → Done when PR merges |
| Confirm local setup (`pnpm web`) | **Partner** | Todo — use Issue template Partner setup |

## Part 01 — Scorer MVP (blocked on 00 DoD)

| Issue | Owner | Status |
|---|---|---|
| Spec 01 | Owner | Spec Ready |
| Scorer pad UI | **Partner** | Backlog |
| Schema `games`/`plays` + hooks | Owner / Agents | Backlog |
| Invite token link | Owner | Backlog |
| QA 2–3 innings | Whoever did not implement core | Backlog |

## Part 03 — Guest + Google Auth (after Live)

| Issue | Owner | Status |
|---|---|---|
| Spec 03 | Owner | Spec Ready (`specs/03-auth-guest-google.spec.md`) |
| Home CTAs guest + Google (shell) | Owner / Agents | Done in Foundations follow-up |
| Supabase Google provider + redirects | Owner | Todo (dashboard config) |
| Polish sign-in / guest UX | **Partner** | Backlog |

## Rules

- One active product part
- One primary assignee per Issue
- Agents do not take Partner-assigned Issues unless asked
