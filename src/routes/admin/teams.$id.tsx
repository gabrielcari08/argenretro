import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeamForm, type TeamFormData } from "@/components/admin/TeamForm";
import { PlayerList } from "@/components/admin/PlayerList";
import { getTeamById, updateTeam } from "@/lib/api/teams";
import { createPlayer, updatePlayer, deletePlayer } from "@/lib/api/players";
import { VALID_POSITIONS } from "@/db/schema";
import type { HistoricTeam, Player } from "@/types";

export const Route = createFileRoute("/admin/teams/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `ARGENRETRO XI | Editando equipo #${params.id}` },
    ],
  }),
  component: TeamEditPage,
});

function TeamEditPage() {
  const { id } = Route.useParams();
  const teamId = parseInt(id);
  const router = useRouter();

  const [team, setTeam] = useState<HistoricTeam | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getTeamById({ data: { id: teamId } });
      setTeam(data);
      setPlayers(data?.players ?? []);
    } catch (err) {
      console.error("Error loading team:", err);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [teamId]);

  const handleTeamSave = async (formData: TeamFormData) => {
    setSaving(true);
    try {
      await updateTeam({ data: { id: teamId, data: formData } });
      await loadData();
    } catch (err) {
      console.error("Error updating team:", err);
    }
    setSaving(false);
  };

  const handlePlayerSave = async (playerData: {
    id?: number; name: string; rating: string;
    position_1: string; position_2: string; position_3: string;
  }) => {
    setSaving(true);
    try {
      const payload = {
        team_id: teamId,
        name: playerData.name,
        rating: parseInt(playerData.rating),
        position_1: playerData.position_1 as typeof VALID_POSITIONS[number],
        position_2: (playerData.position_2 || null) as typeof VALID_POSITIONS[number] | null,
        position_3: (playerData.position_3 || null) as typeof VALID_POSITIONS[number] | null,
      };

      if (playerData.id) {
        await updatePlayer({ data: { id: playerData.id, data: payload } });
      } else {
        await createPlayer({ data: payload });
      }
      await loadData();
    } catch (err) {
      console.error("Error saving player:", err);
    }
    setSaving(false);
  };

  const handlePlayerDelete = async (playerId: number) => {
    if (!window.confirm("¿Eliminar este jugador?")) return;
    try {
      await deletePlayer({ data: { id: playerId } });
      await loadData();
    } catch (err) {
      console.error("Error deleting player:", err);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-[900px] px-4 py-12 sm:px-7">
          <p className="text-center text-muted-foreground">Cargando equipo…</p>
        </div>
      </main>
    );
  }

  if (!team) {
    return (
      <main className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-[900px] px-4 py-12 sm:px-7">
          <p className="text-center text-muted-foreground">Equipo no encontrado.</p>
          <div className="mt-4 text-center">
            <Link to="/admin">
              <Button variant="stadium">Volver al admin</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[900px] items-center justify-between px-4 py-3 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-secondary text-secondary-foreground">
              <Shield />
            </div>
            <div>
              <p className="display-type text-xl leading-none tracking-wider">
                Editando: {team.club} {team.year}
              </p>
              <p className="text-[9px] font-black uppercase tracking-[.28em] text-muted-foreground">
                Panel de administración
              </p>
            </div>
          </div>
          <Link to="/admin">
            <Button variant="stadium" size="sm">
              <ArrowLeft className="size-4" />
              Volver
            </Button>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[900px] px-4 py-8 sm:px-7">
        <TeamForm
          initial={{
            club: team.club,
            year: team.year,
            abbr: team.abbr,
            rating: team.rating,
          }}
          onSave={handleTeamSave}
          onCancel={() => router.navigate({ to: "/admin" })}
          saving={saving}
        />

        <PlayerList
          players={players}
          onSave={handlePlayerSave}
          onDelete={handlePlayerDelete}
          saving={saving}
        />
      </div>
    </main>
  );
}
