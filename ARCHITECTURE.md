# Zero2One Reloaded — Architecture

Clean-room synthesis target (`./Zero2One`). Sources are read-only:
legacy baseline `./Zero2One-Legacy`, references `./reference/*`.
Git: `origin → https://github.com/IamAdedo/Zero2One-Reloaded.git`
Legacy remote stays `https://github.com/IamAdedo/zero2one` (untouched).

## 1. Stack decision

| Layer | Choice | Rationale |
|---|---|---|
| Framework | TanStack Start (Vite) + TanStack Router + file routes | Kept from legacy; preserves dual-phase workspace + SSR server fns. Next.js (courselit/learnhouse) rejected to avoid rewrite. |
| Language | Strict TypeScript (`tsc --noEmit`, no `any`) | — |
| Styling | Tailwind CSS v4 + design tokens | classroomio `ui:`-prefixed system informs token naming; no blind copy |
| State | Zustand (phase/XP/streak) + TanStack Query (server) | From legacy `useAppStore` / `useUserProgress` |
| Editors | Monaco (graded drills) + CodeMirror (snippet tester) | Both kept from legacy; Anubis `react-ace` rejected |
| Execution | WebContainers (JS/TS) + Pyodide WASM (Python) + Judge0 fallback (Go/C/Rust) | Legacy topology; learnhouse `code_execution.py` + Frappe `code_runner.py` inform server fallback API shape |
| DB | Supabase Postgres + RLS (`supabase/schema.sql`) | Legacy 18-table enterprise DDL is the base (copied as migration start, not refactored yet) |
| Auth | Supabase Auth + `user_roles` RBAC (4 tiers) | Legacy `ROLE_PERMISSIONS`; learnhouse roles/usergroups inform future MFA/orgs |

## 2. Synthesis matrix (winner per feature)

| Feature | Candidates | Winner → target location |
|---|---|---|
| Dual-phase Lesson→Drill workspace, 3-pane IDE | Legacy `StandardIde`/`DrillInterface`/`SplitLessonWorkspace` | **Legacy** → `src/components/workspace/` (port module by module) |
| Vibe playground (PRD/Prompt/Preview) | Legacy `VibeIde` only | **Legacy** → `src/components/workspace/VibeIde.tsx` |
| Quiz/assessment engine | classroomio `question-types` registry/scoring; Frappe `lms_question`/`quiz_submission`; learnhouse activities | **classroomio registry pattern** (new `src/lib/quiz/`), Frappe submission/result shape for DB |
| Code execution/autograde | Anubis `autograde.py`/`shell_autograde`; learnhouse `code_execution.py`; Frappe `code_runner.py` + `exerciseRunFlow.ts`; legacy `runners.ts`/Pyodide | **Legacy client runners** + **learnhouse/Frappe API shape** for server fallback (`src/server/execution.ts`) |
| Course progression (Track→Course→Module→Lesson→Drill) | Legacy 5-tier + courselit viewer; Frappe Course→Chapter→Lesson; LMS-Udemy-Type publish/enroll/progress | **Legacy 5-tier** (kept) + Frappe enrollment guards + Udemy publish toggle |
| Auth/RBAC | Legacy `ROLE_PERMISSIONS`/`RoleGate`; learnhouse roles/MFA; Anubis GitHub OAuth guards | **Legacy** (kept); MFA/orgs deferred |
| Gamification (XP/streak/freeze/leaderboard/heatmap/milestones) | Legacy only (no reference has XP/streak) | **Legacy** → `src/lib/gamification/rules.ts` ✅ ported; leaderboard/heatmap/milestones pending |
| Design system | classroomio `packages/ui`; courselit page-blocks/primitives; legacy Tailwind tokens + shadcn | **Legacy tokens** + classroomio registry idea for `src/components/ui/` |
| AI coach | Legacy `ai-coach.ts` (Gemini) | **Legacy** → `src/server/ai-coach.ts` (pending) |
| Payments/monetization | courselit Stripe/Razorpay; ulearn transactions/credits; Udemy Stripe | Deferred — courselit Stripe pattern reserved |
| Video pipeline | LMS-Udemy-Type Multer/Cloudinary | Deferred |

## 3. Directory structure (target)

```
Zero2One/
  src/
    lib/domain/types.ts        ✅ RBAC + 5-tier types
    lib/gamification/rules.ts  ✅ XP/streak/freeze (pure, tested next)
    lib/content/schemas.ts     ✅ Zod lesson/drill validation
    lib/rbac.ts                ✅ role helpers
    lib/quiz/                  ✅ registry + scoring + zod schemas (classroomio-inspired)
    components/workspace/      ⏳ StandardIde, DrillInterface, VibeIde
    components/ui/             ⏳ design tokens
    routes/                    ⏳ TanStack file routes
    server/                    ✅ execution fallback (Judge0 batch + grading)
  supabase/schema.sql          ✅ base DDL (from legacy, RLS intact)
  public/logo.svg              ✅ brand asset
```

## 4. Key decisions

- No `any`; Zod at all content boundaries; server actions over monolithic handlers.
- COOP/COEP headers required in `vite.config.ts` (SharedArrayBuffer for WASM).
- Dual taxonomy kept: Career Tracks (role mastery) vs Micro-Courses (tool focus).
- Lesson-first: theory + demo must unlock before graded drill.
- Legacy + references are read-only; all new code lives here under `Zero2One` namespace.
