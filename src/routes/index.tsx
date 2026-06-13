import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Check, ChevronRight, CircleDot, Dice5, Radio, RotateCcw, Share2, Shield, Sparkles, Swords, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import teamsData from "@/data/historic-teams.json";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "ARGENRETRO XI | Torneo histórico argentino" },
    { name: "description", content: "Armá tu XI con cracks históricos y conquistá el torneo de eliminación directa de ARGENRETRO XI." },
    { property: "og:title", content: "ARGENRETRO XI" },
    { property: "og:description", content: "El torneo definitivo de equipos históricos del fútbol argentino." },
  ] }),
  component: Index,
});

type HistoricTeam = { id: string; club: string; year: number; abbr: string; rating: number; players: [string, number][] };
type Pick = { name: string; rating: number; teamId: string; club: string; year: number; abbr: string; position: string; slot: number };
type Match = { round: string; rival: string; rivalRating: number; userGoals: number; rivalGoals: number; scorers: string[]; possession: number; shots: number; won: boolean };
type LiveEvent = { minute: number; text: string; side: "user" | "rival" | "neutral"; goal?: boolean };
type LiveMatch = { match: Match; events: LiveEvent[] };
type SavedGame = { picks: Pick[]; round: number; matches: Match[]; phase: Phase };
type Phase = "build" | "ready" | "live" | "result" | "upgrade" | "lost" | "champion";

const teams = teamsData as HistoricTeam[];
const rounds = ["Octavos", "Cuartos", "Semifinal", "Final"];
const positions = ["ARQ", "LD", "DFC", "DFC", "LI", "MCD", "MC", "MC", "ED", "DC", "EI"];
const positionLabels = ["Arquero", "Lateral derecho", "Central derecho", "Central izquierdo", "Lateral izquierdo", "Mediocentro defensivo", "Volante derecho", "Volante izquierdo", "Extremo derecho", "Delantero centro", "Extremo izquierdo"];
const fieldSpots = ["top-[88%] left-1/2", "top-[69%] left-[82%]", "top-[74%] left-[61%]", "top-[74%] left-[39%]", "top-[69%] left-[18%]", "top-[54%] left-1/2", "top-[43%] left-[72%]", "top-[43%] left-[28%]", "top-[23%] left-[79%]", "top-[14%] left-1/2", "top-[23%] left-[21%]"];
const goalkeeperNames = new Set(teams.map((team) => team.players[0]?.[0]).filter((name): name is string => Boolean(name)));
const SAVE_KEY = "argenretro-xi-save";
const RANK_KEY = "argenretro-xi-ranking";

const randomTeam = (excluded: string[] = []) => {
  const pool = teams.filter((team) => !excluded.includes(team.id));
  return pool[Math.floor(Math.random() * pool.length)] ?? teams[0];
};

function Crest({ team, large = false }: { team: HistoricTeam; large?: boolean }) {
  return <div className={`crest grid place-items-center bg-primary text-primary-foreground shadow-lg ${large ? "h-24 w-20 text-xl" : "h-12 w-10 text-[10px]"}`}><span className="font-black">{team.abbr}</span><small className="text-[8px] font-bold">{team.year}</small></div>;
}

