# Trello — human assignment board

**Live board:** https://trello.com/b/C6kNPrzX/elplay (`ElPlay`)

**Trello** assigns Partner / freelancers.  
**GitHub** owns code (PRs, CI).

## Board layout

### Lists

1. `Backlog`
2. `Spec Ready`
3. `Doing — Owner`
4. `Doing — Partner`
5. `Doing — Contributor`
6. `Review`
7. `Blocked`
8. `Done`

### Labels

`part-00`…`part-09`, `part-10plus`, `role:ux`, `role:mobile`, `role:dba`, `role:qa`, `priority:now`, `good-first`, `owner`, `partner`

### Members

| Persona | Username Trello | idMembers (approx) |
|---|---|---|
| Juan | `juandavidmatos1` | resolved by script |
| Yariel | `yariel` | resolved by script |

## Fresh start — Part 00 cards

Run the bootstrap to **reset stage cards** and assign Owner/Partner:

```bash
# Get key: https://trello.com/power-ups/admin
# Token: https://trello.com/1/authorize?expiration=never&scope=read,write&response_type=token&key=YOUR_KEY

export TRELLO_API_KEY=your_key
export TRELLO_TOKEN=your_token
# optional overrides:
# export TRELLO_BOARD_ID=C6kNPrzX

pnpm trello:bootstrap
```

What the script does:

1. Resolves Juan + Yariel member IDs  
2. Archives old open cards (optional flag `--archive-open`)  
3. Creates Part 00–09 stage cards in the right lists  
4. Puts **Part 00** cards in Doing with `priority:now`  
5. Assigns Partner cards → Yariel · Owner cards → Juan  

## Active now (`priority:now`) — Part 00

| Card | Assignee | List |
|---|---|---|
| Confirm local env (`pnpm web` + `pnpm start`) | Yariel | Doing — Partner |
| Smoke CI (typecheck/lint/test) | Yariel | Doing — Partner |
| Review foundations docs / architecture | Juan | Doing — Owner |
| Run Trello bootstrap / keep board clean | Juan | Doing — Owner |

## Workflow

1. One product part with `priority:now` (see [STAGES.md](STAGES.md))  
2. One assignee per card  
3. Code ready → `Review` + GitHub PR  
4. Merged + DoD → `Done` · update `MEMORY.md`  
5. Agents do **not** take Partner/Contributor Doing cards unless the card says so  

## Sync rule

| Artifact | Owns |
|---|---|
| Trello card | Human assignment |
| GitHub PR | Code review / CI |
| `specs/*.spec.md` | Behavior |
| `MEMORY.md` | Active part for agents |
| `docs/STAGES.md` | Stage map for humans |
