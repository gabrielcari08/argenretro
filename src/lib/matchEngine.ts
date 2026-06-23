import type { SimulationInput, SimulationResult, Match, Attack, AttackOutcome } from "@/types";
import { SeededRNG } from "./SeededRNG";

import {
  computeLineAverages, computeRivalLines,
} from "./matchHelpers";

type MatchConfig = {
  edge: number;
  atkEdge: number;
  rivalLines: ReturnType<typeof computeRivalLines>;
  defOvr: number;
  midOvr: number;
  isET: boolean;
  picks: SimulationInput["picks"];
  rival: SimulationInput["rival"];
  goalkeeperNames: SimulationInput["goalkeeperNames"];
};

type MatchState = {
  momentum: number;
  cooldownTicks: number;
};

const ATTACK_WEIGHTS: Record<AttackOutcome, number> = {
  goal: 5,
  saved: 2,
  missed: 1,
  blocked: 1.5,
  build_up_broken: 0.5,
};

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function scoreFromAttacks(attacks: Attack[], side: "user" | "rival"): number {
  return attacks.filter((a) => a.outcome === "goal" && a.side === side).length;
}

const POSITION_MULTIPLIER: Record<string, number> = {
  "CENTRAL FORWARD": 3,
  "LEFT WING": 3,
  "RIGHT WING": 3,
  "OFFENSIVE MIDFIELDER": 3,
  "CENTRAL MIDFIELDER": 2,
  "DEFENSIVE MIDFIELDER": 2,
  "CENTRAL DEFENDER": 1,
  "LEFT BACK": 1,
  "RIGHT BACK": 1,
};

function pickWeightedScorer(
  players: { name: string; rating: number; position?: string; position_1?: string }[],
  rng: SeededRNG,
): string {
  const totalWeight = players.reduce((sum, p) => {
    const pos = p.position ?? p.position_1 ?? "";
    const mult = POSITION_MULTIPLIER[pos] ?? 1;
    return sum + p.rating * mult;
  }, 0);
  if (totalWeight <= 0) return players[0]?.name ?? "Gol en contra";
  let roll = rng.next() * totalWeight;
  for (const p of players) {
    const pos = p.position ?? p.position_1 ?? "";
    const mult = POSITION_MULTIPLIER[pos] ?? 1;
    roll -= p.rating * mult;
    if (roll <= 0) return p.name;
  }
  return players[players.length - 1]?.name ?? "Gol en contra";
}

function pickAttackScorer(
  side: "user" | "rival",
  config: MatchConfig,
  rng: SeededRNG,
): string {
  if (side === "user") {
    const eligible = config.picks.filter((p) => !config.goalkeeperNames.has(p.name));
    if (eligible.length === 0) return "Gol en contra";
    return pickWeightedScorer(eligible, rng);
  }
  const rivalPlayers = config.rival.players?.slice(1) ?? [];
  if (rivalPlayers.length === 0) return config.rival.club;
  return pickWeightedScorer(rivalPlayers, rng);
}

function computeAttackProb(
  state: MatchState,
  config: MatchConfig,
  userGoals: number,
  rivalGoals: number,
): number {
  const diff = userGoals - rivalGoals;
  const base = config.isET ? 0.15 : 0.22;
  const edgeFactor = config.edge / 500;
  const momentumFactor = state.momentum / 600;
  let scoreFactor = 0;
  if (diff < 0) scoreFactor = 0.06;
  else if (diff > 0) scoreFactor = -0.04;
  let prob = base + edgeFactor + momentumFactor + scoreFactor;
  if (state.cooldownTicks > 0) prob *= 0.6;
  return clamp(prob, 0.03, 0.50);
}

