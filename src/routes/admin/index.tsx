import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Shield, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeamList } from "@/components/admin/TeamList";
import { TeamForm, type TeamFormData } from "@/components/admin/TeamForm";
import { getTeams, createTeam, deleteTeam } from "@/lib/api/teams";
import type { HistoricTeam } from "@/types";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "ARGENRETRO | Admin" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<HistoricTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadTeams = async () => {
    setLoading(true);
    try {
      const data = await getTeams();
      setTeams(data);
    } catch (err) {
      console.error("Error loading teams:", err);
    }
    setLoading(false);
  };

  useEffect(() => { loadTeams(); }, []);

  const handleAdd = async (formData: TeamFormData) => {
    setSaving(true);
    try {
      await createTeam({ data: formData });
      setShowForm(false);
      await loadTeams();
    } catch (err) {
      console.error("Error creating team:", err);
    }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Eliminar este equipo y todos sus jugadores?")) return;
    try {
      await deleteTeam({ data: { id } });
      await loadTeams();
    } catch (err) {
      console.error("Error deleting team:", err);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between px-4 py-3 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-secondary text-secondary-foreground">
              <Shield />
            </div>
            <div>
              <p className="display-type text-2xl leading-none tracking-wider">
                <span className="text-foreground">ARGEN</span><span className="text-secondary">RETRO</span>
              </p>
              <p className="text-[9px] font-black uppercase tracking-[.28em] text-muted-foreground">
                Panel de administración
              </p>
            </div>
          </div>
          <Link to="/">
            <Button variant="stadium" size="sm">
              <ArrowLeft className="size-4" />
              Volver al juego
            </Button>
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-7">
        {showForm ? (
          <>
            <h1 className="mb-6 text-3xl font-bold">Agregar equipo</h1>
            <TeamForm
              initial={{ club: "", year: new Date().getFullYear(), abbr: "", rating: 85 }}
              onSave={handleAdd}
              onCancel={() => setShowForm(false)}
              saving={saving}
            />
          </>
        ) : loading ? (
          <p className="py-12 text-center text-muted-foreground">Cargando equipos…</p>
        ) : (
          <TeamList
            teams={teams}
            onEdit={(id) => router.navigate({ to: `/admin/teams/$id`, params: { id: String(id) } })}
            onDelete={handleDelete}
            onAdd={() => setShowForm(true)}
          />
        )}
      </div>
    </main>
  );
}
