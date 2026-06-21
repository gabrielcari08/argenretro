import type { VALID_POSITIONS } from "./db/schema";

export type ValidPosition = (typeof VALID_POSITIONS)[number];

export type HistoricTeam = {
  id: number;
  club: string;
  year: number;
  abbr: string;
  rating: number;
  players?: Player[];
};

export type Player = {
  id: number;
  team_id: number;
  name: string;
  rating: number;
  position_1: ValidPosition;
  position_2: ValidPosition | null;
  position_3: ValidPosition | null;
};

export type Pick = {
  name: string;
  rating: number;
  teamId: number;
  club: string;
  year: number;
  abbr: string;
  position: string;
  slot: number;
};

export type Match = {
  round: string;
  rival: string;
  rivalRating: number;
  userGoals: number;
  rivalGoals: number;
  scorers: string[];
  possession: number;
  shots: number;
  won: boolean;
};

export type LiveEvent = {
  minute: number;
  text: string;
  side: "user" | "rival" | "neutral";
  goal?: boolean;
};

export type LiveMatch = {
  match: Match;
  events: LiveEvent[];
};

export type GameMode = "ayudin" | "macaya";

export type Phase = "build" | "positioning" | "ready" | "live" | "result" | "upgrade" | "lost" | "champion";

export type PendingPlayer = {
  name: string;
  rating: number;
  teamId: number;
  club: string;
  year: number;
  abbr: string;
  positions: ValidPosition[];
};

export type SavedGame = {
  picks: Pick[];
  round: number;
  matches: Match[];
  phase: Phase;
  formationId: string;
  gameMode: GameMode;
  pendingPlayer?: PendingPlayer | null;
};
