import { Button } from "@/components/ui/button";
import { Swords, ChevronRight } from "lucide-react";

export function MatchPanel({
  round, overall, onPlay,
}: {
  round: string;
  overall: number;
  onPlay: () => void;
}) {
  return (
    <section className="rounded-3xl border border-secondary/30 bg-card p-6 text-center">
      <Swords className="mx-auto size-12 text-secondary" />
      <p className="eyebrow mt-4">Equipo completo</p>
      <h2 className="display-type mt-1 text-5xl tracking-wide">{round}</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Tu XI está listo. El rival y el resultado se revelarán al iniciar el partido.
      </p>
      <div className="my-6 flex items-center justify-center gap-5">
        <div>
          <p className="display-type text-5xl text-primary">{overall}</p>
          <small>Tu media</small>
        </div>
        <span className="text-muted-foreground">VS</span>
        <div>
          <p className="display-type text-5xl">?</p>
          <small>Rival</small>
        </div>
      </div>
      <Button variant="legend" size="xl" className="w-full" onClick={onPlay}>
        Jugar partido <ChevronRight />
      </Button>
    </section>
  );
}
