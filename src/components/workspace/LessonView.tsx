import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, CheckCircle2, FlaskConical } from "lucide-react";
import type { Drill, Lesson } from "@/lib/domain/types";

export interface LessonViewProps {
  lesson: Lesson;
  drill: Drill | null;
  moduleTitle: string;
}

export function LessonView({ lesson, drill, moduleTitle }: LessonViewProps) {
  const { content } = lesson;
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="space-y-2">
        <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary">
          <BookOpen className="size-3.5" />
          Phase 1 · Concept Lesson · {moduleTitle}
        </p>
        <h1 className="text-3xl font-bold tracking-tight">{lesson.title}</h1>
        <p className="font-mono text-xs text-muted-foreground">
          {content.demoLanguage} · {content.keyTakeaways.length} key takeaways
        </p>
      </div>

      <section className="rounded-lg border border-border bg-card p-6">
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
          {content.markdown}
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Key takeaways
        </h2>
        <ul className="space-y-2">
          {content.keyTakeaways.map((point) => (
            <li key={point} className="flex items-start gap-2 text-sm">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-400" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          <FlaskConical className="size-3.5" />
          Demo · {content.demoLanguage}
        </h2>
        <pre className="overflow-x-auto rounded-lg border border-border bg-[#141414] p-4 font-mono text-xs leading-relaxed text-zinc-200">
          {content.demoCode}
        </pre>
      </section>

      {drill ? (
        <section className="rounded-xl border border-primary/30 bg-primary/5 p-5 text-center">
          <p className="text-sm text-muted-foreground">
            Theory covered. Time to prove it against the test suite.
          </p>
          <Link
            to="/workspace/$drillId"
            params={{ drillId: drill.id }}
            className="mt-3 inline-flex items-center gap-1 rounded-md bg-primary px-4 py-2 font-mono text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {drill.title}: start Phase 2 drill
            <ArrowRight className="size-4" />
          </Link>
        </section>
      ) : (
        <p className="text-center font-mono text-xs text-muted-foreground">
          No graded drill attached to this lesson yet.
        </p>
      )}
    </div>
  );
}
