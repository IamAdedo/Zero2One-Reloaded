import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowRight, FlaskConical } from "lucide-react";
import {
  getTrack,
  lessonsForModule,
  listDrills,
  modulesForTrack,
} from "@/data/seed";

export const Route = createFileRoute("/tracks/$slug")({
  loader: ({ params }) => {
    const track = getTrack(params.slug);
    if (!track) throw notFound();
    const modules = modulesForTrack(track.id).map((m) => ({
      ...m,
      lessons: lessonsForModule(m.id).map((lesson) => ({
        ...lesson,
        drill:
          listDrills().find((d) => d.lessonId === lesson.id) ?? null,
      })),
    }));
    return { track, modules };
  },
  notFoundComponent: TrackNotFound,
  component: TrackPage,
});

function TrackNotFound() {
  return (
    <div className="space-y-3 py-12 text-center">
      <p className="font-mono text-sm text-primary">404</p>
      <h1 className="text-2xl font-bold">Track not found</h1>
      <Link
        to="/tracks"
        className="inline-block rounded-md bg-primary px-4 py-2 font-mono text-sm font-semibold text-primary-foreground hover:bg-primary/90"
      >
        ← All tracks
      </Link>
    </div>
  );
}

function TrackPage() {
  const { track, modules } = Route.useLoaderData();
  const totalLessons = modules.reduce((n, m) => n + m.lessons.length, 0);
  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          Home
        </Link>
        <span>/</span>
        <Link to="/tracks" className="hover:text-foreground">
          Tracks
        </Link>
        <span>/</span>
        <span className="text-foreground">{track.slug}</span>
      </nav>
      <div className="space-y-1">
        <p className="font-mono text-xs uppercase tracking-widest text-primary">
          {track.primaryLanguage} · ~{track.estimatedHours}h
        </p>
        <h1 className="text-3xl font-bold tracking-tight">{track.title}</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          {track.description}
        </p>
        <p className="font-mono text-xs text-muted-foreground">
          {modules.length} modules · {totalLessons} lessons
        </p>
      </div>
      {modules.map((m, mi) => (
        <section
          key={m.id}
          className="rounded-lg border border-border bg-card p-5"
        >
          <h2 className="font-semibold">
            <span className="mr-2 font-mono text-xs text-primary">
              M{mi + 1}
            </span>
            {m.title}
          </h2>
          <ol className="mt-3 space-y-2">
            {m.lessons.map((lesson, li) => (
              <li
                key={lesson.id}
                className="flex items-center gap-2 rounded-md border border-border/60 px-3 py-2 text-sm"
              >
                <span className="font-mono text-xs text-muted-foreground">
                  {li + 1}
                </span>
                <Link
                  to="/lessons/$lessonId"
                  params={{ lessonId: lesson.id }}
                  className="flex-1 hover:text-primary hover:underline"
                >
                  {lesson.title}
                </Link>
                {lesson.drill && (
                  <Link
                    to="/workspace/$drillId"
                    params={{ drillId: lesson.drill.id }}
                    className="flex items-center gap-1 font-mono text-xs text-amber-300 hover:underline"
                    title={`Drill: ${lesson.drill.title}`}
                  >
                    <FlaskConical className="size-3.5" />
                    Drill
                  </Link>
                )}
              </li>
            ))}
          </ol>
          {m.lessons[0] && (
            <Link
              to="/lessons/$lessonId"
              params={{ lessonId: m.lessons[0].id }}
              className="mt-3 inline-flex items-center gap-1 font-mono text-xs font-semibold text-primary hover:underline"
            >
              {m.lessons.some((l) => l.drill) ? "Continue module" : "Start module"}
              <ArrowRight className="size-3.5" />
            </Link>
          )}
        </section>
      ))}
    </div>
  );
}
