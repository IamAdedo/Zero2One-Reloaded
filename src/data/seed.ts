import type { Course, Drill, Lesson, Track } from "@/lib/domain/types";

/**
 * Minimal executable seed registry. Every drill carries runnable stdin /
 * expectedStdout cases (visible + hidden) so the server fallback can grade
 * from server-run code. Replaced by Supabase content once the studio lands.
 */

const LESSONS: Record<string, Lesson> = {
  "lesson-py-io": {
    id: "lesson-py-io",
    moduleId: "module-py-basics",
    sequenceOrder: 1,
    title: "Reading input, writing output",
    content: {
      markdown: "Python programs read stdin with `input()` and write with `print()`.",
      keyTakeaways: ["input() reads one line", "print() writes stdout"],
      demoCode: 'print(f"hello {input()}")',
      demoLanguage: "python",
    },
  },
  "lesson-py-branch": {
    id: "lesson-py-branch",
    moduleId: "module-py-basics",
    sequenceOrder: 2,
    title: "Branching on remainders",
    content: {
      markdown: "Use `%` and `if/elif/else` to classify integers.",
      keyTakeaways: ["% gives remainders", "order conditions carefully"],
      demoCode: 'print("Fizz" if int(input()) % 3 == 0 else "other")',
      demoLanguage: "python",
    },
  },
};

const DRILLS: Record<string, Drill> = {
  "py-add": {
    id: "py-add",
    moduleId: "module-py-basics",
    lessonId: "lesson-py-io",
    kind: "unit_test",
    title: "Add two numbers",
    content: {
      instructions:
        "Read two space-separated integers from stdin and print their sum.",
      starterCode: "a, b = map(int, input().split())\nprint(a + b)",
      language: "python",
      visibleTests: [
        { id: "adds-positives", label: "adds two positives", hidden: false, stdin: "2 3", expectedStdout: "5" },
        { id: "adds-zeros", label: "adds zeros", hidden: false, stdin: "0 0", expectedStdout: "0" },
        { id: "adds-negatives", label: "handles negatives", hidden: true, stdin: "-4 7", expectedStdout: "3" },
      ],
      hiddenTestCount: 1,
    },
  },
  "py-fizzbuzz-one": {
    id: "py-fizzbuzz-one",
    moduleId: "module-py-basics",
    lessonId: "lesson-py-branch",
    kind: "unit_test",
    title: "FizzBuzz classifier",
    content: {
      instructions:
        "Read one integer from stdin. Print FizzBuzz if divisible by 15, Fizz if by 3, Buzz if by 5, else the number itself.",
      starterCode: "n = int(input())\nprint(n)",
      language: "python",
      visibleTests: [
        { id: "plain", label: "prints plain numbers", hidden: false, stdin: "7", expectedStdout: "7" },
        { id: "fizz", label: "prints Fizz", hidden: false, stdin: "9", expectedStdout: "Fizz" },
        { id: "buzz", label: "prints Buzz", hidden: false, stdin: "10", expectedStdout: "Buzz" },
        { id: "fizzbuzz", label: "prints FizzBuzz", hidden: true, stdin: "30", expectedStdout: "FizzBuzz" },
      ],
      hiddenTestCount: 1,
    },
  },
};

const MODULE_TITLES: Record<string, string> = {
  "module-py-basics": "Python Basics",
};

export interface SeedModule {
  id: string;
  title: string;
  lessonIds: string[];
}

const MODULES: Record<string, SeedModule> = {
  "module-py-basics": {
    id: "module-py-basics",
    title: "Python Basics",
    lessonIds: ["lesson-py-io", "lesson-py-branch"],
  },
};

const TRACKS: Track[] = [
  {
    id: "track-py-backend",
    slug: "python-backend",
    title: "Python Backend",
    type: "role_backend",
    primaryLanguage: "Python",
    description:
      "Server-side Python from stdin/stdout basics toward API engineering.",
    estimatedHours: 40,
  },
];

const TRACK_MODULES: Record<string, string[]> = {
  "track-py-backend": ["module-py-basics"],
};

const COURSES: Course[] = [
  {
    id: "course-py-io",
    slug: "python-io",
    title: "Python I/O Essentials",
    technology: "Python",
    category: "language",
    description: "Reading input, writing output, and branching on values.",
    estimatedMinutes: 60,
    level: "beginner",
    published: true,
  },
];

const COURSE_MODULES: Record<string, string[]> = {
  "course-py-io": ["module-py-basics"],
};

export function listTracks(): Track[] {
  return TRACKS;
}

export function getTrack(slug: string): Track | undefined {
  return TRACKS.find((t) => t.slug === slug);
}

export function modulesForTrack(trackId: string): SeedModule[] {
  return (TRACK_MODULES[trackId] ?? [])
    .map((id) => MODULES[id])
    .filter((m): m is SeedModule => m !== undefined);
}

export function listCourses(): Course[] {
  return COURSES.filter((c) => c.published);
}

export function modulesForCourse(courseId: string): SeedModule[] {
  return (COURSE_MODULES[courseId] ?? [])
    .map((id) => MODULES[id])
    .filter((m): m is SeedModule => m !== undefined);
}

export function lessonsForModule(moduleId: string): Lesson[] {
  const mod = MODULES[moduleId];
  if (!mod) return [];
  return mod.lessonIds
    .map((id) => LESSONS[id])
    .filter((l): l is Lesson => l !== undefined);
}

export function getDrill(id: string): Drill | undefined {
  return DRILLS[id];
}

export function getLesson(id: string): Lesson | undefined {
  return LESSONS[id];
}

export function moduleTitleFor(moduleId: string): string {
  return MODULE_TITLES[moduleId] ?? moduleId;
}

export function listDrills(): Drill[] {
  return Object.values(DRILLS);
}

export interface PlacementOption {
  id: string;
  label: string;
  isCorrect: boolean;
}

export interface PlacementQuestion {
  id: string;
  prompt: string;
  options: PlacementOption[];
}

const PLACEMENT_QUESTIONS: Record<string, PlacementQuestion[]> = {
  "track-py-backend": [
    {
      id: "pq-input",
      prompt: "What does input() return in Python?",
      options: [
        { id: "a", label: "A string", isCorrect: true },
        { id: "b", label: "An integer", isCorrect: false },
        { id: "c", label: "A list of lines", isCorrect: false },
      ],
    },
    {
      id: "pq-print",
      prompt: 'What does print("x") write to stdout?',
      options: [
        { id: "a", label: "x followed by a newline", isCorrect: true },
        { id: "b", label: "x with no newline", isCorrect: false },
        { id: "c", label: "Nothing until flush()", isCorrect: false },
      ],
    },
    {
      id: "pq-mod",
      prompt: "Which expression is True when n is divisible by 15?",
      options: [
        { id: "a", label: "n % 15 == 0", isCorrect: true },
        { id: "b", label: "n / 15 == 0", isCorrect: false },
        { id: "c", label: "n // 15 == 0", isCorrect: false },
      ],
    },
  ],
};

export function placementQuestionsFor(trackId: string): PlacementQuestion[] {
  return PLACEMENT_QUESTIONS[trackId] ?? [];
}
