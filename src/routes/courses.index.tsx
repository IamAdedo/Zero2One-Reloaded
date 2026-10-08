import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Package } from "lucide-react";
import {
  lessonsForModule,
  listCourses,
  modulesForCourse,
} from "@/data/seed";

export const Route = createFileRoute("/courses/")({
  component: CoursesPage,
});

function CoursesPage() {
  const courses = listCourses();
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-primary">
          <Package className="size-3.5" />
          Micro-courses
        </p>
        <h1 className="text-3xl font-bold tracking-tight">
          Focused language & tool paths
        </h1>
        <p className="text-sm text-muted-foreground">
          Isolated, bite-sized courses. No role commitment required.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {courses.map((course) => {
          const modules = modulesForCourse(course.id);
          const lessons = modules.flatMap((m) => lessonsForModule(m.id));
          const first = lessons[0];
          return (
            <article
              key={course.id}
              className="flex flex-col rounded-lg border border-border bg-card p-5"
            >
              <p className="font-mono text-[11px] uppercase tracking-widest text-primary">
                {course.technology} · {course.level} · ~{course.estimatedMinutes}
                min
              </p>
              <h2 className="mt-1 text-xl font-semibold">{course.title}</h2>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">
                {course.description}
              </p>
              <p className="mt-3 font-mono text-xs text-muted-foreground">
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
