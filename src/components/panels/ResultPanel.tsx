import { Button } from "@/components/ui/button";
import { Sparkles, ChevronRight } from "lucide-react";
import type { Match } from "@/types";

export function ResultPanel({
  match, onContinue,
}: {
  match: Match;
  onContinue: (change: boolean) => void;
}) {
  return (
    <section className="animate-rise rounded-3xl border border-primary/30 bg-card p-6">
      <p className="eyebrow text-center">Resultado final · {match.round}</p>
      <div className="my-5 flex items-center justify-center gap-5">
        <div className="text-center">
          <b className="display-type text-5xl">XI</b>
          <p className="text-xs">ARGENRETRO</p>
        </div>
        <b className="display-type text-6xl text-primary">
          {match.userGoals} — {match.rivalGoals}
        </b>
        <div className="max-w-24 text-center">
          <b className="text-sm">{match.rival}</b>
          <p className="text-xs">OVR {match.rivalRating}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="rounded-xl bg-muted p-3">
          <b>{match.possession}%</b>
          <p className="text-[9px] uppercase text-muted-foreground">Posesión</p>
        </div>
        <div className="rounded-xl bg-muted p-3">
          <b>{match.shots}</b>
          <p className="text-[9px] uppercase text-muted-foreground">Remates</p>
        </div>
      </div>
      {match.scorers.length > 0 && (
        <p className="mt-4 text-xs">
          <b>Goles:</b> {match.scorers.join(", ")}
        </p>
      )}
      <div className="mt-6 grid gap-2">
        <Button variant="legend" onClick={() => onContinue(true)}>
          <Sparkles />
          Cambiar 1 jugador
        </Button>
        <Button variant="stadium" onClick={() => onContinue(false)}>
          Seguir con este XI <ChevronRight />
        </Button>
      </div>
    </section>
  );
}
