import type { HistoricTeam, Pick } from "@/types";

export function pickRival(teams: HistoricTeam[], excluded: number[] = []): HistoricTeam {
  const pool = teams.filter((team) => !excluded.includes(team.id));
  return pool[Math.floor(Math.random() * pool.length)] ?? teams[0];
}

export function computeLineAverages(picks: Pick[]): { defOvr: number; midOvr: number; atkOvr: number } {
  const defSlots = [0, 1, 2, 3, 4];
  const midSlots = [5, 6, 7];
  const atkSlots = [8, 9, 10];

  const def = picks.filter((p) => defSlots.includes(p.slot));
  const mid = picks.filter((p) => midSlots.includes(p.slot));
  const atk = picks.filter((p) => atkSlots.includes(p.slot));

  return {
    defOvr: def.length ? Math.round(def.reduce((s, p) => s + p.rating, 0) / def.length) : 0,
    midOvr: mid.length ? Math.round(mid.reduce((s, p) => s + p.rating, 0) / mid.length) : 0,
    atkOvr: atk.length ? Math.round(atk.reduce((s, p) => s + p.rating, 0) / atk.length) : 0,
  };
}

export function computeRivalLines(rival: HistoricTeam): { def: number; mid: number; atk: number } {
  if (!rival.players?.length) return { def: rival.rating, mid: rival.rating, atk: rival.rating };

  const defPos = new Set(["GOALKEEPER", "CENTRAL DEFENDER", "LEFT BACK", "RIGHT BACK", "DEFENSIVE MIDFIELDER"]);
  const atkPos = new Set(["OFFENSIVE MIDFIELDER", "LEFT WING", "RIGHT WING", "CENTRAL FORWARD"]);

  let defSum = 0, defCount = 0;
  let midSum = 0, midCount = 0;
  let atkSum = 0, atkCount = 0;

  for (const p of rival.players) {
    if (defPos.has(p.position_1)) { defSum += p.rating; defCount++; }
    else if (atkPos.has(p.position_1)) { atkSum += p.rating; atkCount++; }
    else { midSum += p.rating; midCount++; }
  }

  return {
    def: defCount ? Math.round(defSum / defCount) : rival.rating,
    mid: midCount ? Math.round(midSum / midCount) : rival.rating,
    atk: atkCount ? Math.round(atkSum / atkCount) : rival.rating,
  };
}
