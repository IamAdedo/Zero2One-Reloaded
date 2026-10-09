import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, FlaskConical } from "lucide-react";
import { StreakCounter } from "@/components/gamification/StreakCounter";
import { useLocalStreak } from "@/hooks/useLocalStreak";
import { usePlacement } from "@/hooks/usePlacement";
import {
  communityBoard,
  buildLeaderboard,
} from "@/lib/leaderboard/ranking";
import { getTrack, listDrills } from "@/data/seed";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const xp = useWorkspaceStore((s) => s.xp);
  const { state: streak } = useLocalStreak();
  const { placements } = usePlacement();
  const drills = listDrills();
  const top = buildLeaderboard(communityBoard(), "xp", 3);
  const placed = Object.values(placements).filter((p) => p.passed);

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">
          Learner cockpit
        </p>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <StreakCounter
          currentStreak={streak.currentStreak}
          maxStreak={streak.maxStreak}
          freezeTokens={streak.freezeTokens}
          xp={xp}
          variant="card"
        />
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Placements
            </h2>
            {placed.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                No test-outs yet.{" "}
                <Link to="/tracks" className="text-primary hover:underline">
                  Pick a track →
                </Link>
              </p>
            ) : (
              <ul className="mt-2 space-y-1 text-sm">
                {placed.map((p) => (
                  <li key={p.trackId}>
                    {getTrack(p.trackId)?.title ?? p.trackId} — {p.correct}/
                    {p.total} placed out
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Top learners
            </h2>
            <ol className="mt-2 space-y-1 text-sm">
              {top.map((e) => (
                <li key={e.id} className="flex justify-between">
                  <span>
                    #{e.rank} {e.displayName}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {e.xp} XP
                  </span>
                </li>
              ))}
            </ol>
            <Link
              to="/leaderboard"
              className="mt-2 inline-flex items-center gap-1 font-mono text-xs text-primary hover:underline"
            >
              Full board <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <h2 className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <FlaskConical className="size-3.5" />
          Drills
        </h2>
        <ul className="mt-3 space-y-2">
          {drills.map((d) => (
            <li
              key={d.id}
              className="flex items-center gap-2 rounded-md border border-border/60 px-3 py-2 text-sm"
            >
              <Link
                to="/workspace/$drillId"
                params={{ drillId: d.id }}
                className="flex-1 hover:text-primary hover:underline"
              >
                {d.title}
              </Link>
              <span className="font-mono text-[11px] text-muted-foreground">
                {d.content.language}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
