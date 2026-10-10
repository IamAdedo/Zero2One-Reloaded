import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "zero2one.activity.v1";
const MAX_ENTRIES = 2000;

/** SSR/first-paint empty; stored timestamps load in an effect. */
export function useActivity() {
  const [timestamps, setTimestamps] = useState<readonly string[]>([]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) {
        setTimestamps(
          parsed.filter((t): t is string => typeof t === "string").slice(-MAX_ENTRIES),
        );
      }
    } catch {
      // Storage blocked — activity stays in memory.
    }
  }, []);

  const log = useCallback(() => {
    const at = new Date().toISOString();
    setTimestamps((prev) => {
      const next = [...prev, at].slice(-MAX_ENTRIES);
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore storage failures.
      }
      return next;
    });
  }, []);

  return { timestamps, log };
}
