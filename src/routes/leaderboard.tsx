import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Crown, Medal } from "lucide-react";
import {
  buildLeaderboard,
  communityBoard,
  type LeaderboardMetric,
} from "@/lib/leaderboard/ranking";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

export const Route = createFileRoute("/leaderboard")({
  component: LeaderboardPage,
});

const METRICS: Array<{ key: LeaderboardMetric; label: string }> = [
  { key: "xp", label: "Total XP" },
  { key: "drills", label: "Drills passed" },
];

function LeaderboardPage() {
  const [metric, setMetric] = useState<LeaderboardMetric>("xp");
  const xp = useWorkspaceStore((s) => s.xp);
  const entries = [...communityBoard()];
  if (xp > 0) entries.push({ id: "you", displayName: "You", xp, completedDrills: 0 });
  const board = buildLeaderboard(entries, metric, 20);
  const [first, second, third] = board;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-1 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">
          Community
        </p>
        <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
        <div className="flex justify-center gap-2 pt-2">
          {METRICS.map((m) => (
            <button
              key={m.key}
              onClick={() => setMetric(m.key)}
              className={`rounded-md px-3 py-1.5 font-mono text-xs transition ${
                metric === m.key
                  ? "bg-primary font-semibold text-primary-foreground"
                  : "border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {first && (
        <div className="grid grid-cols-3 items-end gap-2 text-center">
          <PodiumStep entry={second} height="h-20" medal="2nd" />
          <PodiumStep entry={first} height="h-28" medal="1st" crown />
          <PodiumStep entry={third} height="h-16" medal="3rd" />
        </div>
      )}

      <ol className="space-y-2">
        {board.map((entry) => (
          <li
            key={entry.id}
            className={`flex items-center gap-3 rounded-lg border px-4 py-2.5 text-sm ${
              entry.id === "you"
                ? "border-primary/50 bg-primary/5 font-semibold"
                : "border-border/60 bg-card"
            }`}
          >
            <span className="w-8 font-mono text-xs text-muted-foreground">
              #{entry.rank}
            </span>
            <span className="flex-1">{entry.displayName}</span>
            <span className="font-mono text-xs text-muted-foreground">
              {metric === "xp" ? `${entry.xp} XP` : `${entry.completedDrills} drills`}
            </span>
          </li>
        ))}
      </ol>
      <p className="text-center font-mono text-[11px] text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          ← Home
        </Link>
      </p>
    </div>
  );
}

function PodiumStep({
  entry,
  height,
  medal,
  crown = false,
}: {
  entry: { displayName: string; xp: number; completedDrills: number } | undefined;
  height: string;
  medal: string;
  crown?: boolean;
}) {
  if (!entry) return <div />;
  return (
    <div className="space-y-1">
      {crown && <Crown className="mx-auto size-5 text-amber-300" />}
      <div
        className={`flex ${height} flex-col items-center justify-end rounded-t-lg border border-b-0 border-border bg-card p-2`}
      >
        <Medal className="size-4 text-muted-foreground" />
        <p className="truncate text-sm font-semibold">{entry.displayName}</p>
        <p className="font-mono text-[11px] text-muted-foreground">{medal}</p>
      </div>
    </div>
  );
}
