import { pgTable, serial, varchar, integer } from "drizzle-orm/pg-core";

export const VALID_POSITIONS = [
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

export type ValidPosition = (typeof VALID_POSITIONS)[number];

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  club: varchar("club", { length: 100 }).notNull(),
  year: integer("year").notNull(),
  abbr: varchar("abbr", { length: 10 }).notNull(),
  rating: integer("rating").notNull(),
});

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 200 }).notNull(),
  rating: integer("rating").notNull(),
  position1: varchar("position_1", { length: 30 }).notNull(),
  position2: varchar("position_2", { length: 30 }),
  position3: varchar("position_3", { length: 30 }),
});