function evaluateState(
  state: MatchState,
  allAttacks: Attack[],
  recentWindowEnd: number,
  config: MatchConfig,
): MatchState {
  const userGoals = scoreFromAttacks(allAttacks, "user");
  const rivalGoals = scoreFromAttacks(allAttacks, "rival");
  const diff = userGoals - rivalGoals;

  const recentAttacks = allAttacks.filter(
    (a) => a.minute > recentWindowEnd - 5 && a.minute <= recentWindowEnd,
  );

  const weightedPressure = recentAttacks.reduce((sum, a) => {
    const base = ATTACK_WEIGHTS[a.outcome] ?? 1;
    return sum + (a.isBigChance ? base * 2 : base);
  }, 0);

  const userRecent = recentAttacks.filter((a) => a.side === "user").length;
  const rivalRecent = recentAttacks.filter((a) => a.side === "rival").length;
  const domainShift = (userRecent - rivalRecent) * 2;

  let scoreContext = 0;
  if (diff >= 2) scoreContext = -8;
  else if (diff === 1) scoreContext = -4;
  else if (diff === -1) scoreContext = 6;
  else if (diff <= -2) scoreContext = 10;

  const normalizedPressure = clamp(weightedPressure / 5, 0, 5);
  const normalizedDomain = clamp(domainShift, -5, 5);

  let newMomentum = state.momentum * 0.7
    + scoreContext * 0.3
    + normalizedPressure * 0.2
    + normalizedDomain * 0.2;

  return { ...state, momentum: Math.round(clamp(newMomentum, -100, 100)) };
}

function computeConversionProb(
  state: MatchState,
  config: MatchConfig,
  side: "user" | "rival",
): number {
  let base = 0.10;
  let lineInfluence = 0;
  if (side === "user") {
    lineInfluence = config.atkEdge / 500;
  } else {
    lineInfluence = (config.rivalLines.atk - config.defOvr) / 500;
  }
  const momentumInfluence = state.momentum / 500;
  return clamp(base + lineInfluence + momentumInfluence, 0.02, 0.30);
}

function rollNonGoal(rng: SeededRNG): AttackOutcome {
  const roll = rng.next();
  if (roll < 0.30) return "saved";
  if (roll < 0.65) return "missed";
  if (roll < 0.85) return "blocked";
  return "build_up_broken";
}

function applyMomentumShift(momentum: number, attack: Attack): number {
  const userIsAttacker = attack.side === "user";
  let shift: number;

  switch (attack.outcome) {
    case "goal":
      shift = userIsAttacker ? 15 : -10;
      break;
    case "saved":
      if (attack.isBigChance) {
        shift = userIsAttacker ? -3 : 5;
      } else {
        shift = userIsAttacker ? 1 : 2;
      }
      break;
    case "missed":
      if (attack.isBigChance) {
        shift = userIsAttacker ? -5 : -2;
      } else {
        shift = userIsAttacker ? -1 : 0;
      }
      break;
    case "blocked":
      shift = userIsAttacker ? -1 : 2;
      break;
    case "build_up_broken":
      shift = userIsAttacker ? -1 : 1;
      break;
  }

  return clamp(momentum + shift, -100, 100);
}

const ATTACK_TEXTS: Record<string, string[]> = {
  saved_big: [
    "tuvo la más clara pero el arquero respondió",
    "increíble atajada cuando el gol ya se cantaba",
    "lo gritaban pero el arquero lo negó",
  ],
  saved_routine: [
    "remata al arco, el arquero controla",
    "disparo directo al arquero, sin peligro",
  ],
  missed_big: [
    "lo tuvo que hacer el gol pero la manda afuera",
    "increíble: remata desviado estando solo frente al arco",
  ],
  missed_routine: [
    "remate que se va muy desviado",
    "prueba desde fuera, sin puntería",
  ],
  blocked: [
    "remate bloqueado por la defensa",
    "no encuentra espacios, la defensa cierra",
  ],
};

