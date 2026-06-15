import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2 } from "lucide-react";
import type { HistoricTeam } from "@/types";

export function TeamList({
  teams, onEdit, onDelete, onAdd,
}: {
  teams: HistoricTeam[];
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onAdd: () => void;
}) {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Equipos</h2>
        <Button variant="legend" size="sm" onClick={onAdd}>
          <Plus className="size-4" />
          Agregar equipo
        </Button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 font-bold text-muted-foreground">ID</th>
              <th className="px-4 py-3 font-bold text-muted-foreground">Club</th>
              <th className="px-4 py-3 font-bold text-muted-foreground">Año</th>
              <th className="px-4 py-3 font-bold text-muted-foreground">Abr.</th>
              <th className="px-4 py-3 font-bold text-muted-foreground">OVR</th>
              <th className="px-4 py-3 font-bold text-muted-foreground">Jugadores</th>
              <th className="px-4 py-3 font-bold text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((team) => (
              <tr key={team.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{team.id}</td>
                <td className="px-4 py-3 font-bold">{team.club}</td>
                <td className="px-4 py-3">{team.year}</td>
                <td className="px-4 py-3 font-mono text-xs">{team.abbr}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-primary/20 px-2 py-1 text-xs font-black text-primary">
                    {team.rating}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {team.players?.length ?? 0} jug.
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => onEdit(team.id)}>
                      <Edit2 className="size-3" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onDelete(team.id)}>
                      <Trash2 className="size-3 text-destructive" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {teams.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-muted-foreground">
                  No hay equipos registrados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
