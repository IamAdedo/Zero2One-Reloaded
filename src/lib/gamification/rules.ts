/**
 * Zero2One gamification rules — single source of truth.
 * Ported from Zero2One-Legacy streak/XP rules (AGENTS.md):
 *  +50 base lesson pass, +20 first-try bonus, +250 capstone,
 *  1.2x @ 7+ days, 1.5x @ 30+ days, max 2 freeze tokens (+1 per 10-day milestone).
 */

export const XP_BASE_LESSON = 50;
export const XP_FIRST_TRY_BONUS = 20;
export const XP_CAPSTONE = 250;
export const MAX_FREEZE_TOKENS = 2;

export function streakMultiplier(streakDays: number): number {
  if (streakDays >= 30) return 1.5;
  if (streakDays >= 7) return 1.2;
  return 1;
}

export function xpForPass(options: {
  streakDays: number;
  firstTry: boolean;
  capstone: boolean;
}): number {
  const base = options.capstone ? XP_CAPSTONE : XP_BASE_LESSON;
  const bonus = options.firstTry && !options.capstone ? XP_FIRST_TRY_BONUS : 0;
  return Math.round((base + bonus) * streakMultiplier(options.streakDays));
}

export interface StreakState {
  currentStreak: number;
  maxStreak: number;
  freezeTokens: number;
  lastActiveDay: string | null; // YYYY-MM-DD (UTC)
}

export type StreakEvent =
  | { type: "activity"; day: string }
  | { type: "gap_closed_with_token"; day: string };

function dayDiff(a: string, b: string): number {
  const ms = Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z");
  return Math.round(ms / 86_400_000);
}

export function nextStreakState(
  prev: StreakState,
  event: StreakEvent,
): StreakState {
  if (event.type === "gap_closed_with_token") {
    if (prev.freezeTokens <= 0 || prev.lastActiveDay === null) return prev;
    return {
      ...prev,
      freezeTokens: prev.freezeTokens - 1,
      lastActiveDay: event.day,
    };
  }
  if (prev.lastActiveDay === null) {
    return { ...prev, currentStreak: 1, maxStreak: 1, lastActiveDay: event.day };
  }
  const gap = dayDiff(prev.lastActiveDay, event.day);
  if (gap <= 0) return prev; // same day: no double-count
  if (gap === 1) {
    const currentStreak = prev.currentStreak + 1;
    const milestone = currentStreak % 10 === 0 && prev.freezeTokens < MAX_FREEZE_TOKENS;
    return {
      currentStreak,
      maxStreak: Math.max(prev.maxStreak, currentStreak),
      freezeTokens: milestone ? prev.freezeTokens + 1 : prev.freezeTokens,
      lastActiveDay: event.day,
    };
  }
  return { ...prev, currentStreak: 1, lastActiveDay: event.day };
}
