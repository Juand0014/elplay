# Spec 02 — Live game + live dashboard

**Part:** 02  
**Depends on:** 01 Scorer MVP  

## Goal

Public viewers see a live game summary (not the scorer pad) and a dashboard of games in progress, filterable by league (and later zone).

## Flows

1. `/live/[id]` — score, inning/half, outs, last play, diamond with runner #  
2. `/live` — list of `status=live` games; tap → detail  
3. Realtime updates when scorer records plays  

## DoD

- [ ] Viewer on second device updates without refresh  
- [ ] Internal games excluded  
- [ ] Indexes used for live list  
- [ ] Channel cleanup on unmount  
