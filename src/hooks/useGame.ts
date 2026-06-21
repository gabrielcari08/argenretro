import { useState, useEffect, useRef, useCallback } from "react";
import { getTeamsWithPlayers } from "@/lib/api/teams";
import { getFormationById, buildSlotPositionMap } from "@/lib/formations";
import type { HistoricTeam, Pick, Match, LiveMatch, LiveEvent, Phase, SavedGame, PendingPlayer, ValidPosition, GameMode } from "@/types";

const SAVE_KEY = "argenretro-xi-save";

const rounds = ["Octavos", "Cuartos", "Semifinal", "Final"];

export function useGame() {
  const [teams, setTeams] = useState<HistoricTeam[]>([]);
  const [teamsLoaded, setTeamsLoaded] = useState(false);
  const [picks, setPicks] = useState<Pick[]>([]);
  const [round, setRound] = useState(0);
  const [matches, setMatches] = useState<Match[]>([]);
  const [phase, setPhase] = useState<Phase>("build");
  const [drawn, setDrawn] = useState<HistoricTeam | null>(null);
  const [rolling, setRolling] = useState(false);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [liveMinute, setLiveMinute] = useState(0);
  const [liveMatch, setLiveMatch] = useState<LiveMatch | null>(null);
  const [selectedSlot, setSelectedSlot] = useState(0);
  const [pendingPlayer, setPendingPlayer] = useState<PendingPlayer | null>(null);
  const [formationId, setFormationId] = useState<string | null>(null);
  const [gameMode, setGameMode] = useState<GameMode>("ayudin");
  const liveStartedAt = useRef(0);
  const rankingRef = useRef<((score: number) => void) | null>(null);

  const formation = formationId ? getFormationById(formationId) ?? null : null;
  const positions = formation ? formation.slots.map((s) => s.code) : [];
  const positionLabels = formation ? formation.slots.map((s) => s.label) : [];
  const fieldSpots = formation ? formation.slots.map((s) => s.fieldSpot) : [];
  const slotPositionMap: Record<ValidPosition, number[]> = formation
    ? buildSlotPositionMap(formation)
    : {} as Record<ValidPosition, number[]>;

  useEffect(() => {
    getTeamsWithPlayers().then((data) => {
      setTeams(data);
      setTeamsLoaded(true);
    });
  }, []);

  const goalkeeperNames = new Set(
    teams.flatMap((team) => {
      const first = team.players?.[0];
      return first?.position_1 === "GOALKEEPER" ? [first.name] : [];
    }),
  );

  useEffect(() => {
    if (!teams.length) return;
    const saved = window.localStorage.getItem(SAVE_KEY);
    if (saved) {
      try {
        const game = JSON.parse(saved) as SavedGame;
        setPicks(game.picks.map((pick, index) => ({ ...pick, slot: pick.slot ?? index })));
        setRound(game.round);
        setMatches(game.matches);
        const loadedPhase = game.phase === "live" ? "ready" : game.phase;
        setPhase(loadedPhase === "positioning" ? "build" : loadedPhase);
        if (game.pendingPlayer) setPendingPlayer(game.pendingPlayer);
        if (game.formationId) setFormationId(game.formationId);
        if (game.gameMode) setGameMode(game.gameMode);
      } catch {
        window.localStorage.removeItem(SAVE_KEY);
      }
    }
    setLoaded(true);
  }, [teams]);

  useEffect(() => {
    if (!loaded || !formationId) return;
    window.localStorage.setItem(SAVE_KEY, JSON.stringify({ picks, round, matches, phase, pendingPlayer, formationId, gameMode } satisfies SavedGame));
  }, [loaded, matches, phase, picks, pendingPlayer, round, formationId, gameMode]);

  const overall = picks.length ? Math.round(picks.reduce((sum, pick) => sum + pick.rating, 0) / picks.length) : 0;

  const usedPlayers = picks.map((pick) => pick.name);
  const usedTeams = picks.map((pick) => pick.teamId);
  const availableSlots = positions.map((position, slot) => ({ position, slot, label: positionLabels[slot] })).filter(({ slot }) => !picks.some((pick) => pick.slot === slot));

  const setSaveRanking = useCallback((fn: (score: number) => void) => {
    rankingRef.current = fn;
  }, []);

  const randomTeam = (excluded: number[] = []) => {
    const pool = teams.filter((team) => !excluded.includes(team.id));
    return pool[Math.floor(Math.random() * pool.length)] ?? teams[0];
  };

  const selectFormation = (id: string, mode: GameMode) => {
    setFormationId(id);
    setGameMode(mode);
    setPhase("build");
  };

  const roll = () => {
    if (rolling || !teams.length) return;
    setRolling(true);
    setDrawn(null);
    window.setTimeout(() => {
      setDrawn(randomTeam(phase === "build" || phase === "positioning" ? usedTeams : []));
      setRolling(false);
    }, 850);
  };

  const choose = (name: string, rating: number, slotOverride?: number) => {
    if (!drawn || usedPlayers.includes(name) || !positions.length) return;
    const slot = slotOverride ?? replaceIndex ?? selectedSlot;
    if (replaceIndex === null && !availableSlots.some((item) => item.slot === slot)) return;
    const next: Pick = {
      name, rating, teamId: drawn.id, club: drawn.club, year: drawn.year,
      abbr: drawn.abbr, position: positions[slot], slot,
    };
    if (replaceIndex !== null) {
      setPicks((current) => current.map((pick, index) => index === replaceIndex ? next : pick));
      setReplaceIndex(null);
      setDrawn(null);
      setPhase("ready");
      return;
    }
    setPicks((current) => {
      const value = [...current, next];
      const nextSlot = positions.findIndex((_, index) => !value.some((pick) => pick.slot === index));
      if (nextSlot >= 0) setSelectedSlot(nextSlot);
      if (value.length === 11) setPhase("ready");
      return value;
    });
    setDrawn(null);
  };

  const placePlayer = (slot: number) => {
    if (!pendingPlayer || !positions.length) return;
    if (!availableSlots.some((item) => item.slot === slot)) return;
    const next: Pick = {
      name: pendingPlayer.name,
      rating: pendingPlayer.rating,
      teamId: pendingPlayer.teamId,
      club: pendingPlayer.club,
      year: pendingPlayer.year,
      abbr: pendingPlayer.abbr,
      position: positions[slot],
      slot,
    };
    setPicks((current) => {
      const value = [...current, next];
      const nextSlot = positions.findIndex((_, index) => !value.some((pick) => pick.slot === index));
      if (nextSlot >= 0) setSelectedSlot(nextSlot);
      if (value.length === 11) setPhase("ready");
      else setPhase("build");
      return value;
    });
    setPendingPlayer(null);
    setDrawn(null);
  };

  const simulate = () => {
    const rival = randomTeam();
    const edge = overall - rival.rating;

    const userExpected = 1.25 + edge * 0.04;
    const rivalExpected = 1.25 - edge * 0.04;

    let userGoals = Math.max(0, Math.min(4, Math.round(userExpected + (Math.random() * 1.6 - 0.8))));
    let rivalGoals = Math.max(0, Math.min(4, Math.round(rivalExpected + (Math.random() * 1.6 - 0.8))));

    if (userGoals >= 3 && rivalGoals >= 3) {
      if (userGoals > rivalGoals) rivalGoals = 2;
      else userGoals = Math.min(userGoals, 2);
    }

    if (userGoals === rivalGoals) {
      if (edge > 3) rivalGoals = Math.max(0, rivalGoals - 1);
      else if (edge < -3) userGoals = Math.max(0, userGoals - 1);
      else {
        if (Math.random() < 0.52 + edge * 0.003) rivalGoals = Math.max(0, rivalGoals - 1);
        else userGoals = Math.max(0, userGoals - 1);
      }
    }
    const won = userGoals > rivalGoals;
    const eligibleScorers = picks.filter((pick) => !goalkeeperNames.has(pick.name));
    const scorers = Array.from({ length: userGoals }, (_, index) =>
      eligibleScorers[(index * 3 + Math.floor(Math.random() * eligibleScorers.length)) % eligibleScorers.length]?.name ?? "Gol en contra",
    );
    const match: Match = {
      round: rounds[round], rival: `${rival.club} ${rival.year}`, rivalRating: rival.rating,
      userGoals, rivalGoals, scorers,
      possession: Math.max(38, Math.min(64, 51 + edge + Math.floor(Math.random() * 7) - 3)),
      shots: 7 + userGoals * 2 + Math.floor(Math.random() * 6), won,
    };
    const goalMinutes = Array.from({ length: userGoals + rivalGoals }, (_, index) =>
      8 + Math.floor((index + 1) * 78 / (userGoals + rivalGoals + 1)) + Math.floor(Math.random() * 7) - 3,
    ).sort((a, b) => a - b);
    const events: LiveEvent[] = [
      { minute: 1, text: "¡Rueda la pelota! Comienza el partido.", side: "neutral" },
      { minute: 12, text: `${rival.club} avisa con un remate desde afuera.`, side: "rival" },
      { minute: 29, text: `${picks[6]?.name ?? "El mediocampo"} maneja los tiempos del XI.`, side: "user" },
      { minute: 45, text: "Final del primer tiempo.", side: "neutral" },
      { minute: 57, text: "Gran atajada para sostener el resultado.", side: "neutral" },
      { minute: 72, text: "El partido entra en su tramo decisivo.", side: "neutral" },
      { minute: 90, text: "¡Final del partido!", side: "neutral" },
    ];
    let userIndex = 0;
    let rivalIndex = 0;
    goalMinutes.forEach((minute, index) => {
      const userGoal = index < userGoals;
      const rivalScorers = rival.players?.slice(1) ?? [];
      const rivalName = rivalScorers[rivalIndex++ % rivalScorers.length]?.name;
      const scorer = userGoal ? scorers[userIndex++] : rivalName ?? rival.club;
      events.push({ minute, text: `¡GOL de ${scorer}!`, side: userGoal ? "user" : "rival", goal: true });
    });
    setLiveMinute(0);
    setLiveMatch({ match, events: events.sort((a, b) => a.minute - b.minute) });
    setPhase("live");
  };

  useEffect(() => {
    if (phase !== "live" || !liveMatch) return;
    liveStartedAt.current = Date.now();
    const timer = window.setInterval(() => {
      const minute = Math.min(90, Math.floor((Date.now() - liveStartedAt.current) / 20000 * 90));
      setLiveMinute(minute);
      if (minute < 90) return;
      window.clearInterval(timer);
      setMatches((value) => [...value, liveMatch.match]);
      if (!liveMatch.match.won) {
        setPhase("lost");
        rankingRef.current?.(overall);
      } else if (round === 3) {
        setPhase("champion");
        rankingRef.current?.(overall);
      } else {
        setPhase("result");
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, [phase, liveMatch, round, overall]);

  const continueRound = (_change: boolean) => {
    setRound((value) => value + 1);
    setPhase("ready");
    setDrawn(null);
  };

  const reset = () => {
    setPicks([]);
    setRound(0);
    setMatches([]);
    setPhase("build");
    setDrawn(null);
    setReplaceIndex(null);
    setSelectedSlot(0);
    setPendingPlayer(null);
    setFormationId(null);
    window.localStorage.removeItem(SAVE_KEY);
  };

  const share = async () => {
    const text = `Mi ARGENRETRO XI tiene ${overall} de valoración. ¿Podés superarlo?`;
    if (navigator.share) {
      await navigator.share({ title: "ARGENRETRO XI", text, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(`${text} ${window.location.href}`);
    }
  };

  const lastMatch = matches[matches.length - 1];

  return {
    teamsLoaded,
    picks, round, phase, drawn, rolling, replaceIndex, loaded,
    liveMinute, liveMatch, selectedSlot, pendingPlayer, formation, formationId, gameMode,
    overall, usedPlayers, usedTeams, availableSlots, lastMatch,
    rounds, positions, positionLabels, fieldSpots, slotPositionMap,
    setReplaceIndex, setSelectedSlot, setPendingPlayer, setDrawn,
    setPhase, setRolling, setPicks, setFormationId,
    roll, choose, placePlayer, simulate, continueRound, reset, share,
    selectFormation, setSaveRanking,
  };
}
