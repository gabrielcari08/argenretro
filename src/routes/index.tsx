import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Check, RotateCcw, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGame } from "@/hooks/useGame";
import { useRanking } from "@/hooks/useRanking";
import { DrawPanel } from "@/components/panels/DrawPanel";
import { MatchPanel } from "@/components/panels/MatchPanel";
import { LiveMatchPanel } from "@/components/panels/LiveMatchPanel";
import { ResultPanel } from "@/components/panels/ResultPanel";
import { EndPanel } from "@/components/panels/EndPanel";
import { getCompatibleSlots } from "@/lib/positionUtils";
import { FORMATIONS } from "@/lib/formations";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ARGENRETRO XI | Torneo histórico argentino" },
      { name: "description", content: "Armá tu XI con cracks históricos y conquistá el torneo de eliminación directa de ARGENRETRO XI." },
      { property: "og:title", content: "ARGENRETRO XI" },
      { property: "og:description", content: "El torneo definitivo de equipos históricos del fútbol argentino." },
    ],
  }),
  component: Index,
});

function Index() {
  const {
    picks, round, phase, drawn, rolling, loaded, replaceIndex,
    liveMinute, liveMatch, selectedSlot, pendingPlayer,
    formation, formationId, gameMode,
    overall, usedPlayers, usedTeams, availableSlots, lastMatch,
    rounds, positions, fieldSpots, slotPositionMap,
    setReplaceIndex, setSelectedSlot, setPendingPlayer,
    roll, choose, placePlayer, simulate, continueRound, reset, share,
    setSaveRanking, setPhase, selectFormation,
  } = useGame();

  const [selectedMode, setSelectedMode] = useState<"ayudin" | "macaya">("ayudin");

  const { saveRanking } = useRanking();
  const saveRankingRef = useRef(saveRanking);

  useEffect(() => {
    saveRankingRef.current = saveRanking;
  }, [saveRanking]);

  useEffect(() => {
    setSaveRanking((score: number) => saveRankingRef.current(score));
  }, [setSaveRanking]);

  if (!loaded) return <main className="min-h-screen bg-background" />;
  if (!formationId) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="grid size-20 place-items-center rounded-2xl bg-secondary text-secondary-foreground shadow-[var(--shadow-blue)]">
          <Shield className="size-10" />
        </div>
        <h1 className="display-type mt-6 text-6xl tracking-wide sm:text-7xl">
          ARGEN<span className="text-secondary">RETRO</span> XI
        </h1>
        <p className="mt-2 text-sm font-medium text-muted-foreground">
          Elegí tu formación para empezar
        </p>

        <div className="mt-8 flex gap-3">
          <button
            onClick={() => setSelectedMode("ayudin")}
            className={`rounded-xl border-2 px-6 py-3 text-left transition-all ${
              selectedMode === "ayudin"
                ? "border-secondary bg-secondary/10 text-secondary"
                : "border-border text-muted-foreground hover:border-secondary/30"
            }`}
          >
            <p className="text-sm font-bold">Modo Ayudín</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">Ver OVR de jugadores</p>
          </button>
          <button
            onClick={() => setSelectedMode("macaya")}
            className={`rounded-xl border-2 px-6 py-3 text-left transition-all ${
              selectedMode === "macaya"
                ? "border-secondary bg-secondary/10 text-secondary"
                : "border-border text-muted-foreground hover:border-secondary/30"
            }`}
          >
            <p className="text-sm font-bold">Modo Macaya</p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">OVR oculto hasta el final</p>
          </button>
        </div>

        <div className="mt-6 grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {FORMATIONS.map((f) => (
            <button
              key={f.id}
              onClick={() => selectFormation(f.id, selectedMode)}
              className="rounded-2xl border border-border bg-card p-4 text-left transition-all hover:-translate-y-1 hover:border-secondary/50 hover:shadow-[var(--shadow-blue)]"
            >
              <p className="text-lg font-bold text-secondary">{f.name}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {(() => {
                  const counts = new Map<string, number>();
                  for (const slot of f.slots) {
                    const key = slot.code;
                    counts.set(key, (counts.get(key) ?? 0) + 1);
                  }
                  return [...counts.entries()].map(([code, count]) => (
                    <span
                      key={code}
                      className="rounded-md border border-secondary/20 bg-secondary/5 px-2 py-[1px] text-[10px] font-bold text-secondary"
                    >
                      {count > 1 ? `${count}×${code}` : code}
                    </span>
                  ));
                })()}
              </div>
            </button>
          ))}
        </div>
        <p className="mt-8 text-[10px] font-black uppercase tracking-[.2em] text-muted-foreground">
          9 formaciones · 11 jugadores cada una
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
        <>
          <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl">
            <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-3 sm:px-7">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-xl bg-secondary text-secondary-foreground">
                  <Shield />
                </div>
                <div>
                  <p className="display-type text-2xl leading-none tracking-wider">
                    ARGEN<span className="text-secondary">RETRO</span> XI
                  </p>
                  <p className="text-[9px] font-black uppercase tracking-[.28em] text-muted-foreground">
                    La historia juega de nuevo
                  </p>
                </div>
              </div>
              <div className="hidden items-center gap-2 md:flex">
                {rounds.map((name, index) => (
                  <div
                    key={name}
                    className={`rounded-full border px-4 py-2 text-[10px] font-black uppercase tracking-wider ${
                      index < round
                        ? "border-primary bg-primary text-primary-foreground"
                        : index === round
                          ? "border-secondary text-secondary"
                          : "border-border text-muted-foreground"
                    }`}
                  >
                    {index < round && <Check className="mr-1 inline size-3" />}
                    {name}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3">
                <Button variant="stadium" size="sm" onClick={reset}>
                  <RotateCcw />
                  <span className="hidden sm:inline">Nueva partida</span>
                </Button>
              </div>
            </div>
          </header>

          <div className="mx-auto grid max-w-[1500px] gap-5 p-4 lg:grid-cols-[280px_minmax(390px,1fr)_390px] lg:p-6">
            <aside className="order-2 space-y-4 lg:order-1">
              <section className="rounded-3xl border border-border bg-card p-5">
                <p className="eyebrow">Torneo nacional</p>
                <h2 className="display-type mt-1 text-4xl tracking-wide">
                  {phase === "champion" ? "CAMPEÓN" : rounds[round]}
                </h2>
                <div className="mt-5 space-y-3">
                  {rounds.map((name, index) => {
                    const match = lastMatch && index === round - 1 ? lastMatch : undefined;
                    return (
                      <div
                        key={name}
                        className={`relative border-l-2 pl-4 ${
                          index === round
                            ? "border-secondary"
                            : match?.won
                              ? "border-primary"
                              : "border-border"
                        }`}
                      >
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          {name}
                        </p>
                        <p className="mt-1 text-sm font-bold">
                          {match
                            ? `XI ${match.userGoals} — ${match.rivalGoals} ${match.rival.split(" ")[0]}`
                            : index === round
                              ? "Próximo cruce"
                              : "Por definir"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>

            </aside>

            <section className="order-1 lg:order-2">
              <div className="mb-4 flex items-end justify-between">
                <div>
                  <p className="eyebrow">Tu selección · {formation?.name ?? "—"}</p>
                  <h1 className="display-type text-4xl tracking-wide sm:text-5xl">
                    EL ONCE DE LA HISTORIA
                  </h1>
                </div>
                <div className="rounded-2xl border border-primary/30 bg-primary/10 px-4 py-2 text-center">
                  <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground">Media</p>
                  <b className="display-type text-3xl text-primary">{overall || "—"}</b>
                </div>
              </div>

              <div className="pitch relative mx-auto aspect-[4/5] w-full max-w-[650px] overflow-hidden rounded-[2rem] border border-pitch-line/30 bg-pitch shadow-2xl">
                <div className="absolute inset-5 rounded-2xl border-2 border-pitch-line/70">
                  <div className="absolute inset-x-0 top-1/2 border-t-2 border-pitch-line/70" />
                  <div className="absolute left-1/2 top-1/2 size-28 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-pitch-line/70" />
                  <div className="absolute left-1/2 top-0 h-20 w-48 -translate-x-1/2 border-x-2 border-b-2 border-pitch-line/70" />
                  <div className="absolute bottom-0 left-1/2 h-20 w-48 -translate-x-1/2 border-x-2 border-t-2 border-pitch-line/70" />
                </div>

                {(() => {
                  const positioningCompatible = phase === "positioning" && pendingPlayer
                    ? getCompatibleSlots(pendingPlayer.positions, picks.map((p) => p.slot), slotPositionMap)
                    : [];
                  return positions.map((position, index) => {
                    const pick = picks.find((item) => item.slot === index);
                    const isUpgradeTarget = phase === "upgrade" && Boolean(pick);
                    const isPositioningSlot = phase === "positioning" && positioningCompatible.includes(index);
                    const isPositioningOccupied = phase === "positioning" && Boolean(pick);
                    const clickable = isUpgradeTarget || isPositioningSlot;
                    return (
                      <button
                        key={`${position}-${index}`}
                        disabled={!clickable}
                        onClick={() => {
                          if (isPositioningSlot && pendingPlayer) {
                            placePlayer(index);
                          } else if (isUpgradeTarget) {
                            setReplaceIndex(index);
                            roll();
                          }
                        }}
                        className={`absolute ${fieldSpots[index]} z-10 w-[88px] -translate-x-1/2 -translate-y-1/2 text-center sm:w-28 ${
                          clickable ? "cursor-pointer" : "cursor-default"
                        } ${isPositioningOccupied ? "animate-position-dim" : ""}`}
                      >
                        <div
                          className={`mx-auto grid size-11 place-items-center rounded-full border-2 text-[10px] font-black shadow-xl sm:size-14 ${
                            isPositioningSlot
                              ? "animate-position-target border-secondary bg-secondary/20 text-secondary"
                              : pick
                                ? "border-primary bg-foreground text-background"
                                : "border-pitch-line/60 bg-background/25 text-pitch-line"
                          }`}
                        >
                          {pick?.rating ?? position}
                        </div>
                        <p className="mt-1 truncate rounded-md bg-background/85 px-1 py-1 text-[9px] font-extrabold backdrop-blur sm:text-[11px]">
                          {pick?.name ?? "VACANTE"}
                        </p>
                        {pick && (
                          <p className="text-[8px] font-bold text-pitch-line">
                            {pick.abbr} · {pick.year}
                          </p>
                        )}
                        {isPositioningSlot && (
                          <p className="mt-0.5 text-[7px] font-bold text-secondary sm:text-[8px]">
                            Colocar aquí
                          </p>
                        )}
                      </button>
                    );
                  });
                })()}
              </div>

              {phase === "upgrade" && (
                <p className="mt-3 text-center text-xs font-bold text-secondary">
                  <Sparkles className="mr-1 inline size-4" />
                  Elegí un jugador de la cancha para reemplazarlo
                </p>
              )}
              {phase === "positioning" && pendingPlayer && (
                <p className="mt-3 text-center text-xs font-bold text-secondary">
                  <Sparkles className="mr-1 inline size-4" />
                  Seleccioná la posición para {pendingPlayer.name}
                </p>
              )}
            </section>

            <aside className="order-3">
              {(phase === "build" || phase === "upgrade") && (
                <DrawPanel
                  drawn={drawn}
                  rolling={rolling}
                  picks={picks}
                  replaceIndex={replaceIndex}
                  availableSlots={availableSlots}
                  slotPositionMap={slotPositionMap}
                  gameMode={gameMode}
                  onRoll={roll}
                  onChoose={choose}
                  onSetPendingPlayer={setPendingPlayer}
                  onSetPhase={setPhase}
                />
              )}

              {phase === "ready" && (
                <MatchPanel
                  round={rounds[round]}
                  overall={overall}
                  onPlay={simulate}
                />
              )}

              {phase === "live" && liveMatch && (
                <LiveMatchPanel
                  live={liveMatch}
                  minute={liveMinute}
                />
              )}

              {phase === "result" && lastMatch && (
                <ResultPanel
                  match={lastMatch}
                  onContinue={continueRound}
                />
              )}

              {(phase === "lost" || phase === "champion") && lastMatch && (
                <EndPanel
                  champion={phase === "champion"}
                  match={lastMatch}
                  overall={overall}
                  picks={picks}
                  formationName={formation?.name ?? ""}
                  onReset={reset}
                />
              )}

              <section className="mt-4 rounded-3xl border border-border bg-card/70 p-4">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-muted-foreground">Plantel</span>
                  <span>{picks.length}/11</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-secondary transition-all"
                    style={{ width: `${picks.length / 11 * 100}%` }}
                  />
                </div>
                <p className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground">
                  <Check className="size-3 text-primary" />
                  Partida guardada automáticamente
                </p>
              </section>
            </aside>
          </div>
        </>
    </main>
  );
}