function Index() {
  const [picks, setPicks] = useState<Pick[]>([]);
  const [round, setRound] = useState(0);
  const [matches, setMatches] = useState<Match[]>([]);
  const [phase, setPhase] = useState<Phase>("build");
  const [drawn, setDrawn] = useState<HistoricTeam | null>(null);
  const [rolling, setRolling] = useState(false);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);
  const [ranking, setRanking] = useState<number[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [liveMinute, setLiveMinute] = useState(0);
  const [liveMatch, setLiveMatch] = useState<LiveMatch | null>(null);
  const [selectedSlot, setSelectedSlot] = useState(0);
  const liveStartedAt = useRef(0);

  useEffect(() => {
    const saved = window.localStorage.getItem(SAVE_KEY);
    const scores = window.localStorage.getItem(RANK_KEY);
    if (saved) { try { const game = JSON.parse(saved) as SavedGame; setPicks(game.picks.map((pick, index) => ({ ...pick, slot: pick.slot ?? index }))); setRound(game.round); setMatches(game.matches); setPhase(game.phase === "live" ? "ready" : game.phase); } catch { window.localStorage.removeItem(SAVE_KEY); } }
    if (scores) { try { setRanking(JSON.parse(scores) as number[]); } catch { window.localStorage.removeItem(RANK_KEY); } }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(SAVE_KEY, JSON.stringify({ picks, round, matches, phase } satisfies SavedGame));
  }, [loaded, matches, phase, picks, round]);

  useEffect(() => {
    if (phase !== "live" || !liveMatch) return;
    liveStartedAt.current = Date.now();
    const timer = window.setInterval(() => {
      const minute = Math.min(90, Math.floor((Date.now() - liveStartedAt.current) / 20000 * 90));
      setLiveMinute(minute);
      if (minute < 90) return;
      window.clearInterval(timer);
      setMatches((value) => [...value, liveMatch.match]);
      if (!liveMatch.match.won) { setPhase("lost"); saveRanking(overall); }
      else if (round === 3) { setPhase("champion"); saveRanking(overall); }
      else setPhase("result");
    }, 100);
    return () => window.clearInterval(timer);
  }, [phase, liveMatch]);

  const overall = picks.length ? Math.round(picks.reduce((sum, pick) => sum + pick.rating, 0) / picks.length) : 0;
  const usedPlayers = picks.map((pick) => pick.name);
  const usedTeams = picks.map((pick) => pick.teamId);
  const availableSlots = positions.map((position, slot) => ({ position, slot, label: positionLabels[slot] })).filter(({ slot }) => !picks.some((pick) => pick.slot === slot));

  const roll = () => {
    if (rolling) return;
    setRolling(true); setDrawn(null);
    window.setTimeout(() => { setDrawn(randomTeam(phase === "build" ? usedTeams : [])); setRolling(false); }, 850);
  };

  const choose = (name: string, rating: number) => {
    if (!drawn || usedPlayers.includes(name)) return;
    const slot = replaceIndex ?? selectedSlot;
    if (replaceIndex === null && !availableSlots.some((item) => item.slot === slot)) return;
    const next: Pick = { name, rating, teamId: drawn.id, club: drawn.club, year: drawn.year, abbr: drawn.abbr, position: positions[slot], slot };
    if (replaceIndex !== null) {
      setPicks((current) => current.map((pick, index) => index === replaceIndex ? next : pick));
      setReplaceIndex(null); setDrawn(null); setPhase("ready"); return;
    }
    setPicks((current) => { const value = [...current, next]; const nextSlot = positions.findIndex((_, index) => !value.some((pick) => pick.slot === index)); if (nextSlot >= 0) setSelectedSlot(nextSlot); if (value.length === 11) setPhase("ready"); return value; });
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
    const scorers = Array.from({ length: userGoals }, (_, index) => eligibleScorers[(index * 3 + Math.floor(Math.random() * eligibleScorers.length)) % eligibleScorers.length]?.name ?? "Gol en contra");
    const match: Match = { round: rounds[round], rival: `${rival.club} ${rival.year}`, rivalRating: rival.rating, userGoals, rivalGoals, scorers, possession: Math.max(38, Math.min(64, 51 + edge + Math.floor(Math.random() * 7) - 3)), shots: 7 + userGoals * 2 + Math.floor(Math.random() * 6), won };
    const goalMinutes = Array.from({ length: userGoals + rivalGoals }, (_, index) => 8 + Math.floor((index + 1) * 78 / (userGoals + rivalGoals + 1)) + Math.floor(Math.random() * 7) - 3).sort((a, b) => a - b);
    const events: LiveEvent[] = [
      { minute: 1, text: "¡Rueda la pelota! Comienza el partido.", side: "neutral" },
      { minute: 12, text: `${rival.club} avisa con un remate desde afuera.`, side: "rival" },
      { minute: 29, text: `${picks[6]?.name ?? "El mediocampo"} maneja los tiempos del XI.`, side: "user" },
      { minute: 45, text: "Final del primer tiempo.", side: "neutral" },
      { minute: 57, text: `Gran atajada para sostener el resultado.`, side: "neutral" },
      { minute: 72, text: "El partido entra en su tramo decisivo.", side: "neutral" },
      { minute: 90, text: "¡Final del partido!", side: "neutral" },
    ];
    let userIndex = 0; let rivalIndex = 0;
    goalMinutes.forEach((minute, index) => {
      const userGoal = index < userGoals;
      const rivalScorers = rival.players.slice(1);
      const scorer = userGoal ? scorers[userIndex++] : rivalScorers[rivalIndex++ % rivalScorers.length]?.[0] ?? rival.club;
      events.push({ minute, text: `¡GOL de ${scorer}!`, side: userGoal ? "user" : "rival", goal: true });
    });
    setLiveMinute(0); setLiveMatch({ match, events: events.sort((a, b) => a.minute - b.minute) }); setPhase("live");
  };

  const saveRanking = (score: number) => {
    const next = [...ranking, score].sort((a, b) => b - a).slice(0, 5);
    setRanking(next); window.localStorage.setItem(RANK_KEY, JSON.stringify(next));
  };

  const continueRound = (change: boolean) => { setRound((value) => value + 1); setPhase(change ? "upgrade" : "ready"); setDrawn(null); };
  const reset = () => { setPicks([]); setRound(0); setMatches([]); setPhase("build"); setDrawn(null); setReplaceIndex(null); setSelectedSlot(0); window.localStorage.removeItem(SAVE_KEY); };
  const share = async () => { const text = `Mi ARGENRETRO XI tiene ${overall} de valoración. ¿Podés superarlo?`; if (navigator.share) await navigator.share({ title: "ARGENRETRO XI", text, url: window.location.href }); else await navigator.clipboard.writeText(`${text} ${window.location.href}`); };
  const lastMatch = matches[matches.length - 1];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-3 sm:px-7">
          <div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-secondary text-secondary-foreground"><Shield /></div><div><p className="display-type text-2xl leading-none tracking-wider">ARGEN<span className="text-secondary">RETRO</span> XI</p><p className="text-[9px] font-black uppercase tracking-[.28em] text-muted-foreground">La historia juega de nuevo</p></div></div>
          <div className="hidden items-center gap-2 md:flex">{rounds.map((name, index) => <div key={name} className={`rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-wider ${index < round ? "border-primary bg-primary text-primary-foreground" : index === round ? "border-secondary text-secondary" : "border-border text-muted-foreground"}`}>{index < round && <Check className="mr-1 inline size-3"/>}{name}</div>)}</div>
          <Button variant="stadium" size="sm" onClick={reset}><RotateCcw/><span className="hidden sm:inline">Nueva partida</span></Button>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] gap-5 p-4 lg:grid-cols-[280px_minmax(390px,1fr)_390px] lg:p-6">
        <aside className="order-2 space-y-4 lg:order-1">
          <section className="rounded-3xl border border-border bg-card p-5"><p className="eyebrow">Torneo nacional</p><h2 className="display-type mt-1 text-4xl tracking-wide">{phase === "champion" ? "CAMPEÓN" : rounds[round]}</h2><div className="mt-5 space-y-3">{rounds.map((name, index) => { const match = matches[index]; return <div key={name} className={`relative border-l-2 pl-4 ${index === round ? "border-secondary" : match?.won ? "border-primary" : "border-border"}`}><p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{name}</p><p className="mt-1 text-sm font-bold">{match ? `XI ${match.userGoals} — ${match.rivalGoals} ${match.rival.split(" ")[0]}` : index === round ? "Próximo cruce" : "Por definir"}</p></div>; })}</div></section>
          <section className="rounded-3xl border border-border bg-card p-5"><p className="eyebrow">Hall de la fama</p><h3 className="mt-1 font-extrabold">Mejores valoraciones</h3><div className="mt-4 space-y-2">{ranking.length ? ranking.map((score, index) => <div key={`${score}-${index}`} className="flex items-center justify-between rounded-xl bg-muted px-3 py-2 text-sm"><span>#{index + 1} Selección retro</span><b className="text-primary">{score}</b></div>) : <p className="text-xs leading-relaxed text-muted-foreground">Terminá una campaña para ingresar al ranking local.</p>}</div></section>
        </aside>

        <section className="order-1 lg:order-2">
          <div className="mb-4 flex items-end justify-between"><div><p className="eyebrow">Tu selección · 4—3—3</p><h1 className="display-type text-4xl tracking-wide sm:text-5xl">EL ONCE DE LA HISTORIA</h1></div><div className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-2 text-center"><p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Media</p><b className="display-type text-3xl text-primary">{overall || "—"}</b></div></div>
          <div className="pitch relative mx-auto aspect-[4/5] w-full max-w-[650px] overflow-hidden rounded-[2rem] border border-pitch-line/30 bg-pitch shadow-2xl">
            <div className="absolute inset-5 rounded-2xl border-2 border-pitch-line/70"><div className="absolute inset-x-0 top-1/2 border-t-2 border-pitch-line/70"/><div className="absolute left-1/2 top-1/2 size-28 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-pitch-line/70"/><div className="absolute left-1/2 top-0 h-20 w-48 -translate-x-1/2 border-x-2 border-b-2 border-pitch-line/70"/><div className="absolute bottom-0 left-1/2 h-20 w-48 -translate-x-1/2 border-x-2 border-t-2 border-pitch-line/70"/></div>
            {positions.map((position, index) => { const pick = picks.find((item) => item.slot === index); const selectable = phase === "upgrade" && Boolean(pick); return <button key={`${position}-${index}`} disabled={!selectable} onClick={() => { setReplaceIndex(index); roll(); }} className={`absolute ${fieldSpots[index]} z-10 w-[88px] -translate-x-1/2 -translate-y-1/2 text-center sm:w-28 ${selectable ? "cursor-pointer" : "cursor-default"}`}><div className={`player-token mx-auto grid size-11 place-items-center rounded-full border-2 text-[10px] font-black shadow-xl sm:size-14 ${pick ? "border-primary bg-foreground text-background" : "border-pitch-line/60 bg-background/25 text-pitch-line"}`}>{pick?.rating ?? position}</div><p className="mt-1 truncate rounded-md bg-background/85 px-1 py-1 text-[9px] font-extrabold backdrop-blur sm:text-[11px]">{pick?.name ?? "VACANTE"}</p>{pick && <p className="text-[8px] font-bold text-pitch-line">{pick.abbr} · {pick.year}</p>}</button>; })}
          </div>
          {phase === "upgrade" && <p className="mt-3 text-center text-xs font-bold text-secondary"><Sparkles className="mr-1 inline size-4"/>Elegí un jugador de la cancha para reemplazarlo</p>}
        </section>

        <aside className="order-3">
          {(phase === "build" || phase === "upgrade") && <DrawPanel drawn={drawn} rolling={rolling} picks={picks} position={positions[replaceIndex ?? selectedSlot]} availableSlots={availableSlots} selectedSlot={replaceIndex ?? selectedSlot} onPositionChange={setSelectedSlot} positionLocked={replaceIndex !== null} onRoll={roll} onChoose={choose} />}
          {phase === "ready" && <MatchPanel round={rounds[round]} overall={overall} onPlay={simulate} />}
          {phase === "live" && liveMatch && <LiveMatchPanel live={liveMatch} minute={liveMinute} />}
          {phase === "result" && lastMatch && <ResultPanel match={lastMatch} onContinue={continueRound} />}
          {(phase === "lost" || phase === "champion") && lastMatch && <EndPanel champion={phase === "champion"} match={lastMatch} overall={overall} onReset={reset} onShare={share} />}
          <section className="mt-4 rounded-3xl border border-border bg-card/70 p-4"><div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest"><span className="text-muted-foreground">Plantel</span><span>{picks.length}/11</span></div><div className="mt-3 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full bg-secondary transition-all" style={{ width: `${picks.length / 11 * 100}%` }}/></div><p className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground"><Check className="size-3 text-primary"/>Partida guardada automáticamente</p></section>
        </aside>
      </div>
    </main>
  );
}

