import { create } from "zustand";
import type { Drill, Lesson } from "@/lib/domain/types";

export type WorkspacePhase = "LESSON" | "DRILL";

interface WorkspaceState {
  lesson: Lesson | null;
  drill: Drill | null;
  phase: WorkspacePhase;
  /** True once the learner has opened the drill — unlocks phase switching. */
  lessonSeen: boolean;
  codeById: Readonly<Record<string, string>>;
  xp: number;
  openLesson: (lesson: Lesson, drill: Drill | null) => void;
  startDrill: () => void;
  backToLesson: () => void;
  updateCode: (id: string, code: string) => void;
  addXp: (amount: number) => void;
  reset: () => void;
}

const INITIAL: Pick<
  WorkspaceState,
  "lesson" | "drill" | "phase" | "lessonSeen" | "codeById" | "xp"
> = {
  lesson: null,
  drill: null,
  phase: "LESSON",
  lessonSeen: false,
  codeById: {},
  xp: 0,
};

function seedCode(
  codeById: Readonly<Record<string, string>>,
  id: string,
  seed: string,
): Record<string, string> {
  if (id in codeById) return { ...codeById };
  return { ...codeById, [id]: seed };
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  ...INITIAL,

  openLesson: (lesson, drill) =>
    set((state) => ({
      lesson,
      drill,
      phase: "LESSON",
      lessonSeen: false,
      codeById: seedCode(state.codeById, lesson.id, lesson.content.demoCode),
    })),

  startDrill: () =>
    set((state) => {
      if (!state.lesson) return state;
      const codeById = state.drill
        ? seedCode(state.codeById, state.drill.id, state.drill.content.starterCode)
        : state.codeById;
      return { phase: "DRILL", lessonSeen: true, codeById };
    }),

  backToLesson: () =>
    set((state) => (state.lesson ? { phase: "LESSON" } : state)),

  updateCode: (id, code) =>
    set((state) => ({ codeById: { ...state.codeById, [id]: code } })),

  addXp: (amount) =>
    set((state) => ({ xp: state.xp + Math.max(0, Math.floor(amount)) })),

  reset: () => set({ ...INITIAL, codeById: {} }),
}));

/** Edited code for an id, falling back to the provided seed. */
export function codeFor(
  state: Pick<WorkspaceState, "codeById">,
  id: string,
  fallback: string,
): string {
  return state.codeById[id] ?? fallback;
}
