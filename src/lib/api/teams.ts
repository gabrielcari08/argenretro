import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

import { getServerConfig } from "../config.server";

const VALID_POSITIONS = [
  "GOALKEEPER",
  "CENTRAL DEFENDER",
  "LEFT BACK",
  "RIGHT BACK",
  "DEFENSIVE MIDFIELDER",
  "CENTRAL MIDFIELDER",
  "OFFENSIVE MIDFIELDER",
  "LEFT WING",
  "RIGHT WING",
  "CENTRAL FORWARD",
] as const;

function getSupabase() {
  const config = getServerConfig();
  return createClient(config.supabaseUrl!, config.supabaseServiceKey!);
}

export const getTeams = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getSupabase();
  const { data, error } = await supabase.from("teams").select("*").order("club").order("year");
  if (error) throw new Error(error.message);
  return data;
});

export const getTeamById = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.coerce.number() }))
  .handler(async ({ data }) => {
    const supabase = getSupabase();
    const { data: team, error } = await supabase
      .from("teams")
      .select("*, players(*)")
      .eq("id", data.id)
      .single();
    if (error) throw new Error(error.message);
    return team;
  });

export const getTeamsWithPlayers = createServerFn({ method: "GET" }).handler(async () => {
  const supabase = getSupabase();
  const { data: teams, error } = await supabase
    .from("teams")
    .select("*, players(*)")
    .order("club")
    .order("year");
  if (error) throw new Error(error.message);
  return teams;
});

const teamSchema = z.object({
  club: z.string().min(1).max(100),
  year: z.number().int().min(1900).max(2030),
  abbr: z.string().min(1).max(10),
  rating: z.number().int().min(0).max(100),
});

export const createTeam = createServerFn({ method: "POST" })
  .validator(teamSchema)
  .handler(async ({ data }) => {
    const supabase = getSupabase();
    const { data: team, error } = await supabase
      .from("teams")
      .insert(data)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return team;
  });

export const updateTeam = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.number(), data: teamSchema.partial() }))
  .handler(async ({ data }) => {
    const supabase = getSupabase();
    const { data: team, error } = await supabase
      .from("teams")
      .update(data.data)
      .eq("id", data.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return team;
  });

export const deleteTeam = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.number() }))
  .handler(async ({ data }) => {
    const supabase = getSupabase();
    const { error } = await supabase.from("teams").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });
