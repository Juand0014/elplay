# Spec 03 — Guest access + Google Auth

**Part:** 03  
**Status:** Waiting (after Part 02 Live)  
**Depends on:** 00 Foundations, 01 Scorer (guest scoring already), 02 Live  

## Goal

Anyone can use ElPlay as a **guest** (no registration). Accounts are optional and created primarily via **Sign in with Google** (Supabase Auth). Email/password is not required for MVP.

## Product rules

1. **Guest is first-class** — view live, open invite scorer links, create quick games (Part 01 behavior stays). No forced signup wall.
2. **Google is the primary auth** — one tap; creates/links Supabase user.
3. After Google sign-in, guest local activity can be **claimed** (optional prompt: “Guardar mi sesión”).
4. Guest cannot hold league-leader / captain roles (those need Google account — Part 05).
5. Temporary scorer via URL remains guest-friendly (name prompt only).

## User flows

### Guest
1. Open app → “Entrar como invitado”
2. Land on home / live / create game without auth
3. Session flag persisted locally (`guest`); no `auth.users` row required

### Google
1. “Continuar con Google”
2. OAuth via Supabase (`provider: google`)
3. Web: redirect to app URL · Native: Expo AuthSession / WebBrowser
4. On success → authenticated session; profile display name from Google

## Technical

- `features/auth` owns sign-in / guest helpers
- Zustand `session` store: `{ mode: 'guest' | 'authenticated', userId?, displayName? }`
- Supabase Google provider must be enabled in project dashboard (Client ID / secret)
- Redirect allow-list: local, preview, production origins + `elplay://`
- Never expose service role key
- RLS: public/guest read for live games; writes for scoring still via invite token until roles land

## UX

- Home shows both CTAs: Guest (primary sports) + Google (secondary)
- No “create password” screens in MVP
- Spanish copy only via i18n
- If Google is not configured in env/dashboard, button explains setup (dev) without crashing

## Out of scope

- Apple Sign-In (later)
- Email/password as primary
- Full roles matrix (Part 05)

## Split

| Who | Work |
|---|---|
| Owner / Agents | Supabase Google provider wiring, session store, claim-guest flow |
| Partner | Sign-in / guest UI polish |
| DBA | RLS adjustments for authenticated vs anon |

## Definition of Done

- [ ] Guest path works with zero account
- [ ] Google sign-in works on web (and native smoke)
- [ ] Session survives reload
- [ ] Guest can still open scorer invite links
- [ ] `typecheck` + `lint` clean
