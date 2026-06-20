import type { ValidPosition, Player } from "@/types";

export function getAvailablePositions(player: Player): ValidPosition[] {
  return [player.position_1, player.position_2, player.position_3].filter(
    (p): p is ValidPosition => p !== null,
  );
}

export function getCompatibleSlots(
  positions: ValidPosition[],
  takenSlots: number[],
  slotPositionMap: Record<ValidPosition, number[]>,
): number[] {
  const candidateSlots = new Set<number>();
  for (const pos of positions) {
    const slots = slotPositionMap[pos];
    if (slots) {
      for (const slot of slots) {
        candidateSlots.add(slot);
      }
    }
  }
  return [...candidateSlots].filter((slot) => !takenSlots.includes(slot)).sort();
}
