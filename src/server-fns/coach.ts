import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  buildGeminiBody,
  localExpertReply,
  parseGeminiReply,
  type CoachContext,
  type CoachResponse,
} from "@/server/coach";

const CoachContextSchema = z.object({
  trackTitle: z.string().max(120).optional(),
  language: z.string().max(32).optional(),
  lessonTitle: z.string().max(160).optional(),
  streak: z.number().int().min(0).max(10000).optional(),
  xpTotal: z.number().int().min(0).max(10_000_000).optional(),
});

const AskCoachInput = z.object({
  message: z.string().min(1).max(2000),
  context: CoachContextSchema.optional(),
});

const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_TIMEOUT_MS = 20_000;

export const askCoach = createServerFn({ method: "POST" })
  .validator(AskCoachInput)
  .handler(async ({ data }): Promise<CoachResponse> => {
    const ctx: CoachContext = data.context ?? {};
    const fallback = localExpertReply(data.message, ctx);

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) return { ...fallback, provider: "local_expert" };

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(buildGeminiBody(data.message, ctx)),
          signal: AbortSignal.timeout(GEMINI_TIMEOUT_MS),
        },
      );
      if (!res.ok) return { ...fallback, provider: "local_expert" };
      const reply = parseGeminiReply(await res.json());
      if (!reply) return { ...fallback, provider: "local_expert" };
      return {
        reply,
        suggestedFollowUps: fallback.suggestedFollowUps,
        provider: "gemini",
      };
    } catch {
      return { ...fallback, provider: "local_expert" };
    }
  });
