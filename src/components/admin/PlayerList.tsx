import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Save, X } from "lucide-react";
import type { Player } from "@/types";

const VALID_POSITIONS = [
  "GOALKEEPER",
  "CENTRAL DEFENDER",
  "DEFENSIVE MIDFIELDER",
  "CENTRAL MIDFIELDER",
  "OFFENSIVE MIDFIELDER",
  "LEFT WING",
  "RIGHT WING",
  "CENTRAL FORWARD",
] as const;

type EditablePlayer = {
  id?: number;
  name: string;
  rating: string;
  position_1: string;
  position_2: string;
  position_3: string;
};

export function PlayerList({
  players, onSave, onDelete, saving,
}: {
  players: Player[];
  onSave: (player: EditablePlayer) => void;
  onDelete: (id: number) => void;
  saving: boolean;
}) {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<EditablePlayer | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState<EditablePlayer>({
    name: "", rating: "80", position_1: "CENTRAL MIDFIELDER", position_2: "", position_3: "",
  });

  const startEdit = (player: Player) => {
    setEditingId(player.id);
    setEditForm({
      id: player.id,
      name: player.name,
      rating: String(player.rating),
      position_1: player.position_1,
      position_2: player.position_2 ?? "",
      position_3: player.position_3 ?? "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const saveEdit = () => {
    if (!editForm) return;
    onSave(editForm);
    setEditingId(null);
    setEditForm(null);
  };

  const saveAdd = () => {
    onSave(addForm);
    setAddForm({
      name: "", rating: "80", position_1: "CENTRAL MIDFIELDER", position_2: "", position_3: "",
    });
    setShowAdd(false);
  };

  return (
    <div className="mt-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold">Jugadores</h3>
        {!showAdd && (
          <Button variant="legend" size="sm" onClick={() => setShowAdd(true)}>
            <Plus className="size-4" />
            Agregar jugador
          </Button>
        )}
      </div>

      {showAdd && (
        <div className="mb-4 rounded-xl border border-secondary/30 bg-secondary/5 p-4">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-secondary">Nuevo jugador</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Input
                placeholder="Nombre"
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                className="h-10"
              />
            </div>
            <div>
              <Input
                type="number" min={0} max={100}
                placeholder="Rating"
                value={addForm.rating}
                onChange={(e) => setAddForm({ ...addForm, rating: e.target.value })}
                className="h-10"
              />
            </div>
            <div>
              <Select
                value={addForm.position_1}
                onValueChange={(v) => setAddForm({ ...addForm, position_1: v })}
              >
                <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {VALID_POSITIONS.map((pos) => (
                    <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select
                value={addForm.position_2 || "_none"}
                onValueChange={(v) => setAddForm({ ...addForm, position_2: v === "_none" ? "" : v })}
              >
                <SelectTrigger className="h-10"><SelectValue placeholder="Pos. 2 (opcional)"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">— Sin segunda posición —</SelectItem>
                  {VALID_POSITIONS.map((pos) => (
                    <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select
                value={addForm.position_3 || "_none"}
                onValueChange={(v) => setAddForm({ ...addForm, position_3: v === "_none" ? "" : v })}
              >
                <SelectTrigger className="h-10"><SelectValue placeholder="Pos. 3 (opcional)"/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">— Sin tercera posición —</SelectItem>
                  {VALID_POSITIONS.map((pos) => (
                    <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="legend" onClick={saveAdd} disabled={saving || !addForm.name}>
              <Save className="size-3" />
              Guardar
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowAdd(false)}>
              <X className="size-3" />
              Cancelar
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {players.map((player) => (
          <div key={player.id} className="rounded-xl border border-border bg-card/50 p-4">
            {editingId === player.id && editForm ? (
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <Input
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="h-10"
                  />
                </div>
                <div>
                  <Input
                    type="number" min={0} max={100}
                    value={editForm.rating}
                    onChange={(e) => setEditForm({ ...editForm, rating: e.target.value })}
                    className="h-10"
                  />
                </div>
                <div>
                  <Select
                    value={editForm.position_1}
                    onValueChange={(v) => setEditForm({ ...editForm, position_1: v })}
                  >
                    <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {VALID_POSITIONS.map((pos) => (
                        <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select
                    value={editForm.position_2 || "_none"}
                    onValueChange={(v) => setEditForm({ ...editForm, position_2: v === "_none" ? "" : v })}
                  >
                    <SelectTrigger className="h-10"><SelectValue placeholder="Pos. 2"/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">— Sin segunda posición —</SelectItem>
                      {VALID_POSITIONS.map((pos) => (
                        <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Select
                    value={editForm.position_3 || "_none"}
                    onValueChange={(v) => setEditForm({ ...editForm, position_3: v === "_none" ? "" : v })}
                  >
                    <SelectTrigger className="h-10"><SelectValue placeholder="Pos. 3"/></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none">— Sin tercera posición —</SelectItem>
                      {VALID_POSITIONS.map((pos) => (
                        <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 flex gap-2">
                  <Button size="sm" variant="legend" onClick={saveEdit} disabled={saving}>
                    <Save className="size-3" />
                    Guardar
                  </Button>
                  <Button size="sm" variant="outline" onClick={cancelEdit}>
                    <X className="size-3" />
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-sm">{player.name}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-black text-primary">
                      {player.position_1}
                    </span>
                    {player.position_2 && (
                      <span className="rounded-full bg-secondary/15 px-2 py-0.5 text-[10px] font-black text-secondary">
                        {player.position_2}
                      </span>
                    )}
                    {player.position_3 && (
                      <span className="rounded-full bg-secondary/15 px-2 py-0.5 text-[10px] font-black text-secondary">
                        {player.position_3}
                      </span>
                    )}
                    <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-black">
                      OVR {player.rating}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => startEdit(player)}>
                    <Save className="size-3" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onDelete(player.id)}>
                    <Trash2 className="size-3 text-destructive" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
        {players.length === 0 && !showAdd && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No hay jugadores para este equipo.
          </p>
        )}
      </div>
    </div>
  );
}
