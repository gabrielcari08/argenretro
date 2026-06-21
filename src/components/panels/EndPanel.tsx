import { Button } from "@/components/ui/button";
import { Trophy, RotateCcw } from "lucide-react";
import type { Match, Pick } from "@/types";

export function EndPanel({
  champion, match, overall, picks, formationName, onReset,
}: {
  champion: boolean;
  match: Match;
  overall: number;
  picks: Pick[];
  formationName: string;
  onReset: () => void;
}) {
  return (
    <section
      className={`animate-rise rounded-3xl border p-6 text-center ${
        champion ? "border-primary bg-primary/10" : "border-destructive/40 bg-card"
      }`}
    >
      <Trophy className={`mx-auto size-16 ${champion ? "text-primary" : "text-muted-foreground"}`} />
      <p className="eyebrow mt-4">{champion ? "Gloria eterna" : "Fin del camino"}</p>
      <h2 className="display-type mt-1 text-5xl tracking-wide">
        {champion ? "¡CAMPEÓN!" : "ELIMINADO"}
      </h2>
      <p className="mt-3 text-sm text-muted-foreground">
        {champion
          ? `Conquistaste el torneo con un XI de ${overall} puntos.`
          : `Caíste ${match.userGoals}—${match.rivalGoals} ante ${match.rival}.`}
      </p>

      <div className="mt-5 space-y-1.5 text-left">
        <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          Plantel final · {formationName}
        </p>
        {picks
          .sort((a, b) => a.slot - b.slot)
          .map((pick) => (
            <div
              key={pick.slot}
              className="flex items-center justify-between rounded-xl bg-muted px-3 py-2"
            >
              <div className="flex items-center gap-2 truncate">
                <span className="w-7 text-[10px] font-black text-secondary">{pick.position}</span>
                <span className="truncate text-xs font-bold">{pick.name}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] text-muted-foreground">{pick.abbr}</span>
                <span className="w-6 text-right text-xs font-black text-primary">{pick.rating}</span>
              </div>
            </div>
          ))}
      </div>

      <div className="mt-6 grid gap-2">
        <Button variant="stadium" onClick={onReset}>
          <RotateCcw />
          Jugar de nuevo
        </Button>
      </div>
    </section>
  );
}
