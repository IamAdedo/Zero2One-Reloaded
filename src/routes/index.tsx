import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

const PHASES = [
  {
    step: "Phase 1",
    title: "Concept Lesson",
    body: "Read the theory, study key takeaways, run the interactive demo.",
  },
  {
    step: "Phase 2",
    title: "Hands-On Drill",
    body: "Write code against visible tests, then face the hidden suite.",
  },
] as const;

function HomePage() {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <p className="font-mono text-sm text-primary">RED &#10148; GREEN &#10148; REFACTOR</p>
        <h1 className="text-4xl font-bold tracking-tight">
          Zero2One Reloaded
        </h1>
        <p className="max-w-2xl text-muted-foreground">
          Test-driven engineering mastery. Every micro-module runs concept
          first, drill second — career tracks for role mastery, micro-courses
          for focused tools.
        </p>
      </section>
      <section className="grid gap-4 sm:grid-cols-2">
        {PHASES.map((phase) => (
          <article
            key={phase.step}
            className="rounded-lg border border-border bg-card p-5"
          >
            <p className="font-mono text-xs text-primary">{phase.step}</p>
            <h2 className="mt-1 text-xl font-semibold">{phase.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{phase.body}</p>
          </article>
        ))}
      </section>
      <section>
        <a
          href="/lessons/lesson-py-io"
          className="inline-block rounded-md bg-primary px-4 py-2 font-mono text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          Start with Phase 1: Reading input, writing output →
        </a>
      </section>
    </div>
  );
}
