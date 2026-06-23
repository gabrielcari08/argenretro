# Match Simulation Engine Redesign — ARGENRETRO XI

> Architecture plan, phased migration, and design decisions.

---

## Current Problems (Before)

1. **Repetitive scorelines** — 1-0, 2-1, 2-0 dominate. The linear formula `1.25 ± edge * 0.04` + narrow jitter (±0.8) + clamp [0,4] + anti-high-scoring correction produce a narrow result band.
2. **2-0 leads almost always concede a consolation goal** — The forced tie-breaking and near-symmetric goal generation create artificial "almost comebacks."
3. **Equalizers almost always lead to a full comeback** — Same cause: once tied, the tie-breaker fires again and forces a winner.
4. **Matches feel scripted** — Because the result IS predetermined (`userGoals`/`rivalGoals` computed first), then events are backfilled around it. Commentary events are hardcoded (12', 29', 45', 57', 72') regardless of match state.
5. **No natural draws** — Tie-breaking always produces a winner, even though it's a knockout tournament (draws don't exist at all in the engine).
6. **Single factor** — Only `edge = overall - rival.rating` influences everything. Individual player ratings, positions, and formation don't matter.

---

## Target Architecture (After)

### Paradigm shift

**Before:** `result → timeline`
**After:** `state → phase → events → state' → phase → ... → result`

The match is simulated as a sequence of phases (blocks of simulated minutes). Each phase:
1. Receives the current `MatchState` (score, momentum, pressure, dominance)
2. Evaluates team strength + match context
3. Rolls for events (goals, chances)
4. Updates match state for the next phase
5. Emits events to the timeline

### How score context influences behavior

| Situation | Engine effect |
|---|---|
| Losing by 1 | `momentum += 15` (pushes harder) |
| Losing by 2 | `momentum += 25`, `pressure += 30` (desperation → errors) |
| Winning by 1 | `momentum -= 8` (slight complacency) |
| Winning by 2 | `momentum -= 15`, `dominanceShift = -10` (sits back) |
| Goal just scored | `momentum += 20` for scorer, `momentum -= 15` for conceder |
| Run of 2+ consecutive goals | `pressure += 10` cumulative |
| Tie score | No modifiers — draws happen naturally |

### Memory of the match

- **Momentum** (range: -100 to +100): mean-reverts toward base team strength but with swing from events. A team that just scored has a bonus; a team that conceded has a penalty. Over time, momentum drifts back to the "true" strength difference.
- **Pressure** (range: 0-100): accumulates when a team is behind for a long time, or when chances are missed. High pressure increases both goal probability and error probability (double-edged sword).
- **Dominance** (range: -100 to +100): rolling average of phase-by-phase territorial control. Updated after each phase. Used to generate contextual commentary ("Team X is dominating the midfield").

---

## What to Keep

| Component | Reason |
|---|---|
| Phase FSM (`build → ready → live → result → ...`) | Clean, extensible |
| Drafting/player selection system | Position-aware, well-tested |
| LiveMatchPanel UI | Solid event timeline display |
| Formation/position logic (`formations.ts`, `positionUtils.ts`) | Clean, testable |
| localStorage persistence | Simple and effective |
| Timer-based animation (20s → 90min) | Good compression ratio |

## What to Eliminate

