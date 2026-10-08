import type { Drill, Lesson } from "@/lib/domain/types";

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
