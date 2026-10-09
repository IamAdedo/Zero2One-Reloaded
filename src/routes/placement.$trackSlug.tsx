import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { getTrack, placementQuestionsFor } from "@/data/seed";
import { usePlacement } from "@/hooks/usePlacement";
import { gradePlacement } from "@/lib/placement/rules";
import { scoreMultipleChoice } from "@/lib/quiz/scoring";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

export const Route = createFileRoute("/placement/$trackSlug")({
  loader: ({ params }) => {
    const track = getTrack(params.trackSlug);
    if (!track) throw notFound();
    return { track, questions: placementQuestionsFor(track.id) };
  },
  notFoundComponent: PlacementNotFound,
  component: PlacementPage,
});

function PlacementNotFound() {
  return (
    <div className="space-y-3 py-12 text-center">
      <p className="font-mono text-sm text-primary">404</p>
      <h1 className="text-2xl font-bold">Placement not found</h1>
      <Link
        to="/tracks"
        className="inline-block rounded-md bg-primary px-4 py-2 font-mono text-sm font-semibold text-primary-foreground hover:bg-primary/90"
      >
        ← All tracks
      </Link>
    </div>
  );
}

function PlacementPage() {
  const { track, questions } = Route.useLoaderData();
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const [correct, setCorrect] = useState(0);
  const { record } = usePlacement();
  const addXp = useWorkspaceStore((s) => s.addXp);

  function submit(): void {
    let hits = 0;
    for (const q of questions) {
      const grade = scoreMultipleChoice(
        q.options.map((o) => ({ id: o.id, label: o.label, isCorrect: o.isCorrect })),
        picked[q.id] ? [picked[q.id] as string] : [],
        1,
      );
      if (grade.score >= 1) hits += 1;
    }
    const outcome = gradePlacement(hits, questions.length);
    setCorrect(hits);
    setDone(true);
    if (outcome.passed) {
      addXp(outcome.xpAwarded);
      record({
        trackId: track.id,
        passed: true,
        correct: hits,
        total: questions.length,
        at: new Date().toISOString(),
      });
      toast.success("Placed out of the basics", {
        description: `+${outcome.xpAwarded} XP — jump to the advanced modules.`,
      });
    } else {
      record({
        trackId: track.id,
        passed: false,
        correct: hits,
        total: questions.length,
        at: new Date().toISOString(),
      });
      toast.error("Not yet — start from lesson one", {
        description: `${hits}/${questions.length} correct. The basics will pay off.`,
      });
    }
  }

  if (questions.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-muted-foreground">
        No placement diagnostic for this track yet — start at lesson one.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="space-y-1">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">
          Placement · {track.title}
        </p>
        <h1 className="text-3xl font-bold tracking-tight">Test out</h1>
        <p className="text-sm text-muted-foreground">
          Answer {questions.length} questions. Get at least 2 right to skip the
          basics (+25 XP).
        </p>
      </div>
      {questions.map((q, qi) => (
        <fieldset
          key={q.id}
          disabled={done}
          className="rounded-lg border border-border bg-card p-5"
        >
          <legend className="sr-only">Question {qi + 1}</legend>
          <p className="font-medium">
            <span className="mr-2 font-mono text-xs text-primary">Q{qi + 1}</span>
            {q.prompt}
          </p>
          <div className="mt-3 space-y-2">
            {q.options.map((o) => {
              const active = picked[q.id] === o.id;
              const showAnswer = done && o.isCorrect;
              return (
                <button
                  key={o.id}
                  onClick={() => setPicked((p) => ({ ...p, [q.id]: o.id }))}
                  className={`w-full rounded-md border px-3 py-2 text-left text-sm transition ${
                    showAnswer
                      ? "border-emerald-500/50 bg-emerald-500/10"
                      : active
                        ? "border-primary bg-primary/10"
                        : "border-border/60 hover:border-primary/50"
                  }`}
                >
                  {o.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      ))}
      {!done ? (
        <button
          onClick={submit}
          disabled={Object.keys(picked).length < questions.length}
          className="w-full rounded-md bg-primary px-4 py-2 font-mono text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          Submit diagnostic
        </button>
      ) : (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 text-center">
          <p className="text-sm">
            Scored {correct}/{questions.length} —{" "}
            {correct >= 2 ? "placed out of the basics." : "start from lesson one."}
          </p>
          <Link
            to="/tracks/$slug"
            params={{ slug: track.slug }}
            className="mt-3 inline-block rounded-md bg-primary px-4 py-2 font-mono text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {correct >= 2 ? "Continue to advanced modules →" : "Back to track →"}
          </Link>
        </div>
      )}
    </div>
  );
}
