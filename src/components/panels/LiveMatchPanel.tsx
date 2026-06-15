import { Radio, Swords, CircleDot } from "lucide-react";
import type { LiveMatch } from "@/types";

export function LiveMatchPanel({
  live, minute,
}: {
  live: LiveMatch;
  minute: number;
}) {
  const visible = live.events.filter((event) => event.minute <= minute);
  const userGoals = visible.filter((event) => event.goal && event.side === "user").length;
  const rivalGoals = visible.filter((event) => event.goal && event.side === "rival").length;
  const current = visible[visible.length - 1];

  return (
    <section className="animate-rise overflow-hidden rounded-3xl border border-secondary/40 bg-card">
      <div className="bg-secondary/10 p-5 text-center">
        <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[.2em] text-secondary">
          <Radio className="size-3 animate-pulse" /> En vivo · {live.match.round}
        </div>
        <div className="mt-4 flex items-center justify-center gap-4">
          <div className="w-24">
            <b className="display-type text-3xl">ARG XI</b>
          </div>
          <b className="display-type text-6xl text-primary">
            {userGoals} — {rivalGoals}
          </b>
          <div className="w-24 text-xs font-extrabold">{live.match.rival}</div>
        </div>
        <div className="mt-3 inline-flex items-center rounded-full bg-background px-4 py-1 font-black text-secondary">
          {minute}&apos;
        </div>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-secondary transition-[width] duration-100"
            style={{ width: `${minute / 90 * 100}%` }}
          />
        </div>
      </div>
      <div className="p-5">
        <div
          className={`min-h-24 rounded-2xl border p-4 text-center ${
            current?.goal ? "animate-goal border-primary bg-primary/10" : "border-border bg-muted/50"
          }`}
        >
          {current?.goal ? (
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
              <b className={event.goal ? "text-primary" : "text-secondary"}>{event.minute}&apos;</b>
              <span className={event.goal ? "font-extrabold" : "text-muted-foreground"}>
                {event.text}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-[9px] font-bold uppercase tracking-[.18em] text-muted-foreground">
          90 minutos resumidos en 20 segundos
        </p>
      </div>
    </section>
  );
}
