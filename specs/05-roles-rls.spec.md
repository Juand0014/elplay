# Spec 05 — Roles, RLS, temporary scorer URL

**Part:** 05  
**Depends on:** 03 Guest + Google  

## Goal

Roles enforced in DB (RLS). Game creator shares invite URL; opener enters **name** and becomes **temporary scorer** for that session/game only.

## Roles

Guest · Temporary scorer · Assigned scorer · Player · Team captain · League leader  

## DoD

- [ ] Invite token expires / single-game scoped  
- [ ] Matrix tested manually  
- [ ] Policies in migrations, not UI-only  
