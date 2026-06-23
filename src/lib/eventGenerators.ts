import type { LiveEvent, PenaltyKick } from "@/types";
import * as T from "@/data/commentaryTemplates";

export function generatePenaltyEvents(kicks: PenaltyKick[], startMinute: number, rivalClub?: string): LiveEvent[] {
  const events: LiveEvent[] = [];
  events.push({ minute: startMinute, text: T.penaltyStart(), side: "neutral" });

  for (let i = 0; i < kicks.length; i++) {
    const kick = kicks[i];
    events.push({
      minute: startMinute + 1 + i,
      text: kick.scored ? `¡GOL de ${kick.shooter}!` : `${kick.shooter} falla el penal`,
      side: kick.shooterTeam,
      goal: kick.scored,
    });
  }

  const lastKick = kicks[kicks.length - 1];
  const wonPenalties = lastKick.shooterTeam === "user" && lastKick.scored;
  events.push({
    minute: startMinute + kicks.length + 1,
    text: wonPenalties ? T.penaltyWon() : T.penaltyLost(rivalClub ?? "El rival"),
    side: wonPenalties ? "user" : "rival",
  });

  return events;
}

export function generateGoalMinutes(totalGoals: number): number[] {
  if (totalGoals === 0) return [];
  return Array.from({ length: totalGoals }, (_, index) =>
    8 + Math.floor((index + 1) * 78 / (totalGoals + 1)) + Math.floor(Math.random() * 7) - 3,
  ).sort((a, b) => a - b);
}
