import { Button } from "@/components/ui/button";
import { Dice5, ChevronRight } from "lucide-react";
import type { HistoricTeam, Pick, PendingPlayer, Phase, ValidPosition, GameMode } from "@/types";
import { getAvailablePositions, getCompatibleSlots } from "@/lib/positionUtils";

const POSITION_SHORT: Record<ValidPosition, string> = {
  GOALKEEPER: "ARQ",
  "RIGHT BACK": "LD",
  "CENTRAL DEFENDER": "DFC",
  "LEFT BACK": "LI",
  "DEFENSIVE MIDFIELDER": "MCD",
  "CENTRAL MIDFIELDER": "MC",
  "OFFENSIVE MIDFIELDER": "MCO",
  "RIGHT WING": "ED",
  "CENTRAL FORWARD": "DC",
  "LEFT WING": "EI",
};

export function DrawPanel({
  drawn, rolling, picks, replaceIndex, availableSlots, slotPositionMap, gameMode, rerollsLeft,
  onRoll, onChoose, onSetPendingPlayer, onSetPhase,
}: {
  drawn: HistoricTeam | null;
  rolling: boolean;
  picks: Pick[];
  replaceIndex: number | null;
  availableSlots: { position: string; slot: number; label: string }[];
  slotPositionMap: Record<ValidPosition, number[]>;
  gameMode: GameMode;
  rerollsLeft: number;
  onRoll: (isReroll?: boolean) => void;
  onChoose: (name: string, rating: number, slotOverride?: number) => void;
  onSetPendingPlayer: (player: PendingPlayer) => void;
  onSetPhase: (phase: Phase) => void;
}) {
  const showOvr = gameMode === "ayudin";
  if (!drawn) {
    return (
      <section className="rounded-3xl border border-border bg-card p-6 text-center">
        <p className="eyebrow">Destino retro</p>
        <h2 className="display-type mt-2 text-4xl tracking-wide">SORTEÁ TU CLUB</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Lanzá el dado y elegí un jugador.
        </p>
        <button
          onClick={() => onRoll(false)}
          disabled={rolling}
          aria-label="Lanzar dado"
          className="mx-auto mt-6 grid size-36 cursor-pointer place-items-center rounded-[2rem] border border-secondary/40 bg-secondary/10 shadow-[var(--shadow-blue)] transition-transform hover:-translate-y-1 disabled:pointer-events-none"
        >
          <Dice5 className={`size-20 text-secondary ${rolling ? "animate-dice" : ""}`} />
        </button>
        <Button variant="legend" size="xl" className="mt-7 w-full" onClick={() => onRoll(false)} disabled={rolling}>
          {rolling ? "Girando la historia…" : "Lanzar el dado"}
        </Button>
        <p className="mt-4 text-[9px] font-bold uppercase tracking-[.2em] text-muted-foreground">
          32 equipos · épocas irrepetibles
        </p>
      </section>
    );
  }

  const takenSlots = picks.map((p) => p.slot);

  return (
    <section className="animate-rise overflow-hidden rounded-3xl border border-border bg-card">
      <div className="relative bg-secondary/10 p-5">
        <p className="eyebrow">El dado eligió</p>
        <div className="mt-3 flex items-center gap-4">
          <Crest team={drawn} large />
          <div>
            <h2 className="display-type text-4xl leading-none tracking-wide">{drawn.club}</h2>
            <p className="mt-1 text-2xl font-black text-secondary">{drawn.year}</p>
          </div>
        </div>
      </div>
      <div className="p-5">
        <div className="mb-3 mt-2 flex items-center justify-between">
          <p className="text-xs font-black uppercase tracking-wider">Jugadores</p>
          {showOvr && <span className="text-xs text-muted-foreground">OVR</span>}
        </div>
        <div className="space-y-2">
          {(drawn.players ?? []).map((player) => {
            const used = picks.some((pick) => pick.name === player.name);
            const playerPositions = getAvailablePositions(player);
            let compatibleSlots: number[];
            let disabledReason = "";

            if (replaceIndex !== null) {
              compatibleSlots = getCompatibleSlots(playerPositions, [], slotPositionMap);
              const fits = compatibleSlots.includes(replaceIndex);
              if (!fits) disabledReason = "Posición no compatible";
            } else {
              compatibleSlots = getCompatibleSlots(playerPositions, takenSlots, slotPositionMap);
              if (compatibleSlots.length === 0) disabledReason = "Sin posición disponible";
            }

            const disabled = used || disabledReason !== "";

            return (
              <Button
                key={player.name}
                variant="stadium"
                disabled={disabled}
                onClick={() => {
                  if (replaceIndex !== null) {
                    onChoose(player.name, player.rating);
                    return;
                  }
                  if (compatibleSlots.length === 1) {
                    onChoose(player.name, player.rating, compatibleSlots[0]);
                    return;
                  }
                  onSetPendingPlayer({
                    name: player.name,
                    rating: player.rating,
                    teamId: drawn.id,
                    club: drawn.club,
                    year: drawn.year,
                    abbr: drawn.abbr,
                    positions: playerPositions,
                  });
                  onSetPhase("positioning");
                }}
                className="h-auto w-full justify-between rounded-xl px-4 py-3"
              >
                <span className="text-left text-xs font-bold">
                  {player.name}
                  <span className="mt-0.5 flex flex-wrap gap-1">
                    {playerPositions.map((pos) => (
                      <span
                        key={pos}
                        className="rounded-md border border-secondary/30 bg-secondary/10 px-1.5 py-[1px] text-[9px] font-bold text-secondary"
                      >
                        {POSITION_SHORT[pos]}
                      </span>
                    ))}
                  </span>
                  {used && <small className="block text-[9px] text-muted-foreground">Ya seleccionado</small>}
                  {disabledReason !== "" && !used && (
                    <small className="block text-[9px] text-destructive">{disabledReason}</small>
                  )}
                </span>
                <span className="flex items-center gap-2 font-black text-primary">
                  {showOvr ? player.rating : "—"}
                  <ChevronRight className="size-3" />
                </span>
              </Button>
            );
          })}
        </div>
        <Button variant="ghost" className="mt-3 w-full text-muted-foreground" onClick={() => onRoll(true)} disabled={rerollsLeft <= 0}>
          <Dice5 />
          Sortear otro ({rerollsLeft})
        </Button>
      </div>
    </section>
  );
}

function Crest({ team, large = false }: { team: HistoricTeam; large?: boolean }) {
  return (
    <div
      className={`crest grid place-items-center bg-primary text-primary-foreground shadow-lg ${
        large ? "h-24 w-20 text-xl" : "h-12 w-10 text-[10px]"
      }`}
    >
      <span className="font-black">{team.abbr}</span>
      <small className="text-[8px] font-bold">{team.year}</small>
    </div>
  );
}