function DrawPanel({ drawn, rolling, picks, position, availableSlots, selectedSlot, onPositionChange, positionLocked, onRoll, onChoose }: { drawn: HistoricTeam | null; rolling: boolean; picks: Pick[]; position: string; availableSlots: { position: string; slot: number; label: string }[]; selectedSlot: number; onPositionChange: (slot: number) => void; positionLocked: boolean; onRoll: () => void; onChoose: (name: string, rating: number) => void }) {
  const positionSelector = <div className="mt-4 text-left"><label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">Posición del jugador</label><Select value={String(selectedSlot)} onValueChange={(value) => onPositionChange(Number(value))} disabled={positionLocked}><SelectTrigger className="h-12 rounded-xl border-secondary/30 bg-background/60 font-bold"><SelectValue /></SelectTrigger><SelectContent>{availableSlots.map(({ position: code, slot, label }) => <SelectItem key={slot} value={String(slot)}>{code} · {label}</SelectItem>)}</SelectContent></Select>{positionLocked && <p className="mt-2 text-[10px] text-muted-foreground">La posición queda fijada durante un reemplazo.</p>}</div>;
  if (!drawn) return <section className="rounded-3xl border border-border bg-card p-6 text-center"><p className="eyebrow">Destino retro</p><h2 className="display-type mt-2 text-4xl tracking-wide">SORTEÁ TU CLUB</h2><p className="mt-2 text-sm text-muted-foreground">Elegí el puesto y sorteá una versión histórica.</p>{positionSelector}<button onClick={onRoll} disabled={rolling} aria-label="Lanzar dado" className="mx-auto mt-6 grid size-36 cursor-pointer place-items-center rounded-[2rem] border border-secondary/40 bg-secondary/10 shadow-[var(--shadow-blue)] transition-transform hover:-translate-y-1 disabled:pointer-events-none"><Dice5 className={`size-20 text-secondary ${rolling ? "animate-dice" : ""}`}/></button><Button variant="legend" size="xl" className="mt-7 w-full" onClick={onRoll} disabled={rolling}>{rolling ? "Girando la historia…" : "Lanzar el dado"}</Button><p className="mt-4 text-[9px] font-bold uppercase tracking-[.2em] text-muted-foreground">32 equipos · épocas irrepetibles</p></section>;
  return <section className="animate-rise overflow-hidden rounded-3xl border border-border bg-card"><div className="relative bg-secondary/10 p-5"><p className="eyebrow">El dado eligió</p><div className="mt-3 flex items-center gap-4"><Crest team={drawn} large/><div><h2 className="display-type text-4xl leading-none tracking-wide">{drawn.club}</h2><p className="mt-1 text-2xl font-black text-secondary">{drawn.year}</p></div></div></div><div className="p-5">{positionSelector}<div className="mb-3 mt-5 flex items-center justify-between"><p className="text-xs font-black uppercase tracking-wider">Elegí para {position}</p><span className="text-xs text-muted-foreground">OVR</span></div><div className="space-y-2">{drawn.players.map(([name, rating]) => { const used = picks.some((pick) => pick.name === name); return <Button key={name} variant="stadium" disabled={used} onClick={() => onChoose(name, rating)} className="h-auto w-full justify-between rounded-xl px-4 py-3"><span className="text-left text-xs font-bold">{name}{used && <small className="block text-[9px] text-muted-foreground">Ya seleccionado</small>}</span><span className="flex items-center gap-2 font-black text-primary">{rating}<ChevronRight className="size-3"/></span></Button>; })}</div><Button variant="ghost" className="mt-3 w-full text-muted-foreground" onClick={onRoll}><Dice5/>Sortear otro</Button></div></section>;
}

