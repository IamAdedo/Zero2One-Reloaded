export const PLACEMENT_PASS_COUNT = 2;
export const PLACEMENT_QUESTION_COUNT = 3;
export const PLACEMENT_XP = 25;

export interface PlacementOutcome {
  correct: number;
  total: number;
  passed: boolean;
  xpAwarded: number;
}

export function gradePlacement(correct: number, total: number): PlacementOutcome {
  const passed = total >= PLACEMENT_QUESTION_COUNT && correct >= PLACEMENT_PASS_COUNT;
  return { correct, total, passed, xpAwarded: passed ? PLACEMENT_XP : 0 };
}
