import { useState, useEffect, useRef, useCallback } from "react";
import { getTeamsWithPlayers } from "@/lib/api/teams";
import type { HistoricTeam, Pick, Match, LiveMatch, LiveEvent, Phase, SavedGame } from "@/types";

const SAVE_KEY = "argenretro-xi-save";
const USER_KEY = "argenretro-xi-user";

const rounds = ["Octavos", "Cuartos", "Semifinal", "Final"];

const positions = ["ARQ", "LD", "DFC", "DFC", "LI", "MCD", "MC", "MC", "ED", "DC", "EI"];
const positionLabels = [
  "Arquero", "Lateral derecho", "Central derecho", "Central izquierdo", "Lateral izquierdo",
  "Mediocentro defensivo", "Volante derecho", "Volante izquierdo", "Extremo derecho", "Delantero centro", "Extremo izquierdo",
];
const fieldSpots = [
  "top-[88%] left-1/2", "top-[69%] left-[82%]", "top-[74%] left-[61%]", "top-[74%] left-[39%]",
  "top-[69%] left-[18%]", "top-[54%] left-1/2", "top-[43%] left-[72%]", "top-[43%] left-[28%]",
  "top-[23%] left-[79%]", "top-[14%] left-1/2", "top-[23%] left-[21%]",
];

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
  const [username, setUsername] = useState("");
  const [showIntro, setShowIntro] = useState(true);
  const liveStartedAt = useRef(0);
  const rankingRef = useRef<((score: number) => void) | null>(null);

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
    const user = window.localStorage.getItem(USER_KEY);
    if (user) setUsername(user);
    if (saved) {
      try {
        const game = JSON.parse(saved) as SavedGame;
        setPicks(game.picks.map((pick, index) => ({ ...pick, slot: pick.slot ?? index })));
        setRound(game.round);
        setMatches(game.matches);
        setPhase(game.phase === "live" ? "ready" : game.phase);
        setShowIntro(false);
      } catch {
        window.localStorage.removeItem(SAVE_KEY);
      }
    }
    setLoaded(true);
  }, [teams]);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(SAVE_KEY, JSON.stringify({ picks, round, matches, phase } satisfies SavedGame));
  }, [loaded, matches, phase, picks, round]);

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

  const roll = () => {
    if (rolling || !teams.length) return;
    setRolling(true);
    setDrawn(null);
    window.setTimeout(() => {
      setDrawn(randomTeam(phase === "build" ? usedTeams : []));
      setRolling(false);
    }, 850);
  };

  const choose = (name: string, rating: number) => {
    if (!drawn || usedPlayers.includes(name)) return;
    const slot = replaceIndex ?? selectedSlot;
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

  const simulate = () => {
    const rival = randomTeam();
    const edge = overall - rival.rating;
    const userGoals = Math.max(0, Math.min(5, Math.floor(Math.random() * 3 + (edge + 8) / 14)));
    let rivalGoals = Math.max(0, Math.min(5, Math.floor(Math.random() * 3 + (-edge + 8) / 14)));
    if (userGoals === rivalGoals) rivalGoals += Math.random() < 0.58 + edge / 100 ? -1 : 1;
    rivalGoals = Math.max(0, rivalGoals);
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

  const continueRound = (change: boolean) => {
    setRound((value) => value + 1);
    setPhase(change ? "upgrade" : "ready");
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

  const startGame = () => {
    if (username.trim()) window.localStorage.setItem(USER_KEY, username.trim());
    setShowIntro(false);
  };

  const lastMatch = matches[matches.length - 1];

  return {
    teamsLoaded,
    picks, round, phase, drawn, rolling, replaceIndex, loaded,
    liveMinute, liveMatch, selectedSlot, username, showIntro,
    overall, usedPlayers, usedTeams, availableSlots, lastMatch,
    rounds, positions, positionLabels, fieldSpots,
    setReplaceIndex, setSelectedSlot, setUsername, setDrawn,
    setPhase, setShowIntro, setRolling, setPicks,
    roll, choose, simulate, continueRound, reset, share, startGame,
    setSaveRanking,
  };
}
