/**
 * Zero2One canonical domain types — 5-tier hierarchy + 4-tier RBAC.
 * Synthesized from Zero2One-Legacy (src/lib/domain/types.ts) with
 * naming aligned to classroomio question-types + learnhouse activities.
 * Strict TypeScript: no `any` permitted in this file.
 */

export type UserRole = "super_admin" | "admin" | "teacher" | "learner";

export type TrackType =
  | "language"
  | "role_frontend"
  | "role_backend"
  | "role_fullstack"
  | "vibe_coding";

export type SkillLevel = "beginner" | "intermediate" | "advanced";

export type DrillKind =
  | "unit_test"
  | "multiple_choice"
  | "prompt_spec_eval"
  | "diff_verification"
  | "manual_review";

export interface Track {
  id: string;
  slug: string;
  title: string;
  type: TrackType;
  primaryLanguage: string;
  description: string;
  estimatedHours: number;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  technology: string;
  category: string;
  description: string;
  estimatedMinutes: number;
  level: SkillLevel;
  published: boolean;
}

export interface Module {
  id: string;
  courseId: string;
  trackId: string | null;
  sequenceOrder: number;
  title: string;
  description: string;
  xpReward: number;
  isCapstone: boolean;
}

export interface LessonContent {
  markdown: string;
  keyTakeaways: string[];
  demoCode: string;
  demoLanguage: string;
}

export interface Lesson {
  id: string;
  moduleId: string;
  sequenceOrder: number;
  title: string;
  content: LessonContent;
}

export interface TestAssertion {
  id: string;
  label: string;
  hidden: boolean;
}

export interface DrillContent {
  instructions: string;
  starterCode: string;
  language: string;
  visibleTests: TestAssertion[];
  hiddenTestCount: number;
}

export interface Drill {
  id: string;
  moduleId: string;
  lessonId: string | null;
  kind: DrillKind;
  title: string;
  content: DrillContent;
}

export type Permission =
  | "content:read"
  | "content:create"
  | "content:edit_own"
  | "content:edit_any"
  | "content:delete"
  | "users:manage"
  | "roles:assign"
  | "submissions:grade_own"
  | "submissions:grade_any"
  | "certs:issue"
  | "analytics:own"
  | "analytics:global";

export const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  super_admin: [
    "content:read",
    "content:create",
    "content:edit_own",
    "content:edit_any",
    "content:delete",
    "users:manage",
    "roles:assign",
    "submissions:grade_own",
    "submissions:grade_any",
    "certs:issue",
    "analytics:own",
    "analytics:global",
  ],
  admin: [
    "content:read",
    "content:create",
    "content:edit_own",
    "content:edit_any",
    "users:manage",
    "submissions:grade_any",
    "certs:issue",
    "analytics:own",
    "analytics:global",
  ],
  teacher: [
    "content:read",
    "content:create",
    "content:edit_own",
    "submissions:grade_own",
    "analytics:own",
  ],
  learner: ["content:read", "analytics:own"],
} as const;

export function hasPermission(
  role: UserRole,
  permission: Permission,
): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}