| Code | Reason |
|---|---|
| Pre-determined result (lines 167-196 of `simulate()`) | Root cause of all scripting issues |
| Anti-high-scoring correction (lines 173-176) | Artificial clamp, narrows result band |
| Forced tie-breaking (lines 178-185) | Eliminates natural draws |
| Hardcoded commentary (lines 200-207: 12', 29', 45', etc.) | Same every match |
| Round-robin scorer assignment (line 189) | Unrealistic goal distribution |

## What to Refactor

| Current | Target |
|---|---|
| `simulate()` monolithic function | `matchEngine.ts` with phase-by-phase simulation |
| `useGame.ts` as simulation container | Extracted engine module |
| `Math.random()` everywhere | `SeededRNG` for reproducibility |
| Single `edge` factor | Multiple factors: line ratings, formation, momentum |
| `Match` / `LiveEvent` types | Richer types with `MatchState`, `PhaseResult` |

---

## Phased Migration Plan

### Phase 1 — Extract and Isolate (no visible change)

**Goal:** Separate simulation logic from the hook monolith. Everything behaves identically.

- Create `src/lib/SeededRNG.ts` — LCG implementation (prepare for Phase 2)
- Create `src/lib/matchEngine.ts` — extracted current `simulate()` logic
- Create `src/lib/eventGenerators.ts` — extracted event generation
- Create `src/lib/matchHelpers.ts` — scorer assignment, stat generation
- Update `src/types.ts` — add `SimulationInput`, `SimulationResult` types
- Update `src/hooks/useGame.ts` — delegate to matchEngine

**Files created:**
- `src/lib/SeededRNG.ts`
- `src/lib/matchEngine.ts`
- `src/lib/eventGenerators.ts`
- `src/lib/matchHelpers.ts`

**Files modified:**
- `src/types.ts`
- `src/hooks/useGame.ts`

**Verification:** Game runs identically. Same results distribution.

---

### Phase 2 — Phase-by-Phase Engine (paradigm change)

**Goal:** Replace result-first simulation with sequential phase evaluation.

- Implement `evaluatePhase()` — the core algorithm
- Divide 90' into 6 phases of 15' each
- Each phase: compute dominance, roll for goals, update momentum/state
- Goal generation: `probability = sigmoid(dominance / 25) * phaseLength * BASE_GOAL_RATE`
- Anti-high-scoring and forced tie-breaking removed
- `SeededRNG` becomes the primary RNG

**Default goal rate calibration:**
```
BASE_GOAL_RATE = 0.01  // per minute per unit of scaled dominance
// At dominance=0: ~0.15 goals per 15min phase → ~0.9 goals per match
// At dominance=+50: ~0.45 goals per phase → ~2.7 per match
```

**Verification:** Run 1000 simulations. Check:
- Wider result distribution (includes 0-0, 3-0, 3-2, 4-1, etc.)
- Natural draws appear
- No artificial comeback patterns
- Same seed → same result

---

### Phase 3 — Contextual Events

**Goal:** Replace 6 hardcoded commentary events with dynamic, state-aware event generation.

- Event generators per category:
  - `chanceEvent(side, minute, player)` — shots, saves, near-misses
  - `goalEvent(side, minute, scorer, assist?)`
  - `pressureEvent(minute, pressure)` — intense periods
  - `momentumShiftEvent(minute, momentum)` — territorial swings
- Each phase emits 1-3 events based on `MatchState`
- Scorer weighting by position (forwards 3× weight of defenders)
- Commentary templates stored in `commentaryTemplates.ts`

**Verification:** No two matches have identical event sequences (with different seeds).

**Files created:**
- `src/data/commentaryTemplates.ts`

**Files modified:**
- `src/lib/eventGenerators.ts`

---

### Phase 4 — Weighted Individual Ratings

**Goal:** Make player ratings matter beyond the single `overall` edge.

- Per-line strength: defense OVR, midfield OVR, attack OVR
- Goal probability per player weighted by:
  - Player rating vs opposing position rating
  - Position type (forward 3×, midfielder 2×, defender 0.5×)
  - Match momentum bonus for recent scorers
- Formation affects base line strength (e.g., 4-3-3 stronger attack, 5-3-2 stronger defense)

**Verification:** Teams with strong forwards score more. Teams with weak keepers concede more.

---

### Phase 5 — Extra Time and Penalties

**Goal:** Handle draws without breaking the match flow.

- If tied after 90': automatic transition to `phase = "extratime"`
- 2 extra phases of 15' each with `fatigueMultiplier = 0.7` (fewer goals)
- Same momentum/dominance logic
- If still tied: `phase = "penalties"`
- 5 designated kickers chosen before shootout
- If more kickers needed: designate one by one
- If no more players available: cycle back through the same order
- Penalty probability: `kicker.rating / (kicker.rating + gk.rating) * 0.85`
- Sudden death after 5 rounds

**Verification:** Forced draw scenario → flows to ET → flows to penalties correctly.

**Files modified:**
- `src/types.ts` (new phases, penalty state)
- `src/lib/matchEngine.ts` (extraTime(), penalties())
- `src/hooks/useGame.ts` (new phase transitions)
- `src/components/panels/LiveMatchPanel.tsx` (show phase, penalty round)

---

## Internal Data Structures

### Types (progressive, added phase by phase)

```typescript
// === Phase 1 types ===

type SimulationInput = {
  picks: Pick[];
  overall: number;
  rival: HistoricTeam;
  round: string;
  goalkeeperNames: Set<string>;
};

type SimulationResult = {
  match: Match;
  events: LiveEvent[];
};

// === Phase 2 types (added) ===

type MatchState = {
  minute: number;
  score: [number, number];
  momentum: number;         // -100 to +100
  pressure: number;         // 0-100
  dominance: number;        // -100 to +100, rolling average
  phaseIndex: number;       // 0-5 (or 0-7 with ET)
};

type PhaseConfig = {
  startMinute: number;
  endMinute: number;
  fatigueMultiplier: number; // 1.0 for regular, 0.7 for ET
};

type PhaseResult = {
  goals: { side: "user" | "rival"; minute: number }[];
  stateDelta: Partial<MatchState>;
  events: LiveEvent[];
};

// === Phase 5 types (added) ===

type PenaltyState = {
  round: number;
  userKickers: number[];    // indices into picks
  rivalKickers: number[];   // player names
  userScore: number;
  rivalScore: number;
  isSuddenDeath: boolean;
  remainingKickers: number[]; // indices of players not yet kicked this round
};
```

### SeededRNG (Phase 1)

```typescript
class SeededRNG {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  // LCG: X_{n+1} = (a * X_n + c) mod 2^32
  // Numerical Recipes parameters: a = 1664525, c = 1013904223
  next(): number {
    this.state = (this.state * 1664525 + 1013904223) >>> 0;
    return this.state / 4294967296;
  }

  nextInt(min: number, max: number): number {
    return min + Math.floor(this.next() * (max - min));
  }
}
```

---

## Design Decisions (from user)

| Decision | Choice |
|---|---|
| RNG implementation | LCG (Linear Congruential Generator), no external deps |
| Statistical distribution | Simple > perfect. Can migrate to `seedrandom` later if bias patterns emerge |
| Penalty kicker selection | 5 designated before shootout. If more needed, designate one-by-one. Exhausted pool → cycle same order |
| Extra time duration | 7 seconds per 15-minute half (14 seconds total) |
| Inter-round fatigue | None |
| Cards / injuries | Not implemented |
| Phase timeline | 6 phases × 15' regular time, 2 phases × 15' extra time |
| Goal generation | Poisson-inspired probability per phase, not per-minute simulation |
| Commentary | Dynamic, state-aware (Phase 3) |
| Testing | Seeded RNG enables deterministic replay |

---

## File Map (Post-Migration)

```
src/
  lib/
    SeededRNG.ts           ← NEW — LCG implementation
    matchEngine.ts          ← NEW — Phase-by-phase engine
    eventGenerators.ts      ← NEW — Dynamic event generation
    matchHelpers.ts         ← NEW — Rival selection, scorer weighting, stat generation
    formations.ts           ← KEEP — Unchanged
    positionUtils.ts        ← KEEP — Unchanged
  data/
    commentaryTemplates.ts  ← NEW (Phase 3) — Event text templates
  hooks/
    useGame.ts              ← MODIFY — Delegate to matchEngine, manage phase FSM
    useRanking.ts           ← KEEP — Unchanged
  types.ts                  ← MODIFY — Add MatchState, SimInput, SimResult, PenaltyState
  components/
    panels/
      LiveMatchPanel.tsx    ← MODIFY (Phase 5) — Show ET/penalty phase info
```

---

## Phase Transition Table (Phase FSM)

```
build → ready → live → result → upgrade → ready → ... → champion
                      ↘ lost
                      ↘ extratime → live → extratime2 → live → penalties → result
```

New phases to add:
- `"extratime"` — Extra time first half
- `"penalties"` — Penalty shootout
- `"penalty_kick"` — Individual penalty kick (interactive or auto-resolve)

---

## Implementation Status — All Phases Complete

### Phase 4 — Weighted Individual Ratings (per-line OVR)

**Files created/modified:**
- `src/lib/matchHelpers.ts` — Added `computeLineAverages()`, `computeRivalLines()`
- `src/lib/matchEngine.ts` — Modified phase probability formula

**Line breakdown:**
- Defense (slots 0-4): GK, RB, CB, CB, LB
- Midfield (slots 5-7): CDM, CM, CM
- Attack (slots 8-10): RW, CF, LW

**Goal probability formula per phase:**
```
userAtkBonus = (atkOvr - rivalDef) / 350       // user attack vs rival defense
rivalAtkBonus = (rival.atk - defOvr) / 350      // rival attack vs user defense
midBonus = (midOvr - rival.mid) / 500           // midfield control (both sides)
effEdge = edge + momentum + scoreContext(±5-12)

userProb = clamp(0.20 + userAtkBonus + midBonus + effEdge / 400)
rivalProb = clamp(0.20 + rivalAtkBonus - midBonus - effEdge / 400)
```

**Rival line estimation:** If the rival has player data with positions, actual per-line ratings are computed. Otherwise, the single `rival.rating` is used for all lines.

---

### Phase 5 — Extra Time and Penalties

**Files modified:**
- `src/types.ts` — Added `PenaltyKick`, `extraTime`, `penalties`, `penaltyScore` to `Match`, `totalMinutes` to `SimulationResult`
- `src/data/commentaryTemplates.ts` — Added ET and penalty templates
- `src/lib/matchEngine.ts` — Added `runPhase()`, `simulatePenalties()`, ET/penalty flow
- `src/lib/eventGenerators.ts` — Added `generatePenaltyEvents()`, ET comment slots
- `src/hooks/useGame.ts` — Dynamic timer (totalMinutes, realDuration based on match type)
- `src/components/panels/LiveMatchPanel.tsx` — Phase labels, penalty score display, dynamic progress bar

**Flow:**
```
Regular time (6 phases, 90 min, 20s)
  → if tied → Extra time (2 phases, 30 min, 14s)
    → if still tied → Penalties (pre-computed, ~6s)
      → 5 rounds minimum
      → Sudden death if tied after 5
      → Kickers: 5 designated before shootout (best rated). 
         Reserves used one-by-one in sudden death.
         Cycle through full pool if exhausted.
```

**Penalty probability:**
```
userProb = 0.75 + (kicker.rating - rivalGK.rating) / 200    // ~65-85%
rivalProb = 0.75 + (rivalKicker.rating - userGK.rating) / 200
```

**Timer calibration:**
| Match Type | Minutes | Real Time | Rate |
|---|---|---|---|
| Regular | 90 | 20s | 4.5 min/s |
| Extra time | 120 | 34s | 3.5 min/s |
| Penalties | 140 | 40s | 3.5 min/s |

**UI indicators:**
- Regular play: `"En vivo"` label, minute counter, blue accent
- Extra time: `"Tiempo extra"` label, amber accent
- Penalties: `"Penales"` label, red accent, penalty score shown
