import { useCallback, useEffect, useState } from "react";

export interface PlacementRecord {
  trackId: string;
  passed: boolean;
  correct: number;
  total: number;
  at: string;
}

const STORAGE_KEY = "zero2one.placement.v1";

function load(): Record<string, PlacementRecord> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, PlacementRecord>;
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

/** SSR/first-paint defaults; stored placements load in an effect. */
export function usePlacement() {
  const [placements, setPlacements] = useState<Record<string, PlacementRecord>>({});

  useEffect(() => {
    setPlacements(load());
  }, []);

  const record = useCallback((rec: PlacementRecord) => {
    setPlacements((prev) => {
      const next = { ...prev, [rec.trackId]: rec };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Storage blocked — placement stays in memory.
      }
      return next;
    });
  }, []);

  return { placements, record };
}
