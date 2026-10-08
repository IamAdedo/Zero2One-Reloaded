import { useCallback, useEffect, useState } from "react";
import {
  nextStreakState,
  type StreakState,
} from "@/lib/gamification/rules";

const STORAGE_KEY = "zero2one.streak.v1";

const INITIAL: StreakState = {
  currentStreak: 0,
  maxStreak: 0,
  freezeTokens: 0,
  lastActiveDay: null,
};

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

function load(): StreakState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL;
    const parsed = JSON.parse(raw) as Partial<StreakState>;
    return {
      currentStreak:
        typeof parsed.currentStreak === "number" ? parsed.currentStreak : 0,
      maxStreak: typeof parsed.maxStreak === "number" ? parsed.maxStreak : 0,
      freezeTokens:
        typeof parsed.freezeTokens === "number" ? parsed.freezeTokens : 0,
      lastActiveDay:
        typeof parsed.lastActiveDay === "string" ? parsed.lastActiveDay : null,
    };
  } catch {
    return INITIAL;
  }
}

/**
 * Offline-first daily streak. SSR and first client paint use the same
 * defaults (no hydration mismatch); stored state loads in an effect.
 */
export function useLocalStreak() {
  const [state, setState] = useState<StreakState>(INITIAL);

  useEffect(() => {
    setState(load());
  }, []);

  const recordActivity = useCallback(() => {
    setState((prev) => {
      const next = nextStreakState(prev, { type: "activity", day: todayUtc() });
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Storage blocked (private mode / shields) — streak stays in memory.
      }
      return next;
    });
  }, []);

  return { state, recordActivity };
}
