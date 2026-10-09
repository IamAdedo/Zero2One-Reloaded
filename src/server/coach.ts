export interface CoachContext {
  trackTitle?: string;
  language?: string;
  lessonTitle?: string;
  streak?: number;
  xpTotal?: number;
}

export interface CoachReply {
  reply: string;
  suggestedFollowUps: string[];
}

export type CoachProvider = "gemini" | "local_expert";

export interface CoachResponse extends CoachReply {
  provider: CoachProvider;
}

export function localExpertReply(message: string, ctx: CoachContext): CoachReply {
  const q = message.toLowerCase();
  const track = ctx.trackTitle ?? "Software Engineering";
  const lang = ctx.language ?? "Python";
  const streak = ctx.streak ?? 0;

  if (q.includes("study") || q.includes("routine") || q.includes("pace") || q.includes("plan")) {
    return {
      reply: `Study strategy for ${track}: 20 focused minutes daily beats weekly binges (your ${streak}-day streak is the proof). Per drill run three passes — (1) simplest working solution, (2) edge cases (empty input, zero, null), (3) refactor for idiomatic ${lang}. Explain each failing assertion aloud before touching code.`,
      suggestedFollowUps: [
        "How do I balance theory vs coding drills?",
        "Give me an edge case to watch for",
        "Explain the current lesson concept",
      ],
    };
  }

  if (q.includes("hint") || q.includes("stuck") || q.includes("fail") || q.includes("error")) {
    return {
      reply: `Debugging checklist${ctx.lessonTitle ? ` for ${ctx.lessonTitle}` : ""}: (1) match return types exactly against the assertions, (2) try empty/zero/single-item inputs first, (3) keep functions pure — no shared mutable state between test cases. Paste the failing assertion text and I will narrow it down.`,
      suggestedFollowUps: [
        "What edge cases should I test?",
        "Explain how the grader compares output",
        "Show me an idiomatic pattern",
      ],
    };
  }

  if (q.includes("explain") || q.includes("concept") || q.includes("what is") || q.includes("how does")) {
    return {
      reply: `Core idea: separate pure logic from I/O. In ${lang}, keep computation in small testable functions and push reading stdin / printing stdout to the edges — that is exactly what the drill harness rewards. Want a minimal example in ${lang}?`,
      suggestedFollowUps: [
        `Show a ${lang} example`,
        "How is this tested in production?",
        "What are common beginner pitfalls?",
      ],
    };
  }

  return {
    reply: `I coach ${track} hands-on. Ask for a study plan, a debugging hint, or an explanation of the current concept — and tell me which assertion is red if you are stuck.`,
    suggestedFollowUps: [
      "Give me a study plan",
      "I am stuck on a failing test",
      "Explain the current concept",
    ],
  };
}

export function buildGeminiBody(message: string, ctx: CoachContext): unknown {
  const contextLine = `Learner context: track=${ctx.trackTitle ?? "unknown"}, language=${ctx.language ?? "unknown"}, lesson=${ctx.lessonTitle ?? "unknown"}, streak=${ctx.streak ?? 0} days, xp=${ctx.xpTotal ?? 0}.`;
  return {
    contents: [
      {
        parts: [
          {
            text: `You are a senior engineer coaching a student on a coding learning platform. Be concise (under 150 words), never reveal full drill solutions, only hints. ${contextLine} Student: ${message}`,
          },
        ],
      },
    ],
    generationConfig: { maxOutputTokens: 512, temperature: 0.7 },
  };
}

function textOf(part: unknown): string | null {
  if (typeof part !== "object" || part === null) return null;
  const text = (part as { text?: unknown }).text;
  return typeof text === "string" ? text : null;
}

/** Defensive parse of the Gemini generateContent response. Null when unusable. */
export function parseGeminiReply(body: unknown): string | null {
  if (typeof body !== "object" || body === null) return null;
  const candidates = (body as { candidates?: unknown }).candidates;
  if (!Array.isArray(candidates) || candidates.length === 0) return null;
  const first = candidates[0] as { content?: { parts?: unknown } };
  const parts = first.content?.parts;
  if (!Array.isArray(parts)) return null;
  const text = parts.map(textOf).filter((t): t is string => t !== null).join("");
  const trimmed = text.trim();
  return trimmed.length > 0 ? trimmed : null;
}
