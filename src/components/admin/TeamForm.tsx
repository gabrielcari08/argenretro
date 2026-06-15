import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, ArrowLeft } from "lucide-react";

export type TeamFormData = {
  club: string;
  year: number;
  abbr: string;
  rating: number;
};

export function TeamForm({
  initial, onSave, onCancel, saving,
}: {
  initial: TeamFormData;
  onSave: (data: TeamFormData) => void;
  onCancel: () => void;
  saving?: boolean;
}) {
  const [club, setClub] = useState(initial.club);
  const [year, setYear] = useState(String(initial.year));
  const [abbr, setAbbr] = useState(initial.abbr);
  const [rating, setRating] = useState(String(initial.rating));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ club, year: parseInt(year), abbr, rating: parseInt(rating) });
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-6 grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="club" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Club
          </Label>
          <Input id="club" value={club} onChange={(e) => setClub(e.target.value)} required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="year" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Año
          </Label>
          <Input id="year" type="number" value={year} onChange={(e) => setYear(e.target.value)} required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="abbr" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Abreviatura
          </Label>
          <Input id="abbr" value={abbr} onChange={(e) => setAbbr(e.target.value.toUpperCase())} required maxLength={10} className="mt-1" />
        </div>
        <div className="col-span-2">
          <Label htmlFor="rating" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Rating general (0-100)
          </Label>
          <Input id="rating" type="number" min={0} max={100} value={rating} onChange={(e) => setRating(e.target.value)} required className="mt-1" />
        </div>
      </div>
      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          <ArrowLeft className="size-4" />
          Volver
        </Button>
        <Button type="submit" variant="legend" disabled={saving}>
          <Save className="size-4" />
          {saving ? "Guardando…" : "Guardar equipo"}
        </Button>
      </div>
    </form>
  );
}
