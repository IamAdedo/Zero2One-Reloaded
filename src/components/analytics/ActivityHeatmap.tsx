import { useMemo, useState } from "react";
import { buildHeatmap } from "@/lib/activity/heatmap";

const LEVEL_FILL = [
  "var(--muted)",
  "oklch(0.55 0.12 160)",
  "oklch(0.65 0.15 160)",
  "oklch(0.72 0.17 160)",
  "oklch(0.8 0.18 160)",
] as const;

const RANGES = [
  { weeks: 12, label: "3m" },
  { weeks: 26, label: "6m" },
  { weeks: 52, label: "1y" },
] as const;

export function ActivityHeatmap({ timestamps }: { timestamps: readonly string[] }) {
  const [weeks, setWeeks] = useState<number>(26);
  const { cells, stats } = useMemo(
    () => buildHeatmap(timestamps, weeks),
    [timestamps, weeks],
  );

  const columns: Array<typeof cells> = [];
  for (let w = 0; w < weeks; w++) {
    columns.push(cells.slice(w * 7, w * 7 + 7));
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Activity
        </h2>
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r.label}
              onClick={() => setWeeks(r.weeks)}
              className={`rounded px-2 py-0.5 font-mono text-[11px] ${
                weeks === r.weeks
                  ? "bg-primary font-semibold text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
        <svg
          width={columns.length * 13}
          height={7 * 13}
          role="img"
          aria-label={`Learning activity: ${stats.total} completions, ${stats.activeStreak}-day streak`}
        >
          {columns.map((col, wi) =>
            col.map((cell, di) => (
              <rect
                key={`${wi}-${di}`}
                x={wi * 13}
                y={di * 13}
                width={10}
                height={10}
                rx={2}
                fill={LEVEL_FILL[cell.level]}
                opacity={cell.level === 0 ? 0.45 : 1}
              >
                <title>{`${cell.date}: ${cell.count} completion${cell.count === 1 ? "" : "s"}`}</title>
              </rect>
            )),
          )}
        </svg>
      </div>
      <div className="mt-2 flex items-center justify-between font-mono text-[11px] text-muted-foreground">
        <span>
          {stats.total} completions · {stats.activeStreak}-day streak
        </span>
        <span className="flex items-center gap-1">
          less
          {LEVEL_FILL.map((f, i) => (
            <span
              key={i}
              className="inline-block size-2.5 rounded-[2px]"
              style={{ backgroundColor: f }}
            />
          ))}
          more
        </span>
      </div>
    </div>
  );
}