function buildAttackText(
  attack: Attack,
  config: MatchConfig,
  rng: SeededRNG,
): string {
  const teamName = attack.side === "user" ? "ARG XI" : config.rival.club;

  switch (attack.outcome) {
    case "goal": {
      const name = pickAttackScorer(attack.side, config, rng);
      attack.scorer = name;
      return `¡GOL de ${name}!`;
    }
    case "saved": {
      const key = attack.isBigChance ? "saved_big" : "saved_routine";
      const texts = ATTACK_TEXTS[key];
      return `${teamName} ${texts[Math.floor(rng.next() * texts.length)]}`;
    }
    case "missed": {
      const key = attack.isBigChance ? "missed_big" : "missed_routine";
      const texts = ATTACK_TEXTS[key];
      return `${teamName} ${texts[Math.floor(rng.next() * texts.length)]}`;
    }
    case "blocked": {
      const texts = ATTACK_TEXTS.blocked;
      return `${teamName} ${texts[Math.floor(rng.next() * texts.length)]}`;
    }
    default:
      return `${teamName} pierde la pelota en la gestación`;
  }
}

function runMatch(
  minutes: number,
  offset: number,
  initialState: MatchState,
  config: MatchConfig,
  rng: SeededRNG,
): { attacks: Attack[]; events: import("@/types").LiveEvent[]; finalState: MatchState } {
  let state = { ...initialState };
  const attacks: Attack[] = [];
  const events: import("@/types").LiveEvent[] = [];

  if (offset === 0) {
    events.push({
      minute: 1,
      text: "¡Rueda la pelota! Comienza el partido.",
      side: "neutral",
    });
  }

  for (let tick = 1; tick <= minutes; tick++) {
    const realMinute = offset + tick;
    const userGoals = scoreFromAttacks(attacks, "user");
    const rivalGoals = scoreFromAttacks(attacks, "rival");

    if (tick % 5 === 0) {
      state = evaluateState(state, attacks, realMinute, config);
    }

    if (state.cooldownTicks > 0) {
      state.cooldownTicks--;
    }

    const attackProb = computeAttackProb(state, config, userGoals, rivalGoals);

    if (rng.next() < attackProb) {
      const diff = userGoals - rivalGoals;
      let userShare = 0.50 + config.edge / 300 + state.momentum / 300;
      if (diff > 0) userShare -= 0.05;
      else if (diff < 0) userShare += 0.05;
      userShare = clamp(userShare, 0.10, 0.90);

      const side: "user" | "rival" = rng.next() < userShare ? "user" : "rival";

      let bigChanceProb = 0.25;
      if (state.cooldownTicks > 0) bigChanceProb *= 0.5;
      const isBigChance = rng.next() < bigChanceProb;

      let conversionProb = computeConversionProb(state, config, side);
      if (isBigChance) conversionProb *= 1.8;
      conversionProb = clamp(conversionProb, 0.02, 0.40);

      const outcome: AttackOutcome = rng.next() < conversionProb ? "goal" : rollNonGoal(rng);

      const attack: Attack = { minute: realMinute, side, outcome, isBigChance };
      attacks.push(attack);

      state.momentum = applyMomentumShift(state.momentum, attack);

      if (outcome === "goal") {
        state.cooldownTicks = 2;
      }

      const isNotable = outcome === "goal"
        || isBigChance
        || (outcome !== "build_up_broken" && rng.next() < 0.20);

      if (isNotable) {
        events.push({
          minute: realMinute,
          text: buildAttackText(attack, config, rng),
          side,
          goal: outcome === "goal",
        });
      }
    }
  }

  const endText = offset === 0 ? "¡Final del partido!" : "Final del tiempo extra.";
  events.push({ minute: offset + minutes, text: endText, side: "neutral" });

  return { attacks, events, finalState: state };
}

