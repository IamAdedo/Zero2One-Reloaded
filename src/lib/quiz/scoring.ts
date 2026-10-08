import { supportsPartialCredit } from "@/lib/quiz/registry";
import type {
  MultipleChoiceOption,
  UnitTestVerdictSchema,
} from "@/lib/quiz/schemas";
import type { z } from "zod";

type UnitTestVerdict = z.infer<typeof UnitTestVerdictSchema>;

export interface GradedResult {
  score: number;
  maxPoints: number;
  passed: boolean;
}

function clampScore(raw: number, maxPoints: number): number {
  if (!Number.isFinite(raw) || raw < 0) return 0;
  return Math.min(Math.round(raw * 100) / 100, maxPoints);
}

export function scoreMultipleChoice(
  options: readonly MultipleChoiceOption[],
  selectedIds: readonly string[],
  maxPoints: number,
): GradedResult {
  if (maxPoints <= 0) return { score: 0, maxPoints: 0, passed: false };

  const correctIds = new Set(
    options.filter((o) => o.isCorrect).map((o) => o.id),
  );
  if (correctIds.size === 0) return { score: 0, maxPoints, passed: false };

  const selected = new Set(selectedIds);
  let correctSelected = 0;
  let wrongSelected = 0;
  for (const id of selected) {
    if (correctIds.has(id)) correctSelected += 1;
    else wrongSelected += 1;
  }

  if (!supportsPartialCredit("multiple_choice")) {
    const passed =
      correctSelected === correctIds.size && wrongSelected === 0;
    return { score: passed ? maxPoints : 0, maxPoints, passed };
  }

  const incorrectPool = Math.max(1, options.length - correctIds.size);
  const ratio =
    correctSelected / correctIds.size - wrongSelected / incorrectPool;
  const score = clampScore(Math.max(0, ratio) * maxPoints, maxPoints);
  return { score, maxPoints, passed: score >= maxPoints };
}

export interface UnitTestSuiteSummary {
  passed: number;
  failed: number;
  hiddenFailed: number;
  allPassed: boolean;
}

export function summarizeUnitTests(
  verdicts: readonly UnitTestVerdict[],
): UnitTestSuiteSummary {
  let passed = 0;
  let hiddenFailed = 0;
  for (const v of verdicts) {
    if (v.passed) passed += 1;
    else if (v.hidden) hiddenFailed += 1;
  }
  return {
    passed,
    failed: verdicts.length - passed,
    hiddenFailed,
    allPassed: verdicts.length > 0 && passed === verdicts.length,
  };
}

export function scoreUnitTests(
  verdicts: readonly UnitTestVerdict[],
  maxPoints: number,
): GradedResult {
  if (maxPoints <= 0) return { score: 0, maxPoints: 0, passed: false };
  const summary = summarizeUnitTests(verdicts);
  const passed = summary.allPassed;
  return { score: passed ? maxPoints : 0, maxPoints, passed };
}

export function scoreDiffVerification(
  output: string,
  expected: string,
  maxPoints: number,
): GradedResult {
  if (maxPoints <= 0) return { score: 0, maxPoints: 0, passed: false };
  const passed =
    output.trim().replace(/\r\n/g, "\n") ===
    expected.trim().replace(/\r\n/g, "\n");
  return { score: passed ? maxPoints : 0, maxPoints, passed };
}
