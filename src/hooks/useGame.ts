import { useState, useEffect, useRef, useCallback } from "react";
import { getTeamsWithPlayers } from "@/lib/api/teams";
import { getFormationById, buildSlotPositionMap } from "@/lib/formations";
import { simulate as simulateMatch } from "@/lib/matchEngine";
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
  const [rerollsLeft, setRerollsLeft] = useState(3);
  const liveStartedAt = useRef(0);
  const penaltyStepRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
        if (game.rerollsLeft !== undefined) setRerollsLeft(game.rerollsLeft);
      } catch {
        window.localStorage.removeItem(SAVE_KEY);
      }
    }
    setLoaded(true);
  }, [teams]);

  useEffect(() => {
    if (!loaded || !formationId) return;
    window.localStorage.setItem(SAVE_KEY, JSON.stringify({ picks, round, matches, phase, pendingPlayer, formationId, gameMode, rerollsLeft } satisfies SavedGame));
  }, [loaded, matches, phase, picks, pendingPlayer, round, formationId, gameMode, rerollsLeft]);

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

  const roll = (isReroll = false) => {
    if (rolling || !teams.length) return;
    if (isReroll && rerollsLeft <= 0) return;
    setRolling(true);
    setDrawn(null);
    if (isReroll) setRerollsLeft((r) => r - 1);
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

  const endMatch = useCallback((match: Match) => {
    setMatches((value) => [...value, match]);
    if (!match.won) {
      setPhase("lost");
      rankingRef.current?.(overall);
    } else if (round === 3) {
      setPhase("champion");
      rankingRef.current?.(overall);
    } else {
      setPhase("result");
    }
  }, [round, overall]);

  const simulate = () => {
    const rival = randomTeam();
    const result = simulateMatch({
      picks,
      overall,
      rival,
      round: rounds[round],
      goalkeeperNames,
    });
    setLiveMinute(1);
    setLiveMatch(result);
    setPhase("live");
  };

  useEffect(() => {
    if (phase !== "live" || !liveMatch) return;
    liveStartedAt.current = Date.now();
    const hasPenalties = liveMatch.match.penalties ?? false;
    const hasET = liveMatch.match.extraTime ?? false;
    const totalMinutes = hasPenalties ? 120 : hasET ? 120 : 90;
    const realDuration = hasPenalties ? 34000 : hasET ? 34000 : 20000;

    const timer = window.setInterval(() => {
      const minute = Math.min(totalMinutes, Math.floor((Date.now() - liveStartedAt.current) / realDuration * totalMinutes));
      setLiveMinute(minute);
      if (minute < totalMinutes) return;
      window.clearInterval(timer);

      if (liveMatch.match.penalties) {
        let idx = 0;
        const pkEvents = liveMatch.events.filter((e) => e.minute > 120);
        const step = () => {
          if (idx >= pkEvents.length) {
            endMatch(liveMatch.match);
            return;
          }
          setLiveMinute(121 + idx);
          idx++;
          penaltyStepRef.current = setTimeout(step, 2200);
        };
        step();
      } else {
        endMatch(liveMatch.match);
      }
    }, 100);
    return () => {
      window.clearInterval(timer);
      if (penaltyStepRef.current) clearTimeout(penaltyStepRef.current);
    };
  }, [phase, liveMatch, endMatch]);

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
    setRerollsLeft(3);
    window.localStorage.removeItem(SAVE_KEY);
  };

  const share = async () => {
    const text = `Mi ARGENRETRO tiene ${overall} de valoración. ¿Podés superarlo?`;
    if (navigator.share) {
      await navigator.share({ title: "ARGENRETRO", text, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(`${text} ${window.location.href}`);
    }
  };

  const lastMatch = matches[matches.length - 1];

  return {
    teamsLoaded,
    picks, round, phase, drawn, rolling, replaceIndex, loaded,
    liveMinute, liveMatch, selectedSlot, pendingPlayer, formation, formationId, gameMode, rerollsLeft,
    overall, usedPlayers, usedTeams, availableSlots, lastMatch,
    rounds, positions, positionLabels, fieldSpots, slotPositionMap,
    setReplaceIndex, setSelectedSlot, setPendingPlayer, setDrawn,
    setPhase, setRolling, setPicks, setFormationId,
    roll, choose, placePlayer, simulate, continueRound, reset, share,
    selectFormation, setSaveRanking,
  };
}
