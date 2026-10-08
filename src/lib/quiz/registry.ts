import type { DrillKind } from "@/lib/domain/types";

export interface DrillKindMetadata {
  kind: DrillKind;
  label: string;
  autoGradable: boolean;
  supportsPartialCredit: boolean;
  manualGradingRequired: boolean;
  description: string;
}

export const DRILL_KIND_REGISTRY: readonly DrillKindMetadata[] = [
  {
    kind: "unit_test",
    label: "Code drill",
    autoGradable: true,
    supportsPartialCredit: false,
    manualGradingRequired: false,
    description: "Starter code graded against visible and hidden test assertions.",
  },
  {
    kind: "multiple_choice",
    label: "Multiple choice",
    autoGradable: true,
    supportsPartialCredit: true,
    manualGradingRequired: false,
    description: "Single- or multi-select options with optional partial credit.",
  },
  {
    kind: "diff_verification",
    label: "Exact output",
    autoGradable: true,
    supportsPartialCredit: false,
    manualGradingRequired: false,
    description: "Learner output compared verbatim against the expected output.",
  },
  {
    kind: "prompt_spec_eval",
    label: "Prompt spec eval",
    autoGradable: false,
    supportsPartialCredit: false,
    manualGradingRequired: false,
    description: "AI-judged prompt submission evaluated against acceptance criteria.",
  },
  {
    kind: "manual_review",
    label: "Manual review",
    autoGradable: false,
    supportsPartialCredit: false,
    manualGradingRequired: true,
    description: "Teacher-graded submission for cohorts and capstones.",
  },
] as const;

export const DRILL_KIND_BY_KEY: Readonly<Record<DrillKind, DrillKindMetadata>> =
  Object.freeze(
    Object.fromEntries(
      DRILL_KIND_REGISTRY.map((meta) => [meta.kind, meta]),
    ) as Record<DrillKind, DrillKindMetadata>,
  );

export function isAutoGradable(kind: DrillKind): boolean {
  return DRILL_KIND_BY_KEY[kind].autoGradable;
}

export function supportsPartialCredit(kind: DrillKind): boolean {
  return DRILL_KIND_BY_KEY[kind].supportsPartialCredit;
}
