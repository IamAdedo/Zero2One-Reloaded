import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  DrillInterface,
  type DrillRunVerdict,
} from "@/components/workspace/DrillInterface";
import { getDrill, getLesson, listDrills, moduleTitleFor } from "@/data/seed";
import type { Drill } from "@/lib/domain/types";
import { runDrill } from "@/server-fns/execute";
import { StreakCounter } from "@/components/gamification/StreakCounter";
import { useLocalStreak } from "@/hooks/useLocalStreak";
import { useAuth } from "@/lib/supabase/auth";
import {
  browserSupabaseConfig,
  getSupabaseBrowserClient,
} from "@/lib/supabase/client";
import { syncPassToRemote } from "@/lib/supabase/progress-sync";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

export const Route = createFileRoute("/workspace/$drillId")({
  loader: ({ params }) => {
    const drill = getDrill(params.drillId);
    if (!drill) throw notFound();
    const lesson = drill.lessonId ? getLesson(drill.lessonId) : undefined;
    return { drill, lesson: lesson ?? null, drills: listDrills() };
  },
  notFoundComponent: WorkspaceNotFound,
  component: WorkspacePage,
});

function WorkspaceNotFound() {
  return (
    <div className="space-y-3 py-12 text-center">
      <p className="font-mono text-sm text-primary">404</p>
      <h1 className="text-2xl font-bold">Drill not found</h1>
      <p className="text-sm text-muted-foreground">
        This drill id does not exist in the seed registry.
      </p>
      <Link
        to="/"
        className="inline-block rounded-md bg-primary px-4 py-2 font-mono text-sm font-semibold text-primary-foreground hover:bg-primary/90"
      >
        ← Back home
      </Link>
    </div>
  );
}

function WorkspacePage() {
  const { drill, lesson, drills } = Route.useLoaderData();
  const openLesson = useWorkspaceStore((s) => s.openLesson);
  const startDrill = useWorkspaceStore((s) => s.startDrill);
  const addXp = useWorkspaceStore((s) => s.addXp);
  const xp = useWorkspaceStore((s) => s.xp);
  const { state: streak, recordActivity } = useLocalStreak();
  const { user } = useAuth();

  useEffect(() => {
    if (lesson) {
      openLesson(lesson, drill);
      startDrill();
    }
  }, [lesson, drill, openLesson, startDrill]);

  async function handleRun(d: Drill, code: string): Promise<DrillRunVerdict[]> {
    const grading = await runDrill({ data: { drillId: d.id, code } });
    const hiddenById = new Map(
      d.content.visibleTests.map((t) => [t.id, t.hidden] as const),
    );
    return grading.results.map((r) => ({
      assertionId: r.id,
      passed: r.passed,
      hidden: hiddenById.get(r.id) ?? true,
      error: r.passed
        ? undefined
        : (r.stderr ?? r.compileOutput ?? "assertion failed"),
    }));
  }

  return (
    <div className="space-y-4">
      <nav className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          Home
        </Link>
        <span>/</span>
        <span>Workspace</span>
        <span>/</span>
        <span className="text-foreground">{drill.id}</span>
        {lesson && (
          <Link
            to="/lessons/$lessonId"
            params={{ lessonId: lesson.id }}
            className="hover:text-foreground"
          >
            ← Review lesson
          </Link>
        )}
        <span className="ml-auto flex items-center gap-3">
          <span className="hidden gap-2 sm:flex">
          {drills
            .filter((d) => d.id !== drill.id)
            .map((d) => (
              <Link
                key={d.id}
                to="/workspace/$drillId"
                params={{ drillId: d.id }}
                className="hover:text-foreground"
              >
                {d.id}
              </Link>
            ))}
          </span>
          <StreakCounter
            currentStreak={streak.currentStreak}
            maxStreak={streak.maxStreak}
            freezeTokens={streak.freezeTokens}
            xp={xp}
          />
        </span>
      </nav>
      <div className="h-[calc(100dvh-12rem)] min-h-[32rem] overflow-hidden rounded-lg border border-border">
        <DrillInterface
          drill={drill}
          moduleTitle={moduleTitleFor(drill.moduleId)}
          onRun={handleRun}
          onPass={(info) => {
            addXp(info.xpEarned);
            recordActivity();
            void syncPassToRemote(
              getSupabaseBrowserClient(browserSupabaseConfig()),
              user?.id ?? null,
              drill,
            );
          }}
        />
      </div>
    </div>
  );
}