function MatchPanel({ round, overall, onPlay }: { round: string; overall: number; onPlay: () => void }) { return <section className="rounded-3xl border border-secondary/30 bg-card p-6 text-center"><Swords className="mx-auto size-12 text-secondary"/><p className="eyebrow mt-4">Equipo completo</p><h2 className="display-type mt-1 text-5xl tracking-wide">{round}</h2><p className="mt-3 text-sm leading-relaxed text-muted-foreground">Tu XI está listo. El rival y el resultado se revelarán al iniciar el partido.</p><div className="my-6 flex items-center justify-center gap-5"><div><p className="display-type text-5xl text-primary">{overall}</p><small>Tu media</small></div><span className="text-muted-foreground">VS</span><div><p className="display-type text-5xl">?</p><small>Rival</small></div></div><Button variant="legend" size="xl" className="w-full" onClick={onPlay}>Jugar partido <ChevronRight/></Button></section>; }

function LiveMatchPanel({ live, minute }: { live: LiveMatch; minute: number }) {
  const visible = live.events.filter((event) => event.minute <= minute);
  const userGoals = visible.filter((event) => event.goal && event.side === "user").length;
  const rivalGoals = visible.filter((event) => event.goal && event.side === "rival").length;
  const current = visible[visible.length - 1];
  return <section className="animate-rise overflow-hidden rounded-3xl border border-secondary/40 bg-card">
    <div className="bg-secondary/10 p-5 text-center">
      <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[.2em] text-secondary"><Radio className="size-3 animate-pulse"/> En vivo · {live.match.round}</div>
      <div className="mt-4 flex items-center justify-center gap-4"><div className="w-24"><b className="display-type text-3xl">ARG XI</b></div><b className="display-type text-6xl text-primary">{userGoals} — {rivalGoals}</b><div className="w-24 text-xs font-extrabold">{live.match.rival}</div></div>
      <div className="mt-3 inline-flex items-center rounded-full bg-background px-4 py-1 font-black text-secondary">{minute}'</div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full bg-secondary transition-[width] duration-100" style={{ width: `${minute / 90 * 100}%` }}/></div>
    </div>
    <div className="p-5">
      <div className={`min-h-24 rounded-2xl border p-4 text-center ${current?.goal ? "animate-goal border-primary bg-primary/10" : "border-border bg-muted/50"}`}>
        {current?.goal ? <CircleDot className="mx-auto mb-2 size-7 text-primary"/> : <Swords className="mx-auto mb-2 size-6 text-muted-foreground"/>}
        <p className="text-xs font-black uppercase tracking-wide">{current?.text ?? "Los equipos salen a la cancha…"}</p>
      </div>
      <div className="mt-4 max-h-52 space-y-2 overflow-y-auto pr-1">
        {[...visible].reverse().map((event, index) => <div key={`${event.minute}-${event.text}`} className={`flex gap-3 rounded-xl px-3 py-2 text-xs ${index === 0 ? "bg-secondary/10" : "bg-muted/40"}`}><b className={event.goal ? "text-primary" : "text-secondary"}>{event.minute}'</b><span className={event.goal ? "font-extrabold" : "text-muted-foreground"}>{event.text}</span></div>)}
      </div>
      <p className="mt-4 text-center text-[9px] font-bold uppercase tracking-[.18em] text-muted-foreground">90 minutos resumidos en 20 segundos</p>
    </div>
  </section>;
}

function ResultPanel({ match, onContinue }: { match: Match; onContinue: (change: boolean) => void }) { return <section className="animate-rise rounded-3xl border border-primary/30 bg-card p-6"><p className="eyebrow text-center">Resultado final · {match.round}</p><div className="my-5 flex items-center justify-center gap-5"><div className="text-center"><b className="display-type text-5xl">XI</b><p className="text-xs">ARGENRETRO</p></div><b className="display-type text-6xl text-primary">{match.userGoals} — {match.rivalGoals}</b><div className="max-w-24 text-center"><b className="text-sm">{match.rival}</b><p className="text-xs">OVR {match.rivalRating}</p></div></div><div className="grid grid-cols-2 gap-2 text-center"><div className="rounded-xl bg-muted p-3"><b>{match.possession}%</b><p className="text-[9px] uppercase text-muted-foreground">Posesión</p></div><div className="rounded-xl bg-muted p-3"><b>{match.shots}</b><p className="text-[9px] uppercase text-muted-foreground">Remates</p></div></div>{match.scorers.length > 0 && <p className="mt-4 text-xs"><b>Goles:</b> {match.scorers.join(", ")}</p>}<div className="mt-6 grid gap-2"><Button variant="legend" onClick={() => onContinue(true)}><Sparkles/>Cambiar 1 jugador</Button><Button variant="stadium" onClick={() => onContinue(false)}>Seguir con este XI <ChevronRight/></Button></div></section>; }

function EndPanel({ champion, match, overall, onReset, onShare }: { champion: boolean; match: Match; overall: number; onReset: () => void; onShare: () => void }) { return <section className={`animate-rise rounded-3xl border p-6 text-center ${champion ? "border-primary bg-primary/10" : "border-destructive/40 bg-card"}`}><Trophy className={`mx-auto size-16 ${champion ? "text-primary" : "text-muted-foreground"}`}/><p className="eyebrow mt-4">{champion ? "Gloria eterna" : "Fin del camino"}</p><h2 className="display-type mt-1 text-5xl tracking-wide">{champion ? "¡CAMPEÓN!" : "ELIMINADO"}</h2><p className="mt-3 text-sm text-muted-foreground">{champion ? `Conquistaste el torneo con un XI de ${overall} puntos.` : `Caíste ${match.userGoals}—${match.rivalGoals} ante ${match.rival}.`}</p><div className="mt-6 grid gap-2"><Button variant="legend" onClick={onShare}><Share2/>Compartir resultado</Button><Button variant="stadium" onClick={onReset}><RotateCcw/>Jugar de nuevo</Button></div></section>; }