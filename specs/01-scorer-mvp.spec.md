# Spec 01 — Scorer MVP (no auth)

**Part:** 01  
**Status:** Next (do not implement until Part 00 DoD is green)  
**Depends on:** 00 Foundations  

## Goal

Let someone create a quick game between two teams (names as text), score runs / outs / balls / strikes / base occupancy, advance half-innings, keep a short play-by-play, persist to Supabase, and share a **temporary scorer invite link** — **without login**.

## User flow

1. Create game: home team name + away team name
2. Open scorer pad for that game
3. Record plays / adjust count / set runners on 1B–2B–3B
4. Advance half-inning (top/bottom) and inning number
5. Undo last play
6. Copy invite URL; another device can open and score the same game (session name prompt later hardened in Part 05)

## Data (English schema)

Minimum tables (exact migration in implementation):

- `games` — id, home/away names, scores, inning, half, status, count fields, bases, invite_token, timestamps
- `plays` — id, game_id, sequence, play_type, runs_scored, description, created_at

Indexes: `games(status)`, `plays(game_id, created_at)`.

## UX

- Large scoreboard numbers; thumb-friendly pad
- Sports look (tokens only)
- All labels via i18n Spanish
- Block scoring when status is `done` or `ko`

## Softbol rules (MVP)

- 3 outs per half-inning before advance
- Default 7 innings display (full KO engine in Part 07)
- WBSC-inspired; league overrides later

## Out of scope

- OAuth, roles matrix, standings, roster IDs, tournaments, public live list (Part 02)

## Split

| Who | Work |
|---|---|
| Owner / Agents | Migrations, hooks, invite token, persistence |
| Partner | Scorer pad UI layout + states per mock/spec |
| Architect | `features/scorer` boundaries + indexes |

## Definition of Done

- [ ] Create game + score 2–3 innings on web/mobile
- [ ] Plays persist; reload restores state
- [ ] Invite link opens the same game scorer
- [ ] `typecheck` + `lint` clean; basic unit tests for count/half-inning helpers
- [ ] MEMORY updated: Part 01 done → Part 02 active
