import type { ValidPosition } from "@/types";

export type FormationSlot = {
  code: string;
  label: string;
  validPosition: ValidPosition;
  fieldSpot: string;
};

export type FormationDef = {
  id: string;
  name: string;
  slots: FormationSlot[];
};

export const FORMATIONS: FormationDef[] = [
  {
    id: "4-3-3",
    name: "4-3-3",
    slots: [
      { code: "ARQ", label: "Arquero", validPosition: "GOALKEEPER", fieldSpot: "top-[88%] left-1/2" },
      { code: "LD", label: "Lateral derecho", validPosition: "RIGHT BACK", fieldSpot: "top-[69%] left-[82%]" },
      { code: "DFC", label: "Central derecho", validPosition: "CENTRAL DEFENDER", fieldSpot: "top-[74%] left-[61%]" },
      { code: "DFC", label: "Central izquierdo", validPosition: "CENTRAL DEFENDER", fieldSpot: "top-[74%] left-[39%]" },
      { code: "LI", label: "Lateral izquierdo", validPosition: "LEFT BACK", fieldSpot: "top-[69%] left-[18%]" },
      { code: "MCD", label: "Mediocentro defensivo", validPosition: "DEFENSIVE MIDFIELDER", fieldSpot: "top-[54%] left-1/2" },
      { code: "MC", label: "Volante derecho", validPosition: "CENTRAL MIDFIELDER", fieldSpot: "top-[43%] left-[72%]" },
      { code: "MC", label: "Volante izquierdo", validPosition: "CENTRAL MIDFIELDER", fieldSpot: "top-[43%] left-[28%]" },
      { code: "ED", label: "Extremo derecho", validPosition: "RIGHT WING", fieldSpot: "top-[23%] left-[79%]" },
      { code: "DC", label: "Delantero centro", validPosition: "CENTRAL FORWARD", fieldSpot: "top-[14%] left-1/2" },
      { code: "EI", label: "Extremo izquierdo", validPosition: "LEFT WING", fieldSpot: "top-[23%] left-[21%]" },
    ],
  },
  {
    id: "4-2-3-1",
    name: "4-2-3-1",
    slots: [
      { code: "ARQ", label: "Arquero", validPosition: "GOALKEEPER", fieldSpot: "top-[88%] left-1/2" },
      { code: "LD", label: "Lateral derecho", validPosition: "RIGHT BACK", fieldSpot: "top-[69%] left-[82%]" },
      { code: "DFC", label: "Central derecho", validPosition: "CENTRAL DEFENDER", fieldSpot: "top-[74%] left-[61%]" },
      { code: "DFC", label: "Central izquierdo", validPosition: "CENTRAL DEFENDER", fieldSpot: "top-[74%] left-[39%]" },
      { code: "LI", label: "Lateral izquierdo", validPosition: "LEFT BACK", fieldSpot: "top-[69%] left-[18%]" },
      { code: "MCD", label: "Doble pivote der", validPosition: "DEFENSIVE MIDFIELDER", fieldSpot: "top-[54%] left-[65%]" },
      { code: "MCD", label: "Doble pivote izq", validPosition: "DEFENSIVE MIDFIELDER", fieldSpot: "top-[54%] left-[35%]" },
      { code: "MCO", label: "Enganche", validPosition: "OFFENSIVE MIDFIELDER", fieldSpot: "top-[42%] left-1/2" },
      { code: "ED", label: "Extremo derecho", validPosition: "RIGHT WING", fieldSpot: "top-[24%] left-[82%]" },
      { code: "DC", label: "Delantero centro", validPosition: "CENTRAL FORWARD", fieldSpot: "top-[14%] left-1/2" },
      { code: "EI", label: "Extremo izquierdo", validPosition: "LEFT WING", fieldSpot: "top-[24%] left-[18%]" },
    ],
  },
  {
    id: "4-4-2",
    name: "4-4-2",
    slots: [
      { code: "ARQ", label: "Arquero", validPosition: "GOALKEEPER", fieldSpot: "top-[88%] left-1/2" },
      { code: "LD", label: "Lateral derecho", validPosition: "RIGHT BACK", fieldSpot: "top-[69%] left-[82%]" },
      { code: "DFC", label: "Central derecho", validPosition: "CENTRAL DEFENDER", fieldSpot: "top-[75%] left-[61%]" },
      { code: "DFC", label: "Central izquierdo", validPosition: "CENTRAL DEFENDER", fieldSpot: "top-[75%] left-[39%]" },
      { code: "LI", label: "Lateral izquierdo", validPosition: "LEFT BACK", fieldSpot: "top-[69%] left-[18%]" },
      { code: "MC", label: "Volante derecho", validPosition: "CENTRAL MIDFIELDER", fieldSpot: "top-[48%] left-[72%]" },
      { code: "MC", label: "Volante izquierdo", validPosition: "CENTRAL MIDFIELDER", fieldSpot: "top-[48%] left-[28%]" },
      { code: "ED", label: "Extremo derecho", validPosition: "RIGHT WING", fieldSpot: "top-[38%] left-[82%]" },
      { code: "EI", label: "Extremo izquierdo", validPosition: "LEFT WING", fieldSpot: "top-[38%] left-[18%]" },
      { code: "DC", label: "Delantero centro", validPosition: "CENTRAL FORWARD", fieldSpot: "top-[18%] left-[65%]" },
      { code: "DC", label: "Segundo delantero", validPosition: "CENTRAL FORWARD", fieldSpot: "top-[18%] left-[35%]" },
    ],
  },
  {
    id: "4-1-4-1",
    name: "4-1-4-1",
    slots: [
      { code: "ARQ", label: "Arquero", validPosition: "GOALKEEPER", fieldSpot: "top-[88%] left-1/2" },
      { code: "LD", label: "Lateral derecho", validPosition: "RIGHT BACK", fieldSpot: "top-[69%] left-[82%]" },
      { code: "DFC", label: "Central derecho", validPosition: "CENTRAL DEFENDER", fieldSpot: "top-[74%] left-[61%]" },
      { code: "DFC", label: "Central izquierdo", validPosition: "CENTRAL DEFENDER", fieldSpot: "top-[74%] left-[39%]" },
      { code: "LI", label: "Lateral izquierdo", validPosition: "LEFT BACK", fieldSpot: "top-[69%] left-[18%]" },
      { code: "MCD", label: "Mediocentro defensivo", validPosition: "DEFENSIVE MIDFIELDER", fieldSpot: "top-[56%] left-1/2" },
      { code: "MC", label: "Volante derecho", validPosition: "CENTRAL MIDFIELDER", fieldSpot: "top-[46%] left-[72%]" },
      { code: "MC", label: "Volante izquierdo", validPosition: "CENTRAL MIDFIELDER", fieldSpot: "top-[46%] left-[28%]" },
      { code: "ED", label: "Extremo derecho", validPosition: "RIGHT WING", fieldSpot: "top-[26%] left-[82%]" },
      { code: "DC", label: "Delantero centro", validPosition: "CENTRAL FORWARD", fieldSpot: "top-[14%] left-1/2" },
      { code: "EI", label: "Extremo izquierdo", validPosition: "LEFT WING", fieldSpot: "top-[26%] left-[18%]" },
    ],
  },
  {
    id: "4-4-2-diamond",
    name: "4-4-2 Diamante",
    slots: [
      { code: "ARQ", label: "Arquero", validPosition: "GOALKEEPER", fieldSpot: "top-[88%] left-1/2" },
      { code: "LD", label: "Lateral derecho", validPosition: "RIGHT BACK", fieldSpot: "top-[69%] left-[82%]" },
      { code: "DFC", label: "Central derecho", validPosition: "CENTRAL DEFENDER", fieldSpot: "top-[74%] left-[61%]" },
      { code: "DFC", label: "Central izquierdo", validPosition: "CENTRAL DEFENDER", fieldSpot: "top-[74%] left-[39%]" },
      { code: "LI", label: "Lateral izquierdo", validPosition: "LEFT BACK", fieldSpot: "top-[69%] left-[18%]" },
      { code: "MCD", label: "Mediocentro defensivo", validPosition: "DEFENSIVE MIDFIELDER", fieldSpot: "top-[56%] left-1/2" },
      { code: "MC", label: "Volante derecho", validPosition: "CENTRAL MIDFIELDER", fieldSpot: "top-[46%] left-[72%]" },
      { code: "MC", label: "Volante izquierdo", validPosition: "CENTRAL MIDFIELDER", fieldSpot: "top-[46%] left-[28%]" },
      { code: "MCO", label: "Enganche", validPosition: "OFFENSIVE MIDFIELDER", fieldSpot: "top-[36%] left-1/2" },
      { code: "DC", label: "Delantero centro", validPosition: "CENTRAL FORWARD", fieldSpot: "top-[18%] left-[65%]" },
      { code: "DC", label: "Segundo delantero", validPosition: "CENTRAL FORWARD", fieldSpot: "top-[18%] left-[35%]" },
    ],
  },
  {
    id: "3-4-3",
    name: "3-4-3",
    slots: [
      { code: "ARQ", label: "Arquero", validPosition: "GOALKEEPER", fieldSpot: "top-[88%] left-1/2" },
      { code: "DFC", label: "Central", validPosition: "CENTRAL DEFENDER", fieldSpot: "top-[72%] left-1/2" },
      { code: "DFC", label: "Central izquierdo", validPosition: "CENTRAL DEFENDER", fieldSpot: "top-[76%] left-[28%]" },
      { code: "DFC", label: "Central derecho", validPosition: "CENTRAL DEFENDER", fieldSpot: "top-[76%] left-[72%]" },
      { code: "MC", label: "Volante izquierdo", validPosition: "CENTRAL MIDFIELDER", fieldSpot: "top-[52%] left-[28%]" },
      { code: "MC", label: "Volante derecho", validPosition: "CENTRAL MIDFIELDER", fieldSpot: "top-[52%] left-[72%]" },
      { code: "EI", label: "Carrilero izquierdo", validPosition: "LEFT WING", fieldSpot: "top-[44%] left-[12%]" },
      { code: "ED", label: "Carrilero derecho", validPosition: "RIGHT WING", fieldSpot: "top-[44%] left-[88%]" },
      { code: "MCO", label: "Mediapunta izq", validPosition: "OFFENSIVE MIDFIELDER", fieldSpot: "top-[34%] left-[38%]" },
      { code: "DC", label: "Delantero centro", validPosition: "CENTRAL FORWARD", fieldSpot: "top-[16%] left-1/2" },
      { code: "MCO", label: "Mediapunta der", validPosition: "OFFENSIVE MIDFIELDER", fieldSpot: "top-[34%] left-[62%]" },
    ],
  },
  {
    id: "3-5-2",
    name: "3-5-2",
    slots: [
      { code: "ARQ", label: "Arquero", validPosition: "GOALKEEPER", fieldSpot: "top-[88%] left-1/2" },
      { code: "DFC", label: "Central", validPosition: "CENTRAL DEFENDER", fieldSpot: "top-[72%] left-1/2" },
      { code: "DFC", label: "Central izquierdo", validPosition: "CENTRAL DEFENDER", fieldSpot: "top-[76%] left-[28%]" },
      { code: "DFC", label: "Central derecho", validPosition: "CENTRAL DEFENDER", fieldSpot: "top-[76%] left-[72%]" },
      { code: "MCD", label: "Mediocentro defensivo", validPosition: "DEFENSIVE MIDFIELDER", fieldSpot: "top-[56%] left-1/2" },
      { code: "MC", label: "Volante izquierdo", validPosition: "CENTRAL MIDFIELDER", fieldSpot: "top-[46%] left-[28%]" },
      { code: "MC", label: "Volante derecho", validPosition: "CENTRAL MIDFIELDER", fieldSpot: "top-[46%] left-[72%]" },
      { code: "EI", label: "Carrilero izquierdo", validPosition: "LEFT WING", fieldSpot: "top-[38%] left-[12%]" },
      { code: "ED", label: "Carrilero derecho", validPosition: "RIGHT WING", fieldSpot: "top-[38%] left-[88%]" },
      { code: "DC", label: "Delantero centro", validPosition: "CENTRAL FORWARD", fieldSpot: "top-[18%] left-[65%]" },
      { code: "DC", label: "Segundo delantero", validPosition: "CENTRAL FORWARD", fieldSpot: "top-[18%] left-[35%]" },
    ],
  },
  {
    id: "5-4-1",
    name: "5-4-1",
    slots: [
      { code: "ARQ", label: "Arquero", validPosition: "GOALKEEPER", fieldSpot: "top-[88%] left-1/2" },
      { code: "DFC", label: "Central", validPosition: "CENTRAL DEFENDER", fieldSpot: "top-[72%] left-1/2" },
      { code: "DFC", label: "Central izquierdo", validPosition: "CENTRAL DEFENDER", fieldSpot: "top-[76%] left-[30%]" },
      { code: "DFC", label: "Central derecho", validPosition: "CENTRAL DEFENDER", fieldSpot: "top-[76%] left-[70%]" },
      { code: "LI", label: "Lateral izquierdo", validPosition: "LEFT BACK", fieldSpot: "top-[69%] left-[14%]" },
      { code: "LD", label: "Lateral derecho", validPosition: "RIGHT BACK", fieldSpot: "top-[69%] left-[86%]" },
      { code: "MC", label: "Volante derecho", validPosition: "CENTRAL MIDFIELDER", fieldSpot: "top-[50%] left-[72%]" },
      { code: "MC", label: "Volante izquierdo", validPosition: "CENTRAL MIDFIELDER", fieldSpot: "top-[50%] left-[28%]" },
      { code: "ED", label: "Extremo derecho", validPosition: "RIGHT WING", fieldSpot: "top-[40%] left-[84%]" },
      { code: "DC", label: "Delantero centro", validPosition: "CENTRAL FORWARD", fieldSpot: "top-[16%] left-1/2" },
      { code: "EI", label: "Extremo izquierdo", validPosition: "LEFT WING", fieldSpot: "top-[40%] left-[16%]" },
    ],
  },
  {
    id: "5-3-2",
    name: "5-3-2",
    slots: [
      { code: "ARQ", label: "Arquero", validPosition: "GOALKEEPER", fieldSpot: "top-[88%] left-1/2" },
      { code: "DFC", label: "Central", validPosition: "CENTRAL DEFENDER", fieldSpot: "top-[72%] left-1/2" },
      { code: "DFC", label: "Central izquierdo", validPosition: "CENTRAL DEFENDER", fieldSpot: "top-[76%] left-[28%]" },
      { code: "DFC", label: "Central derecho", validPosition: "CENTRAL DEFENDER", fieldSpot: "top-[76%] left-[72%]" },
      { code: "LI", label: "Lateral izquierdo", validPosition: "LEFT BACK", fieldSpot: "top-[69%] left-[14%]" },
      { code: "LD", label: "Lateral derecho", validPosition: "RIGHT BACK", fieldSpot: "top-[69%] left-[86%]" },
      { code: "MCD", label: "Mediocentro defensivo", validPosition: "DEFENSIVE MIDFIELDER", fieldSpot: "top-[56%] left-1/2" },
      { code: "MC", label: "Volante derecho", validPosition: "CENTRAL MIDFIELDER", fieldSpot: "top-[46%] left-[72%]" },
      { code: "MC", label: "Volante izquierdo", validPosition: "CENTRAL MIDFIELDER", fieldSpot: "top-[46%] left-[28%]" },
      { code: "DC", label: "Delantero centro", validPosition: "CENTRAL FORWARD", fieldSpot: "top-[18%] left-[65%]" },
      { code: "DC", label: "Segundo delantero", validPosition: "CENTRAL FORWARD", fieldSpot: "top-[18%] left-[35%]" },
    ],
  },
];

export function getFormationById(id: string): FormationDef | undefined {
  return FORMATIONS.find((f) => f.id === id);
}

export function buildSlotPositionMap(formation: FormationDef): Record<ValidPosition, number[]> {
  const map: Record<string, number[]> = {
    GOALKEEPER: [],
    "RIGHT BACK": [],
    "CENTRAL DEFENDER": [],
    "LEFT BACK": [],
    "DEFENSIVE MIDFIELDER": [],
    "CENTRAL MIDFIELDER": [],
    "OFFENSIVE MIDFIELDER": [],
    "RIGHT WING": [],
    "CENTRAL FORWARD": [],
    "LEFT WING": [],
  };
  formation.slots.forEach((slot, index) => {
    map[slot.validPosition].push(index);
  });
  return map as Record<ValidPosition, number[]>;
}