function simulatePenalties(
  picks: SimulationInput["picks"],
  rival: SimulationInput["rival"],
  goalkeeperNames: Set<string>,
  rng: SeededRNG,
): { userScore: number; rivalScore: number; kicks: import("@/types").PenaltyKick[] } {
  const eligibleKickers = picks
    .filter((p) => !goalkeeperNames.has(p.name))
    .sort((a, b) => b.rating - a.rating);
  const fullPool = eligibleKickers.length > 0 ? eligibleKickers : picks;
  const initialKickers = fullPool.slice(0, 5).map((p) => p.name);
  const reserveKickers = fullPool.slice(5).map((p) => p.name);

  const rivalPlayers = rival.players ?? [];
  const rivalGk = rivalPlayers.find((p) => p.position_1 === "GOALKEEPER");
  const rivalGkRating = rivalGk?.rating ?? rival.rating;
  const userGkRating = picks.find((p) => goalkeeperNames.has(p.name))?.rating ?? 50;

  const rivalKickers = rivalPlayers
    .filter((p) => p.position_1 !== "GOALKEEPER")
    .sort((a, b) => b.rating - a.rating)
    .map((p) => p.name);
  const rivalFullPool = rivalKickers.length > 0 ? rivalKickers : [rival.club];
  const rivalInitial = rivalFullPool.slice(0, 5);
  const rivalReserve = rivalFullPool.slice(5);

  const kicks: import("@/types").PenaltyKick[] = [];
  let userScore = 0, rivalScore = 0, round = 0;
  let isSuddenDeath = false;
  let userIdx = 0, rivalIdx = 0, userReserveIdx = 0, rivalReserveIdx = 0;
  let userCycle = 0, rivalCycle = 0;

  const nextUser = (): string => {
    if (userIdx < initialKickers.length) return initialKickers[userIdx++];
    if (userReserveIdx < reserveKickers.length) return reserveKickers[userReserveIdx++];
    return initialKickers[userCycle++ % initialKickers.length];
  };
  const nextRival = (): string => {
    if (rivalIdx < rivalInitial.length) return rivalInitial[rivalIdx++];
    if (rivalReserveIdx < rivalReserve.length) return rivalReserve[rivalReserveIdx++];
    return rivalInitial[rivalCycle++ % rivalInitial.length];
  };

  while (true) {
    const uName = nextUser();
    const uRating = picks.find((p) => p.name === uName)?.rating ?? 50;
    const uProb = Math.min(0.99, 0.75 + (uRating - rivalGkRating) / 200);
    const uScored = rng.next() < uProb;
    if (uScored) userScore++;
    kicks.push({ round: round + 1, shooter: uName, shooterTeam: "user", scored: uScored, isSuddenDeath });

    const rName = nextRival();
    const rRating = rivalPlayers.find((p) => p.name === rName)?.rating ?? 50;
    const rProb = Math.min(0.99, 0.75 + (rRating - userGkRating) / 200);
    const rScored = rng.next() < rProb;
    if (rScored) rivalScore++;
    kicks.push({ round: round + 1, shooter: rName, shooterTeam: "rival", scored: rScored, isSuddenDeath });

    round++;
    if (!isSuddenDeath) {
      const remaining = 5 - round;
      if (Math.abs(userScore - rivalScore) > remaining) break;
      if (round >= 5) {
        if (userScore !== rivalScore) break;
        isSuddenDeath = true;
      }
    } else if (isSuddenDeath && uScored !== rScored) break;
  }
  return { userScore, rivalScore, kicks };
}

