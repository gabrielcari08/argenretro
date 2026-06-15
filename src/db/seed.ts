import { createClient } from "@supabase/supabase-js";
import teamsData from "../data/historic-teams.json";

type RawTeam = { id: string; club: string; year: number; abbr: string; rating: number; players: [string, number][] };

const POSITIONS = [
  "GOALKEEPER",
  "CENTRAL DEFENDER",
  "DEFENSIVE MIDFIELDER",
  "CENTRAL MIDFIELDER",
  "OFFENSIVE MIDFIELDER",
  "LEFT WING",
  "RIGHT WING",
  "CENTRAL FORWARD",
] as const;

const positionsForIndex: (typeof POSITIONS[number])[] = [
  "GOALKEEPER",
  "CENTRAL DEFENDER",
  "CENTRAL MIDFIELDER",
  "OFFENSIVE MIDFIELDER",
  "RIGHT WING",
  "CENTRAL FORWARD",
];

const altPositions: (typeof POSITIONS[number] | null)[] = [
  null,
  "DEFENSIVE MIDFIELDER",
  "DEFENSIVE MIDFIELDER",
  "CENTRAL MIDFIELDER",
  "LEFT WING",
  null,
];

async function seed() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    console.error("Faltan SUPABASE_URL y/o SUPABASE_SERVICE_KEY en .env");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  console.log("Clearing existing data…");
  await supabase.from("players").delete().neq("id", 0);
  await supabase.from("teams").delete().neq("id", 0);

  const rawTeams = teamsData as RawTeam[];

  for (const raw of rawTeams) {
    const { data: inserted, error: teamError } = await supabase
      .from("teams")
      .insert({ club: raw.club, year: raw.year, abbr: raw.abbr, rating: raw.rating })
      .select("id")
      .single();

    if (teamError || !inserted) {
      console.error(`  ✗ Error insertando ${raw.club}:`, teamError);
      continue;
    }

    const playerRows = raw.players.map(([name, rating], index) => ({
      team_id: inserted.id,
      name,
      rating,
      position_1: positionsForIndex[index] ?? "CENTRAL FORWARD",
      position_2: altPositions[index] ?? null,
      position_3: null,
    }));

    const { error: playersError } = await supabase.from("players").insert(playerRows);

    if (playersError) {
      console.error(`  ✗ Error insertando jugadores de ${raw.club}:`, playersError);
      continue;
    }

    console.log(`  ✓ ${raw.club} ${raw.year} → ${raw.players.length} jugadores insertados`);
  }

  console.log(`\nSeed completado: ${rawTeams.length} equipos insertados.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed falló:", err);
  process.exit(1);
});
