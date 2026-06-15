# ARGENRETRO XI — Specification

## Tech Stack
- Frontend: TanStack Start (React 19, TypeScript, Vite, Tailwind CSS v4)
- Database: PostgreSQL via Supabase (remote, persistent)
- ORM: Drizzle (schema management, migrations)
- API layer: TanStack Start server functions (createServerFn)
- Admin panel: built-in web routes
- Data: manually curated (no scraping)

## Database Schema

### teams
| Column | Type | Description |
|--------|------|-------------|
| id | serial PK | Auto-increment |
| club | varchar(100) NOT NULL | Club name |
| year | integer NOT NULL | Historic year |
| abbr | varchar(10) NOT NULL | Abbreviation (e.g. CARP, CABJ) |
| rating | integer NOT NULL | Team overall rating |

### players
| Column | Type | Description |
|--------|------|-------------|
| id | serial PK | Auto-increment |
| team_id | integer FK → teams.id | Parent team |
| name | varchar(200) NOT NULL | Player name |
| rating | integer NOT NULL | Player rating (0-100) |
| position_1 | varchar(30) NOT NULL | Primary position |
| position_2 | varchar(30) | Secondary position (nullable) |
| position_3 | varchar(30) | Tertiary position (nullable) |

### Valid positions (enum-like, stored as strings)
- GOALKEEPER
- CENTRAL DEFENDER
- LEFT BACK
- RIGHT BACK
- DEFENSIVE MIDFIELDER
- CENTRAL MIDFIELDER
- OFFENSIVE MIDFIELDER
- LEFT WING
- RIGHT WING
- CENTRAL FORWARD

### Constraints
- position_1 is REQUIRED (must be one of the 10 valid positions)
- position_2 and position_3 are OPTIONAL
- A position cannot repeat within the same player (no duplicate positions)
- team_id references teams.id with ON DELETE CASCADE

## Field Positions (11 on the pitch)
The game uses 4-3-3 formation with these slots:
1. GOALKEEPER (ARQ)
2. RIGHT BACK (LD) — auto-assigned from CENTRAL DEFENDER pool
3. CENTER BACK (DFC) — auto-assigned from CENTRAL DEFENDER
4. CENTER BACK (DFC) — auto-assigned from CENTRAL DEFENDER
5. LEFT BACK (LI) — auto-assigned from CENTRAL DEFENDER pool
6. DEFENSIVE MIDFIELDER (MCD)
7. CENTRAL MIDFIELDER (MC)
8. CENTRAL MIDFIELDER (MC)
9. RIGHT WING (ED)
10. CENTRAL FORWARD (DC)
11. LEFT WING (EI)

Slot-to-position mapping:
- Slot 0  → GOALKEEPER
- Slot 1  → RIGHT BACK
- Slot 2  → CENTRAL DEFENDER
- Slot 3  → CENTRAL DEFENDER
- Slot 4  → LEFT BACK
- Slot 5  → DEFENSIVE MIDFIELDER
- Slots 6, 7 → CENTRAL MIDFIELDER
- Slot 8  → RIGHT WING
- Slot 9  → CENTRAL FORWARD
- Slot 10 → LEFT WING

## Project Structure (planned)

```
src/
├── db/
│   ├── schema.ts          # Drizzle schema definition
│   ├── client.ts          # Database client (Supabase connection)
│   └── seed.ts            # Seed script: migrate historic-teams.json → DB
├── lib/
│   ├── api/
│   │   ├── teams.ts       # Server functions for teams CRUD
│   │   └── players.ts     # Server functions for players CRUD
│   ├── config.server.ts   # Server config (DATABASE_URL, etc.)
│   └── utils.ts           # cn() utility
├── hooks/
│   ├── useGame.ts         # Game state logic
│   ├── useMatch.ts        # Match simulation
│   ├── useRanking.ts      # Local ranking
│   └── useAdmin.ts        # Admin CRUD operations
├── components/
│   ├── panels/
│   │   ├── DrawPanel.tsx
│   │   ├── MatchPanel.tsx
│   │   ├── LiveMatchPanel.tsx
│   │   ├── ResultPanel.tsx
│   │   └── EndPanel.tsx
│   └── admin/
│       ├── TeamList.tsx
│       ├── TeamForm.tsx
│       ├── PlayerForm.tsx
│       └── PlayerList.tsx
├── routes/
│   ├── __root.tsx
│   ├── index.tsx           # Main game (refactored)
│   ├── admin/
│   │   ├── index.tsx       # Admin dashboard
│   │   └── teams.$id.tsx   # Edit team + players
│   └── sitemap[.]xml.ts
├── types.ts                # Shared TypeScript types
└── data/
    └── historic-teams.json  # Source data for seed
```

## Phases

### Phase 0 — Setup
- Install drizzle-orm, drizzle-kit, @supabase/supabase-js, postgres
- Create .env with DATABASE_URL (Supabase connection string)
- Configure drizzle.config.ts
- Create src/db/schema.ts and src/db/client.ts

### Phase 1 — Database + Seed
- Push schema to Supabase PostgreSQL via drizzle-kit push
- Write seed script that reads historic-teams.json and inserts teams + players
- Run seed to populate remote database

### Phase 2 — Server Functions (API)
- teams.ts: getTeams(), getTeamById(), createTeam(), updateTeam(), deleteTeam()
- players.ts: getPlayersByTeam(), createPlayer(), updatePlayer(), deletePlayer()
- Each function uses createServerFn with Zod input validation

### Phase 3 — Refactor Frontend
- Extract types to src/types.ts
- Extract game logic to hooks (useGame, useMatch)
- Separate panel components into individual files
- Wire game to fetch teams/players from API instead of local JSON

### Phase 4 — Admin Panel
- /admin route with team list
- Create/edit team form
- Player CRUD (inline per team)
- Position selector restricted to the 8 valid options

### Phase 5 — Bug Fixes
- Fix TDZ (USER_KEY before startGame)
- Fix stale closure in live match effect
- Make sitemap URL configurable via VITE_SITE_URL
- Add "use client" directives to shadcn/ui components

### Phase 6 — Tests (optional)
- Vitest setup
- Unit tests for game logic
- Tests for server functions

## Deployment Notes
- DATABASE_URL must be set in production environment
- Sitemap URL configured via VITE_SITE_URL env var
- @lovable.dev/vite-tanstack-config dependency may need replacement for non-Lovable deployment
