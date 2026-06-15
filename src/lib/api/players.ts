import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

import { getServerConfig } from "../config.server";

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

function getSupabase() {
  const config = getServerConfig();
  return createClient(config.supabaseUrl!, config.supabaseServiceKey!);
}

export const getPlayersByTeam = createServerFn({ method: "GET" })
  .validator(z.object({ teamId: z.coerce.number() }))
  .handler(async ({ data }) => {
    const supabase = getSupabase();
    const { data: players, error } = await supabase
      .from("players")
      .select("*")
      .eq("team_id", data.teamId)
      .order("rating", { ascending: false });
    if (error) throw new Error(error.message);
    return players;
  });

const playerSchema = z.object({
  team_id: z.number(),
  name: z.string().min(1).max(200),
  rating: z.number().int().min(0).max(100),
  position_1: z.enum(VALID_POSITIONS),
  position_2: z.enum(VALID_POSITIONS).nullable().optional(),
  position_3: z.enum(VALID_POSITIONS).nullable().optional(),
});

export const createPlayer = createServerFn({ method: "POST" })
  .validator(playerSchema)
  .handler(async ({ data }) => {
    const supabase = getSupabase();
    const { data: player, error } = await supabase
      .from("players")
      .insert(data)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return player;
  });

export const updatePlayer = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.number(),
      data: playerSchema.partial(),
    }),
  )
  .handler(async ({ data }) => {
    const supabase = getSupabase();
    const { data: player, error } = await supabase
      .from("players")
      .update(data.data)
      .eq("id", data.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return player;
  });

export const deletePlayer = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.number() }))
  .handler(async ({ data }) => {
    const supabase = getSupabase();
    const { error } = await supabase.from("players").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { success: true };
  });
