# ARGENRETRO XI — Specification

## Gameplay — Position-Aware Drafting

**The goal is that when the dice are rolled, a team is selected and all of its players are displayed. The user will then choose a player, and this player will be included in the formation. If the player can play in more than one position, highlight the squares on the formation so the user can choose where they want to place them.**

### Drafting flow

1. User rolls dice → random team appears
2. All players from that team are displayed
3. User selects a player (not a slot first)
4. The game checks the player's compatible positions (`position_1`, `position_2`, `position_3`) against the formation's `SLOT_POSITION_MAP`
5. If the player fits **0** available slots → button disabled with "Sin posición disponible"
6. If the player fits **1** available slot → placed automatically in that slot
7. If the player fits **2+** available slots → valid slots pulse on the field with "Colocar aquí", user clicks where to place them

### Upgrade flow (between rounds)

1. User clicks a player on the pitch → dice rolls for a new team
2. Only players whose positions are compatible with the target slot are enabled
3. Incompatible players show "Posición no compatible"
4. Clicking a compatible player replaces them immediately

## Implementation — Key Files

| File                                  | Role                                                                                                                                                               |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `src/types.ts`                        | Defines `Phase` (+ `"positioning"`), `PendingPlayer`, `SLOT_POSITION_MAP` (ValidPosition → slot indices), updated `SavedGame`                                      |
| `src/hooks/useGame.ts`                | New state: `pendingPlayer`. New function: `placePlayer(slot)`. Modified `choose` accepts optional `slotOverride`. Positioning treated as build for team exclusions |
| `src/lib/positionUtils.ts`            | `getAvailablePositions(player)` — extracts non-null positions. `getCompatibleSlots(positions, takenSlots)` — maps positions to free slot indices                   |
| `src/components/panels/DrawPanel.tsx` | Removed slot selector dropdown. Player clicks now calculate compatible slots: 0 → disabled, 1 → auto-place, 2+ → set `pendingPlayer` + enter `"positioning"`       |
| `src/styles.css`                      | Added `@keyframes position-pulse`, `.animate-position-target` (pulsing glow), `.animate-position-dim` (dimmed occupied slots)                                      |
| `src/routes/index.tsx`                | Pitch renders compatible slots with glow animation + "Colocar aquí" label. Clicks call `placePlayer(slot)`. Upgrade highlighting unchanged                         |

## Tech Stack

- Frontend: TanStack Start (React 19, TypeScript, Vite, Tailwind CSS v4)
- Database: PostgreSQL via Supabase (remote, persistent)
- ORM: Drizzle (schema management, migrations)
- API layer: TanStack Start server functions (createServerFn)
- Admin panel: built-in web routes
- Data: manually curated (no scraping)

## Database Schema

### teams

| Column | Type                  | Description                    |
| ------ | --------------------- | ------------------------------ |
| id     | serial PK             | Auto-increment                 |
| club   | varchar(100) NOT NULL | Club name                      |
| year   | integer NOT NULL      | Historic year                  |
| abbr   | varchar(10) NOT NULL  | Abbreviation (e.g. CARP, CABJ) |
| rating | integer NOT NULL      | Team overall rating            |

### players

| Column     | Type                  | Description                   |
| ---------- | --------------------- | ----------------------------- |
| id         | serial PK             | Auto-increment                |
| team_id    | integer FK → teams.id | Parent team                   |
| name       | varchar(200) NOT NULL | Player name                   |
| rating     | integer NOT NULL      | Player rating (0-100)         |
| position_1 | varchar(30) NOT NULL  | Primary position              |
| position_2 | varchar(30)           | Secondary position (nullable) |
| position_3 | varchar(30)           | Tertiary position (nullable)  |

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
2. RIGHT BACK (LD)
3. CENTER BACK (DFC)
4. CENTER BACK (DFC)
5. LEFT BACK (LI)
6. DEFENSIVE MIDFIELDER (MCD)
7. CENTRAL MIDFIELDER (MC)
8. CENTRAL MIDFIELDER (MC)
9. RIGHT WING (ED)
10. CENTRAL FORWARD (DC)
11. LEFT WING (EI)

### Slot-to-position mapping

| Slot | ValidPosition        | Display Code |
| ---- | -------------------- | ------------ |
| 0    | GOALKEEPER           | ARQ          |
| 1    | RIGHT BACK           | LD           |
| 2    | CENTRAL DEFENDER     | DFC          |
| 3    | CENTRAL DEFENDER     | DFC          |
| 4    | LEFT BACK            | LI           |
| 5    | DEFENSIVE MIDFIELDER | MCD          |
| 6    | CENTRAL MIDFIELDER   | MC           |
| 7    | CENTRAL MIDFIELDER   | MC           |
| 8    | RIGHT WING           | ED           |
| 9    | CENTRAL FORWARD      | DC           |
| 10   | LEFT WING            | EI           |

### SLOT_POSITION_MAP (how player positions map to slots)

| ValidPosition        | Compatible Slots |
| -------------------- | ---------------- |
| GOALKEEPER           | [0]              |
| RIGHT BACK           | [1]              |
| CENTRAL DEFENDER     | [2, 3]           |
| LEFT BACK            | [4]              |
| DEFENSIVE MIDFIELDER | [5]              |
| CENTRAL MIDFIELDER   | [6, 7]           |
| OFFENSIVE MIDFIELDER | [6, 7]           |
| RIGHT WING           | [8]              |
| CENTRAL FORWARD      | [9]              |
| LEFT WING            | [10]             |

## Project Structure

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
│   ├── positionUtils.ts   # Position-to-slot matching (getAvailablePositions, getCompatibleSlots)
│   └── utils.ts           # cn() utility
├── hooks/
│   ├── useGame.ts         # Game state logic (drafting, positioning, simulation)
│   ├── useMatch.ts        # Match simulation
│   ├── useRanking.ts      # Local ranking
│   └── useAdmin.ts        # Admin CRUD operations
├── components/
│   ├── panels/
│   │   ├── DrawPanel.tsx  # Dice roll + position-aware player selection
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
│   ├── index.tsx           # Main game — pitch + panel orchestration
│   ├── admin/
│   │   ├── index.tsx       # Admin dashboard
│   │   └── teams.$id.tsx   # Edit team + players
│   └── sitemap[.]xml.ts
├── types.ts                # Shared TypeScript types + SLOT_POSITION_MAP
├── styles.css              # Tailwind + custom animations
└── data/
    └── historic-teams.json  # Source data for seed
```

## Deployment Notes

- DATABASE_URL must be set in production environment
- Sitemap URL configured via VITE_SITE_URL env var
- @lovable.dev/vite-tanstack-config dependency may need replacement for non-Lovable deployment
