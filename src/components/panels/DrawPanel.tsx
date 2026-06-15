import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dice5, ChevronRight } from "lucide-react";
import type { HistoricTeam, Pick } from "@/types";

export function DrawPanel({
  drawn, rolling, picks, position, availableSlots, selectedSlot,
  onPositionChange, positionLocked, onRoll, onChoose,
}: {
  drawn: HistoricTeam | null;
  rolling: boolean;
  picks: Pick[];
  position: string;
  availableSlots: { position: string; slot: number; label: string }[];
  selectedSlot: number;
  onPositionChange: (slot: number) => void;
  positionLocked: boolean;
  onRoll: () => void;
  onChoose: (name: string, rating: number) => void;
}) {
  const positionSelector = (
    <div className="mt-4 text-left">
      <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-muted-foreground">
        Posición del jugador
      </label>
      <Select
        value={String(selectedSlot)}
        onValueChange={(value) => onPositionChange(Number(value))}
        disabled={positionLocked}
      >
        <SelectTrigger className="h-12 rounded-xl border-secondary/30 bg-background/60 font-bold">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {availableSlots.map(({ position: code, slot, label }) => (
            <SelectItem key={slot} value={String(slot)}>
              {code} · {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {positionLocked && (
        <p className="mt-2 text-[10px] text-muted-foreground">
          La posición queda fijada durante un reemplazo.
        </p>
      )}
    </div>
  );

  if (!drawn) {
    return (
      <section className="rounded-3xl border border-border bg-card p-6 text-center">
        <p className="eyebrow">Destino retro</p>
        <h2 className="display-type mt-2 text-4xl tracking-wide">SORTEÁ TU CLUB</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Elegí el puesto y sorteá una versión histórica.
        </p>
        {positionSelector}
        <button
          onClick={onRoll}
          disabled={rolling}
          aria-label="Lanzar dado"
          className="mx-auto mt-6 grid size-36 cursor-pointer place-items-center rounded-[2rem] border border-secondary/40 bg-secondary/10 shadow-[var(--shadow-blue)] transition-transform hover:-translate-y-1 disabled:pointer-events-none"
        >
          <Dice5 className={`size-20 text-secondary ${rolling ? "animate-dice" : ""}`} />
        </button>
        <Button variant="legend" size="xl" className="mt-7 w-full" onClick={onRoll} disabled={rolling}>
          {rolling ? "Girando la historia…" : "Lanzar el dado"}
        </Button>
        <p className="mt-4 text-[9px] font-bold uppercase tracking-[.2em] text-muted-foreground">
          32 equipos · épocas irrepetibles
        </p>
      </section>
    );
  }

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
        {positionSelector}
        <div className="mb-3 mt-5 flex items-center justify-between">
          <p className="text-xs font-black uppercase tracking-wider">Elegí para {position}</p>
          <span className="text-xs text-muted-foreground">OVR</span>
        </div>
        <div className="space-y-2">
          {(drawn.players ?? []).map((player) => {
            const used = picks.some((pick) => pick.name === player.name);
            return (
              <Button
                key={player.name}
                variant="stadium"
                disabled={used}
                onClick={() => onChoose(player.name, player.rating)}
                className="h-auto w-full justify-between rounded-xl px-4 py-3"
              >
                <span className="text-left text-xs font-bold">
                  {player.name}
                  {used && <small className="block text-[9px] text-muted-foreground">Ya seleccionado</small>}
                </span>
                <span className="flex items-center gap-2 font-black text-primary">
                  {player.rating}
                  <ChevronRight className="size-3" />
                </span>
              </Button>
            );
          })}
        </div>
        <Button variant="ghost" className="mt-3 w-full text-muted-foreground" onClick={onRoll}>
          <Dice5 />
          Sortear otro
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
