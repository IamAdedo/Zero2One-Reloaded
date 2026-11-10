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
  "lesson-py-lists": {
    id: "lesson-py-lists",
    moduleId: "module-py-collections",
    sequenceOrder: 1,
    title: "Lists and comprehensions",
    content: {
      markdown:
        "Split a line into tokens, convert them with `int`, and summarise with `sum`. Comprehensions keep the transform readable.",
      keyTakeaways: [
        "input().split() gives a list of strings",
        "map(int, tokens) converts each token",
        "sum() folds a sequence to one value",
      ],
      demoCode: "nums = [int(t) for t in input().split()]\nprint(sum(nums))",
      demoLanguage: "python",
    },
  },
  "lesson-py-dicts": {
    id: "lesson-py-dicts",
    moduleId: "module-py-collections",
    sequenceOrder: 2,
    title: "Counting with dictionaries",
    content: {
      markdown:
        "A dictionary maps keys to counts. Iterate tokens once, increment as you go, then pick the winner with an explicit tie-break.",
      keyTakeaways: [
        "dict.get(key, 0) + 1 counts safely",
        "sort by (-count, key) for deterministic ties",
        "one pass beats repeated .count() calls",
      ],
      demoCode:
        'counts = {}\nfor word in input().split():\n    counts[word] = counts.get(word, 0) + 1\nprint(min(counts, key=lambda w: (-counts[w], w)))',
      demoLanguage: "python",
    },
  },
  "lesson-ts-types": {
    id: "lesson-ts-types",
    moduleId: "module-ts-core",
    sequenceOrder: 1,
    title: "Types that catch bugs early",
    content: {
      markdown:
        "TypeScript annotations are checked before runtime. Annotate function boundaries, let inference handle locals.",
      keyTakeaways: [
        "Annotations document intent at module edges",
        "Inference keeps local code terse",
        "strict mode turns silent coercions into errors",
      ],
      demoCode:
        'function shout(text: string): string {\n  return text.trim().toUpperCase();\n}\nconsole.log(shout("  hi  "));',
      demoLanguage: "typescript",
    },
  },
  "lesson-ts-arrays": {
    id: "lesson-ts-arrays",
    moduleId: "module-ts-core",
    sequenceOrder: 2,
    title: "map, filter, reduce",
    content: {
      markdown:
        "Array methods describe a pipeline: filter keeps values, map transforms them, reduce folds them into one result.",
      keyTakeaways: [
        "filter returns a new array",
        "map preserves length",
        "reduce needs an initial accumulator",
      ],
      demoCode:
        "const nums = [1, 2, 3, 4];\nconst evens = nums.filter((n) => n % 2 === 0);\nconsole.log(evens.reduce((a, b) => a + b, 0));",
      demoLanguage: "typescript",
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
  "py-sum-line": {
    id: "py-sum-line",
    moduleId: "module-py-collections",
    lessonId: "lesson-py-lists",
    kind: "unit_test",
    title: "Sum a line of integers",
    content: {
      instructions:
        "Read one line of space-separated integers from stdin and print their sum.",
      starterCode: "print(sum(map(int, input().split())))",
      language: "python",
      visibleTests: [
        { id: "three", label: "sums three values", hidden: false, stdin: "1 2 3", expectedStdout: "6" },
        { id: "single", label: "handles a single value", hidden: false, stdin: "5", expectedStdout: "5" },
        { id: "signed", label: "handles mixed signs", hidden: true, stdin: "-1 0 1", expectedStdout: "0" },
      ],
      hiddenTestCount: 1,
    },
  },
  "py-word-count": {
    id: "py-word-count",
    moduleId: "module-py-collections",
    lessonId: "lesson-py-dicts",
    kind: "unit_test",
    title: "Most frequent word",
    content: {
      instructions:
        'Read one line of space-separated words. Print the most frequent word and its count as "word count". Break ties by choosing the lexicographically smallest word.',
      starterCode:
        'words = input().split()\ncounts = {}\nfor w in words:\n    counts[w] = counts.get(w, 0) + 1\nprint(words[0], counts[words[0]])',
      language: "python",
      visibleTests: [
        { id: "clear-win", label: "finds a clear winner", hidden: false, stdin: "a b a", expectedStdout: "a 2" },
        { id: "single", label: "handles one word", hidden: false, stdin: "solo", expectedStdout: "solo 1" },
        { id: "tie-break", label: "breaks ties alphabetically", hidden: true, stdin: "b a b a c", expectedStdout: "a 2" },
      ],
      hiddenTestCount: 1,
    },
  },
  "ts-normalize": {
    id: "ts-normalize",
    moduleId: "module-ts-core",
    lessonId: "lesson-ts-types",
    kind: "unit_test",
    title: "Normalize a label",
    content: {
      instructions:
        "Read one line from stdin. Print it with surrounding whitespace removed and every character upper-cased.",
      starterCode:
        'declare const require: (id: string) => { readFileSync(fd: number, encoding: string): string };\nconst raw = require("fs").readFileSync(0, "utf8");\nconsole.log(raw.trim());',
      language: "typescript",
      visibleTests: [
        { id: "padded", label: "trims surrounding spaces", hidden: false, stdin: "  hello  ", expectedStdout: "HELLO" },
        { id: "plain", label: "upper-cases plain text", hidden: false, stdin: "abc", expectedStdout: "ABC" },
        { id: "numbers", label: "leaves digits intact", hidden: true, stdin: " 42 ", expectedStdout: "42" },
      ],
      hiddenTestCount: 1,
    },
  },
  "ts-sum-evens": {
    id: "ts-sum-evens",
    moduleId: "module-ts-core",
    lessonId: "lesson-ts-arrays",
    kind: "unit_test",
    title: "Sum the even numbers",
    content: {
      instructions:
        "Read one line of space-separated integers. Print the sum of the even values. Print 0 when there are none.",
      starterCode:
        'declare const require: (id: string) => { readFileSync(fd: number, encoding: string): string };\nconst raw = require("fs").readFileSync(0, "utf8");\nconst nums = raw.trim().split(/\\s+/).map(Number);\nconsole.log(nums.filter((n) => n % 2 === 0).reduce((a, b) => a + b, 0));',
      language: "typescript",
      visibleTests: [
        { id: "mixed", label: "sums evens from mixed input", hidden: false, stdin: "1 2 3 4", expectedStdout: "6" },
        { id: "none", label: "prints zero without evens", hidden: false, stdin: "1 3 5", expectedStdout: "0" },
        { id: "negatives", label: "handles negative evens", hidden: true, stdin: "-2 -3 4", expectedStdout: "2" },
      ],
      hiddenTestCount: 1,
    },
  },
  "ts-fizzbuzz": {
    id: "ts-fizzbuzz",
    moduleId: "module-ts-core",
    lessonId: "lesson-ts-arrays",
    kind: "unit_test",
    title: "FizzBuzz in TypeScript",
    content: {
      instructions:
        "Read one integer from stdin. Print FizzBuzz when divisible by 15, Fizz by 3, Buzz by 5, otherwise the number.",
      starterCode:
        'declare const require: (id: string) => { readFileSync(fd: number, encoding: string): string };\nconst n = Number(require("fs").readFileSync(0, "utf8").trim());\nconsole.log(n);',
      language: "typescript",
      visibleTests: [
        { id: "plain", label: "prints plain numbers", hidden: false, stdin: "7", expectedStdout: "7" },
        { id: "fizz", label: "prints Fizz", hidden: false, stdin: "9", expectedStdout: "Fizz" },
        { id: "fizzbuzz", label: "prints FizzBuzz", hidden: true, stdin: "30", expectedStdout: "FizzBuzz" },
      ],
      hiddenTestCount: 1,
    },
  },
};

const MODULE_TITLES: Record<string, string> = {
  "module-py-basics": "Python Basics",
  "module-py-collections": "Python Collections",
  "module-ts-core": "TypeScript Core",
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
  "module-py-collections": {
    id: "module-py-collections",
    title: "Python Collections",
    lessonIds: ["lesson-py-lists", "lesson-py-dicts"],
  },
  "module-ts-core": {
    id: "module-ts-core",
    title: "TypeScript Core",
    lessonIds: ["lesson-ts-types", "lesson-ts-arrays"],
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
  {
    id: "track-ts-frontend",
    slug: "typescript-frontend",
    title: "TypeScript Frontend",
    type: "role_frontend",
    primaryLanguage: "TypeScript",
    description:
      "Typed JavaScript fundamentals for building reliable browser interfaces.",
    estimatedHours: 48,
  },
];

const TRACK_MODULES: Record<string, string[]> = {
  "track-py-backend": ["module-py-basics", "module-py-collections"],
  "track-ts-frontend": ["module-ts-core"],
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
  {
    id: "course-py-collections",
    slug: "python-collections",
    title: "Python Collections",
    technology: "Python",
    category: "language",
    description: "Lists, comprehensions, and dictionary-based counting.",
    estimatedMinutes: 75,
    level: "beginner",
    published: true,
  },
  {
    id: "course-ts-core",
    slug: "typescript-core",
    title: "TypeScript Core",
    technology: "TypeScript",
    category: "language",
    description: "Type annotations, array pipelines, and deterministic output.",
    estimatedMinutes: 90,
    level: "beginner",
    published: true,
  },
];

const COURSE_MODULES: Record<string, string[]> = {
  "course-py-io": ["module-py-basics"],
  "course-py-collections": ["module-py-collections"],
  "course-ts-core": ["module-ts-core"],
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
  "track-ts-frontend": [
    {
      id: "pq-annotation",
      prompt: "What does `const n: number = 1` add over plain JavaScript?",
      options: [
        { id: "a", label: "A compile-time check on the declared type", isCorrect: true },
        { id: "b", label: "A runtime type guard", isCorrect: false },
        { id: "c", label: "Automatic number parsing", isCorrect: false },
      ],
    },
    {
      id: "pq-filter",
      prompt: "What does `array.filter(fn)` return?",
      options: [
        { id: "a", label: "A new array with the elements that pass fn", isCorrect: true },
        { id: "b", label: "The first matching element", isCorrect: false },
        { id: "c", label: "A count of matching elements", isCorrect: false },
      ],
    },
    {
      id: "pq-reduce",
      prompt: "Why pass an initial value to `array.reduce(fn, 0)`?",
      options: [
        { id: "a", label: "It defines the accumulator type and handles empty arrays", isCorrect: true },
        { id: "b", label: "It makes reduce faster", isCorrect: false },
        { id: "c", label: "It sorts the array first", isCorrect: false },
      ],
    },
  ],
};

export function placementQuestionsFor(trackId: string): PlacementQuestion[] {
  return PLACEMENT_QUESTIONS[trackId] ?? [];
}
