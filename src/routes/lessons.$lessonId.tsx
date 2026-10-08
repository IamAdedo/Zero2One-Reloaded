import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect } from "react";
import { LessonView } from "@/components/workspace/LessonView";
import { getLesson, listDrills, moduleTitleFor } from "@/data/seed";
import { useWorkspaceStore } from "@/store/useWorkspaceStore";

export const Route = createFileRoute("/lessons/$lessonId")({
  loader: ({ params }) => {
    const lesson = getLesson(params.lessonId);
    if (!lesson) throw notFound();
    return { lesson };
  },
  notFoundComponent: LessonNotFound,
  component: LessonPage,
});

function LessonNotFound() {
  return (
    <div className="space-y-3 py-12 text-center">
      <p className="font-mono text-sm text-primary">404</p>
      <h1 className="text-2xl font-bold">Lesson not found</h1>
      <Link
        to="/"
        className="inline-block rounded-md bg-primary px-4 py-2 font-mono text-sm font-semibold text-primary-foreground hover:bg-primary/90"
      >
        ← Back home
      </Link>
    </div>
  );
}

function LessonPage() {
  const { lesson } = Route.useLoaderData();
  const openLesson = useWorkspaceStore((s) => s.openLesson);

  const drill = listDrills().find((d) => d.lessonId === lesson.id) ?? null;

  useEffect(() => {
    openLesson(lesson, drill);
  }, [lesson, drill, openLesson]);

  return (
    <div className="space-y-4">
      <nav className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          Home
        </Link>
        <span>/</span>
        <span>Lessons</span>
        <span>/</span>
        <span className="text-foreground">{lesson.id}</span>
      </nav>
      <LessonView
        lesson={lesson}
        drill={drill}
        moduleTitle={moduleTitleFor(lesson.moduleId)}
      />
    </div>
  );
}
