import { Button } from "@/components/ui/button";
import { Trophy, Share2, RotateCcw } from "lucide-react";
import type { Match } from "@/types";

export function EndPanel({
  champion, match, overall, onReset, onShare,
}: {
  champion: boolean;
  match: Match;
  overall: number;
  onReset: () => void;
  onShare: () => void;
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
      <div className="mt-6 grid gap-2">
        <Button variant="legend" onClick={onShare}>
          <Share2 />
          Compartir resultado
        </Button>
        <Button variant="stadium" onClick={onReset}>
          <RotateCcw />
          Jugar de nuevo
        </Button>
      </div>
    </section>
  );
}
