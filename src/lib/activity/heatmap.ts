export interface HeatCell {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
  inFuture: boolean;
}

export interface HeatStats {
  total: number;
  activeStreak: number;
  dailyAverage: number;
  activeDays: number;
}

export function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function levelFor(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count <= 3) return 2;
  if (count <= 5) return 3;
  return 4;
}

/**
 * Builds a weeks×7 grid ending on `today`. Completions are ISO timestamps;
 * anything after today is ignored, future cells are flagged for dimming.
 */
export function buildHeatmap(
  completions: readonly string[],
  weeks: number,
  today: Date = new Date(),
): { cells: HeatCell[]; stats: HeatStats } {
  const counts = new Map<string, number>();
  const todayKey = dayKey(today);
  for (const at of completions) {
    const key = at.slice(0, 10);
    if (key > todayKey) continue;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const end = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
  const totalDays = weeks * 7;
  const start = new Date(end.getTime() - (totalDays - 1) * 86_400_000);

  const cells: HeatCell[] = [];
  let total = 0;
  const activeSet = new Set<string>();
  for (let i = 0; i < totalDays; i++) {
    const date = new Date(start.getTime() + i * 86_400_000);
    const key = dayKey(date);
    const count = counts.get(key) ?? 0;
    total += count;
    if (count > 0) activeSet.add(key);
    cells.push({ date: key, count, level: levelFor(count), inFuture: false });
  }

  let activeStreak = 0;
  const cursor = new Date(end.getTime());
  if (!activeSet.has(dayKey(cursor))) cursor.setUTCDate(cursor.getUTCDate() - 1);
  while (activeSet.has(dayKey(cursor))) {
    activeStreak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return {
    cells,
    stats: {
      total,
      activeStreak,
      dailyAverage: totalDays > 0 ? Math.round((total / totalDays) * 100) / 100 : 0,
      activeDays: activeSet.size,
    },
  };
}
