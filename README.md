# TCG League

TCG League is a competitive web platform for Trading Card Game communities. This repository now includes a usable MVP foundation with real authentication, editable player profiles, advanced store discovery, join requests, seeded data, and protected product routes ready for local testing.

## Stack

- Next.js 15 + React 19 + TypeScript
- Tailwind CSS v4 + shadcn/ui
- PostgreSQL + Prisma
- NextAuth/Auth.js with credentials auth and optional social OAuth
- Zod validation
- Future-ready domain hooks for Riot account linking via `LinkedAccount`

## Implemented so far

- Login and registration with onboarding focused on real testers
- Default `Riftbound` assignment at account creation, without asking for a main TCG during registration
- Prisma schema covering users, profiles, stores, matches, events, chat, notifications, disputes, and linked accounts
- Protected app shell, action-first home, and dashboard
- Owner dashboard with grouped pending join requests
- Real profile pages at `/profile/[id]` and `/profile/me`
- Store directory, filters, store detail pages, and join request workflow
- Store request management for owners and admins
- Admin panel for role changes, owner assignment, store verification, and store editing
- Competitive core for challenges, accepted matches, reporting, confirmation, disputes, and ELO-backed rankings
- Store finder with advanced filters (city/region/country/game/verified/active players)
- External official events links per store (locator, website, maps, social links) without replacing official registration platforms
- Social layer for players: friend requests, friend lists, 1:1 chat with polling, message notifications, and profile quick actions
- Seed script with demo stores, players, memberships, matches, events, friendships, chat, notifications, and join request states
- Architecture notes in [docs/architecture.md](./docs/architecture.md)
- Manual test guide for Phase 2 in [docs/fase-2-test.md](./docs/fase-2-test.md)
- Manual test guide for Phase 3 in [docs/fase-3-test.md](./docs/fase-3-test.md)
- Manual test guide for Phase 4 in [docs/fase-4-test.md](./docs/fase-4-test.md)
- Manual test guide for Phase 5 in [docs/fase-5-test.md](./docs/fase-5-test.md)
- Manual test guide for social + game-score ELO in [docs/fase-5-elo-social-test.md](./docs/fase-5-elo-social-test.md)

## Getting started

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Point `DATABASE_URL` to a PostgreSQL database.

3. Generate Prisma client and apply schema:

```bash
npm install
npm run db:generate
npm run db:push
```

4. Seed demo data:

```bash
npm run db:seed
```

5. Start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Demo credentials

After seeding, you can use:

- `admin@tcgleague.dev` / `League123!`
- `sergio@manavault.es` / `League123!`
- `laia@dragonden.es` / `League123!`
- `luna@tcgleague.dev` / `League123!`
- `marco@tcgleague.dev` / `League123!`
- `sofia@tcgleague.dev` / `League123!`
- `alex@tcgleague.dev` / `League123!`
- `diego@tcgleague.dev` / `League123!`

## Useful scripts

- `npm run dev` - start local development server
- `npm run build` - production build
- `npm run lint` - ESLint checks
- `npm run db:generate` - regenerate Prisma client
- `npm run db:migrate` - create and apply a migration locally
- `npm run db:push` - push schema to the database
- `npm run db:seed` - run demo seed
- `npm run db:studio` - open Prisma Studio

## Environment variables

Required:

- `DATABASE_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

Optional:

- `GITHUB_ID`
- `GITHUB_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `CLOUDINARY_*`
- `RIOT_CLIENT_ID`
- `RIOT_CLIENT_SECRET`

## Riot future-proofing

The MVP does not depend on Riot Sign On. Instead:

- credentials auth works today
- social login can be enabled by env vars
- `LinkedAccount` is reserved for future external identity linking
- Riot credentials are kept only as placeholders until official approval is available

## Delivery roadmap

1. Phase 1: architecture, schema, auth, dashboard
2. Phase 2: profiles, stores, join requests
3. Phase 3: challenges, matches, ELO flows
4. Phase 4: advanced store finder + external official events integration
5. Phase 5: social graph, chat 1:1, player UX and notifications
