import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import type { Match, LiveEvent } from "@/types";

export function ResultPanel({
  match, events, onContinue,
}: {
  match: Match;
  events: LiveEvent[];
  onContinue: (change: boolean) => void;
}) {
  const [showEvents, setShowEvents] = useState(false);
  return (
    <section className="animate-rise rounded-3xl border border-primary/30 bg-card p-6">
      <p className="eyebrow text-center">Resultado final · {match.round}</p>
      <div className="my-5 flex items-center justify-center gap-5">
        <div className="text-center">
          <b className="display-type text-5xl">XI</b>
          <p className="text-xs">ARGENRETRO</p>
        </div>
        <b className="display-type text-5xl text-primary">
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

      {events.length > 0 && (
        <div className="mt-4">
          <button
            className="flex w-full items-center justify-between rounded-xl bg-muted px-4 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground"
            onClick={() => setShowEvents((v) => !v)}
          >
            Ver eventos del partido
            {showEvents ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>
          {showEvents && (
            <div className="mt-2 max-h-48 space-y-1 overflow-y-auto rounded-xl bg-muted/50 p-2">
              {events.map((event, i) => (
                <div key={i} className="flex gap-2 rounded-lg px-2 py-1 text-xs hover:bg-muted/80">
                  <b className={event.goal ? "text-primary" : "text-secondary"}>
                    {event.minute <= 120 ? `${event.minute}'` : "PEN"}
                  </b>
                  <span className={event.goal ? "font-extrabold" : "text-muted-foreground"}>
                    {event.text}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-6 grid gap-2">
        <Button variant="legend" onClick={() => onContinue(false)}>
          Continuar <ChevronRight />
        </Button>
      </div>
    </section>
  );
}
