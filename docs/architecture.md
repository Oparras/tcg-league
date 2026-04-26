# TCG League Architecture

## Principles

- Build the MVP as a real product surface, not a marketing shell.
- Keep auth independent from Riot while reserving a clean integration point.
- Use feature-first modules so each phase can grow without collapsing route logic into giant files.

## App Structure

```text
src/
  app/
    (marketing)/        public landing
    (auth)/             login + register
    (app)/              protected product shell
    api/                auth and mutation endpoints
  components/
    layout/             app shell, sidebar, nav, theme toggle
    providers/          SessionProvider + ThemeProvider
    shared/             reusable cards, logo, metrics, empty states
  features/
    auth/               forms, queries and auth-facing logic
    dashboard/          dashboard queries and widgets
    shared/             cross-feature placeholders for future phases
  lib/
    auth/               NextAuth config + session helpers
    constants/          games, navigation, labels
    validations/        Zod schemas
    db.ts               lazy Prisma client
    elo.ts              shared rating utilities
```

## Data Modeling Notes

- `Account` stays available for Auth.js adapters if we move from JWT sessions later.
- `LinkedAccount` is separate and reserved for platform and game identities such as Riot RSO.
- `PlayerGameStat` caches per-game ELO and winrate so rankings remain cheap to query.
- `StoreMembership` and `StoreJoinRequest` stay separate so approval flows remain auditable.
- `Challenge` models negotiation and scheduling; `Match` stores the rated result and ELO snapshots.

## Phase Roadmap

1. Fase 1: scaffolding, Prisma schema, auth, protected shell, dashboard.
2. Fase 2: profile pages, store detail, store join request workflows.
3. Fase 3: challenge creation, match confirmation flow, ELO mutations.
4. Fase 4: event creation, registrations, store-driven event management.
5. Fase 5: friendships, chat, notifications center, admin workflows.
