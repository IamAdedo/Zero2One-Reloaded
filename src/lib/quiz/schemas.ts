import { z } from "zod";

export const MultipleChoiceOptionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  isCorrect: z.boolean(),
});

export const MultipleChoiceSubmissionSchema = z.object({
  kind: z.literal("multiple_choice"),
  selectedIds: z.array(z.string()).max(32),
});

export const UnitTestVerdictSchema = z.object({
  assertionId: z.string().min(1),
  passed: z.boolean(),
  hidden: z.boolean(),
});

export const UnitTestSubmissionSchema = z.object({
  kind: z.literal("unit_test"),
  verdicts: z.array(UnitTestVerdictSchema).min(1).max(128),
});

export const DiffSubmissionSchema = z.object({
  kind: z.literal("diff_verification"),
  output: z.string().max(100_000),
  expected: z.string().max(100_000),
});

export const QuizSubmissionSchema = z.discriminatedUnion("kind", [
  MultipleChoiceSubmissionSchema,
  UnitTestSubmissionSchema,
  DiffSubmissionSchema,
]);

export type QuizSubmission = z.infer<typeof QuizSubmissionSchema>;
export type MultipleChoiceOption = z.infer<typeof MultipleChoiceOptionSchema>;
