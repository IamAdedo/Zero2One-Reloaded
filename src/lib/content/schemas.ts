import { z } from "zod";

export const LessonContentSchema = z.object({
  markdown: z.string().min(1),
  keyTakeaways: z.array(z.string()).min(1).max(12),
  demoCode: z.string(),
  demoLanguage: z.string().min(1),
});

export const TestAssertionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  hidden: z.boolean(),
  stdin: z.string().max(20_000).optional(),
  expectedStdout: z.string().max(20_000).optional(),
});

export const DrillContentSchema = z.object({
  instructions: z.string().min(1),
  starterCode: z.string(),
  language: z.string().min(1),
  visibleTests: z.array(TestAssertionSchema),
  hiddenTestCount: z.number().int().min(0),
});

export type LessonContentInput = z.infer<typeof LessonContentSchema>;
export type DrillContentInput = z.infer<typeof DrillContentSchema>;
