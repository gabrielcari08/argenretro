import { Radio, Swords, CircleDot } from "lucide-react";
import type { LiveMatch } from "@/types";

export function LiveMatchPanel({
  live, minute,
}: {
  live: LiveMatch;
  minute: number;
}) {
  const isET = live.match.extraTime ?? false;
  const isPenalties = live.match.penalties ?? false;
  const totalMinutes = isPenalties ? 140 : isET ? 120 : 90;

  const visible = live.events.filter((event) => event.minute <= minute);
  const current = visible[visible.length - 1];

  const visibleGoals = visible.filter((e) => e.goal && e.minute <= 120);
  const currentUserScore = visibleGoals.filter((e) => e.side === "user").length;
  const currentRivalScore = visibleGoals.filter((e) => e.side === "rival").length;

  const phaseLabel = isPenalties ? "Penales" : isET ? "Tiempo extra" : "En vivo";

  return (
    <section className="animate-rise overflow-hidden rounded-3xl border border-secondary/40 bg-card">
      <div className={`p-5 text-center ${minute > 120 ? "bg-destructive/10" : minute > 90 ? "bg-amber-950/20" : "bg-secondary/10"}`}>
        <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[.2em] text-secondary">
          <Radio className="size-3 animate-pulse" /> {phaseLabel} · {live.match.round}
        </div>
        <div className="mt-4 flex items-center justify-center gap-4">
          <div className="w-24">
            <b className="display-type text-3xl">ARG XI</b>
          </div>
          <b className="display-type text-5xl text-primary">
            {currentUserScore} — {currentRivalScore}
          </b>
          <div className="w-24 text-xs font-extrabold">{live.match.rival}</div>
        </div>
        {isPenalties && live.match.penaltyScore && minute > 120 && (
          <div className="mt-1 flex items-center justify-center gap-2">
            <span className="rounded-full bg-destructive/20 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-destructive">
              Penales: {live.match.penaltyScore[0]} — {live.match.penaltyScore[1]}
            </span>
          </div>
        )}
        <div className="mt-3 inline-flex items-center rounded-full bg-background px-4 py-1 font-black text-secondary">
          {minute <= 120 ? `${minute}'` : "PEN"}
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-secondary transition-[width] duration-100"
            style={{ width: `${Math.min(minute / totalMinutes * 100, 100)}%` }}
          />
        </div>
      </div>
      <div className="p-5">
        <div
          className={`min-h-24 rounded-2xl border p-4 text-center ${
            current?.goal && current?.minute <= 120 ? "animate-goal border-primary bg-primary/10" : "border-border bg-muted/50"
          }`}
        >
          {current?.goal && current?.minute <= 120 ? (
            <CircleDot className="mx-auto mb-2 size-7 text-primary" />
          ) : (
            <Swords className="mx-auto mb-2 size-6 text-muted-foreground" />
          )}
          <p className="text-xs font-black uppercase tracking-wide">
            {current?.text ?? "Los equipos salen a la cancha…"}
          </p>
        </div>
        <div className="mt-4 max-h-52 space-y-2 overflow-y-auto pr-1">
          {[...visible].reverse().map((event, index) => (
            <div
              key={`${event.minute}-${event.text}`}
              className={`flex gap-3 rounded-xl px-3 py-2 text-xs ${
                index === 0 ? "bg-secondary/10" : "bg-muted/40"
              }`}
            >
              <b className={event.goal ? "text-primary" : "text-secondary"}>
                {event.minute <= 120 ? `${event.minute}'` : "PEN"}
              </b>
              <span className={event.goal ? "font-extrabold" : "text-muted-foreground"}>
                {event.text}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-[9px] font-bold uppercase tracking-[.18em] text-muted-foreground">
          {totalMinutes} minutos resumidos en {Math.round(totalMinutes / 90 * 20)} segundos
        </p>
      </div>
    </section>
  );
}