export function simulate(input: SimulationInput): SimulationResult {
  const { picks, overall, rival, round, goalkeeperNames } = input;
  const edge = overall - rival.rating;
  const { defOvr, midOvr, atkOvr } = computeLineAverages(picks);
  const rivalLines = computeRivalLines(rival);
  const atkEdge = atkOvr - rivalLines.def;

  const rngSeed = input.seed ?? Date.now();
  const rng = new SeededRNG(rngSeed);

  const config: MatchConfig = {
    edge, atkEdge, rivalLines, defOvr, midOvr,
    isET: false, picks, rival, goalkeeperNames,
  };

  const regular = runMatch(90, 0, { momentum: 0, cooldownTicks: 0 }, config, rng);

  const regularUserGoals = scoreFromAttacks(regular.attacks, "user");
  const regularRivalGoals = scoreFromAttacks(regular.attacks, "rival");

  let totalMinutes = 90;
  let allAttacks = [...regular.attacks];
  let allEvents = [...regular.events];

  if (regularUserGoals === regularRivalGoals) {
    totalMinutes = 120;
    const etConfig: MatchConfig = { ...config, isET: true };
    const extra = runMatch(30, 90, regular.finalState, etConfig, rng);
    allAttacks.push(...extra.attacks);
    allEvents.push(...extra.events);

    const etUserGoals = scoreFromAttacks(allAttacks, "user");
    const etRivalGoals = scoreFromAttacks(allAttacks, "rival");

    if (etUserGoals === etRivalGoals) {
      totalMinutes = 140;
      const pkResult = simulatePenalties(picks, rival, goalkeeperNames, rng);
      allEvents.push({ minute: 121, text: "¡Comienza la tanda de penales!", side: "neutral" });
      for (let i = 0; i < pkResult.kicks.length; i++) {
        const k = pkResult.kicks[i];
        allEvents.push({
          minute: 122 + i,
          text: k.scored ? `¡GOL de ${k.shooter}!` : `${k.shooter} falla el penal`,
          side: k.shooterTeam,
          goal: k.scored,
        });
      }
      const won = pkResult.userScore > pkResult.rivalScore;
      allEvents.push({
        minute: 121 + pkResult.kicks.length + 1,
        text: won ? "¡ARGENRETRO gana por penales!" : `Se terminó. ${rival.club} gana por penales.`,
        side: won ? "user" : "rival",
      });
      const scorers = allAttacks
        .filter((a) => a.outcome === "goal" && a.side === "user")
        .map((a) => a.scorer ?? "Gol en contra");
      const userShots = allAttacks.filter((a) => a.side === "user" && a.outcome !== "build_up_broken").length;
      const rivalShots = allAttacks.filter((a) => a.side === "rival" && a.outcome !== "build_up_broken").length;
      const totalShots = userShots + rivalShots;
      const possession = totalShots > 0 ? Math.round((userShots / totalShots) * 100) : 50;

      const match: Match = {
        round,
        rival: `${rival.club} ${rival.year}`,
        rivalRating: rival.rating,
        userGoals: etUserGoals,
        rivalGoals: etRivalGoals,
        scorers,
        possession,
        shots: userShots,
        won,
        extraTime: true,
        penalties: true,
        penaltyScore: [pkResult.userScore, pkResult.rivalScore],
      };

      return { match, events: allEvents, seed: rngSeed, penaltyKicks: pkResult.kicks, totalMinutes };
    }

    const won = etUserGoals > etRivalGoals;
    const scorers = allAttacks
      .filter((a) => a.outcome === "goal" && a.side === "user")
      .map((a) => a.scorer ?? "Gol en contra");

    const userShots = allAttacks.filter((a) => a.side === "user" && a.outcome !== "build_up_broken").length;
    const rivalShots = allAttacks.filter((a) => a.side === "rival" && a.outcome !== "build_up_broken").length;
    const totalShots = userShots + rivalShots;
    const possession = totalShots > 0 ? Math.round((userShots / totalShots) * 100) : 50;

    const match: Match = {
      round,
      rival: `${rival.club} ${rival.year}`,
      rivalRating: rival.rating,
      userGoals: etUserGoals,
      rivalGoals: etRivalGoals,
      scorers,
      possession,
      shots: userShots,
      won,
      extraTime: true,
    };

    return { match, events: allEvents, seed: rngSeed, totalMinutes };
  }

  const won = regularUserGoals > regularRivalGoals;
  const scorers = allAttacks
    .filter((a) => a.outcome === "goal" && a.side === "user")
    .map((a) => a.scorer ?? "Gol en contra");

  const userShots = allAttacks.filter((a) => a.side === "user" && a.outcome !== "build_up_broken").length;
  const rivalShots = allAttacks.filter((a) => a.side === "rival" && a.outcome !== "build_up_broken").length;
  const totalShots = userShots + rivalShots;
  const possession = totalShots > 0 ? Math.round((userShots / totalShots) * 100) : 50;

  const match: Match = {
    round,
    rival: `${rival.club} ${rival.year}`,
    rivalRating: rival.rating,
    userGoals: regularUserGoals,
    rivalGoals: regularRivalGoals,
    scorers,
    possession,
    shots: userShots,
    won,
  };

  return { match, events: allEvents, seed: rngSeed, totalMinutes };
}
