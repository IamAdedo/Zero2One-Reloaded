export type LeaderboardMetric = "xp" | "drills";

export interface BoardEntry {
  id: string;
  displayName: string;
  xp: number;
  completedDrills: number;
}

export interface RankedEntry extends BoardEntry {
  rank: number;
}

function scoreOf(entry: BoardEntry, metric: LeaderboardMetric): number {
  return metric === "xp" ? entry.xp : entry.completedDrills;
}

/**
 * Dense ranking: equal scores share a rank, the next distinct score takes
 * the following rank (1, 1, 2 — no gaps, no fake precision).
 */
export function buildLeaderboard(
  entries: readonly BoardEntry[],
  metric: LeaderboardMetric,
  limit: number,
): RankedEntry[] {
  const sorted = [...entries].sort(
    (a, b) =>
      scoreOf(b, metric) - scoreOf(a, metric) ||
      a.displayName.localeCompare(b.displayName),
  );
  const ranked: RankedEntry[] = [];
  let rank = 0;
  let lastScore: number | null = null;
  for (const entry of sorted.slice(0, Math.max(0, limit))) {
    const score = scoreOf(entry, metric);
    if (lastScore === null || score !== lastScore) {
      rank += 1;
      lastScore = score;
    }
    ranked.push({ ...entry, rank });
  }
  return ranked;
}

const COMMUNITY: BoardEntry[] = [
  { id: "ada", displayName: "Ada", xp: 1250, completedDrills: 24 },
  { id: "grace", displayName: "Grace", xp: 980, completedDrills: 31 },
  { id: "linus", displayName: "Linus", xp: 980, completedDrills: 19 },
  { id: "margaret", displayName: "Margaret", xp: 640, completedDrills: 15 },
  { id: "alan", displayName: "Alan", xp: 320, completedDrills: 8 },
];

export function communityBoard(): BoardEntry[] {
  return [...COMMUNITY];
}
