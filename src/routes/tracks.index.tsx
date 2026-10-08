import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Layers } from "lucide-react";
import {
  lessonsForModule,
  listTracks,
  modulesForTrack,
} from "@/data/seed";

export const Route = createFileRoute("/tracks/")({
  component: TracksPage,
});

function TracksPage() {
  const tracks = listTracks();
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary">
          <Layers className="size-3.5" />
          Career tracks
        </p>
        <h1 className="text-3xl font-bold tracking-tight">
          Role-based mastery paths
        </h1>
        <p className="text-sm text-muted-foreground">
          End-to-end tracks composed of sequential modules. Pick a role, start
          at lesson one.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {tracks.map((track) => {
          const modules = modulesForTrack(track.id);
          const lessons = modules.flatMap((m) => lessonsForModule(m.id));
          const first = lessons[0];
          return (
            <article
              key={track.id}
              className="flex flex-col rounded-lg border border-border bg-card p-5"
            >
              <p className="font-mono text-[11px] uppercase tracking-widest text-primary">
                {track.primaryLanguage} · ~{track.estimatedHours}h
              </p>
              <h2 className="mt-1 text-xl font-semibold">{track.title}</h2>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">
                {track.description}
              </p>
              <p className="mt-3 font-mono text-xs text-muted-foreground">
                {modules.length} module{modules.length === 1 ? "" : "s"} ·{" "}
                {lessons.length} lesson{lessons.length === 1 ? "" : "s"}
              </p>
              {first && (
                <Link
                  to="/lessons/$lessonId"
                  params={{ lessonId: first.id }}
                  className="mt-4 inline-flex items-center gap-1 font-mono text-sm font-semibold text-primary hover:underline"
                >
                  Start: {first.title}
                  <ArrowRight className="size-4" />
                </Link>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
