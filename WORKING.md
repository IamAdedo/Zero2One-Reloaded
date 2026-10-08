# ZERO2ONE-RELOADED ACTIVE STATE

## Current Phase
**Phase:** Foundation & Core Setup (Phase 2, step 1)
**Last Updated:** 2026-10-08

## Done this session
- [x] Quiz registry `src/lib/quiz/` (registry/scoring/schemas/index, 11 smoke assertions green, tsc clean)
- [x] Server execution fallback `src/server/execution.ts` (19 smoke assertions green, tsc clean)
- [x] TanStack app shell (client/router/start/server, root layout, landing, `vite build` + tsc clean)
- [x] Workspace store `src/store/useWorkspaceStore.ts` (LESSON→DRILL, seed-if-absent code, XP floor, 10 smoke assertions green)
- [x] DrillInterface port `src/components/workspace/DrillInterface.tsx` (Monaco + v4 resizable panes, store/quiz/XP wired, 7 SSR render checks green)
- [x] Workspace route `/workspace/$drillId` (seed registry, `runDrill` server fn → Judge0 fallback, full SSR, 404 page)
- [x] Lesson route `/lessons/$lessonId` + `LessonView` (Phase 1 → drill CTA → review-lesson loop, SSR verified)
- [x] Supabase client + `AuthProvider` (null-safe offline mode, `VITE_` browser vars, SSR-safe static env access, 6 smoke checks green)
- [x] Login route + header `AuthButton` (offline notice when unconfigured, SSR-safe loading placeholder)
- [x] Gamification slice: `StreakCounter` (compact/card) + `useLocalStreak` offline hook, wired to drill passes (11 smoke checks green)
- [x] Catalog index: `/tracks` + `/courses` from seed relations, header nav, landing CTAs
- [x] Track detail `/tracks/$slug` (module/lesson/drill curriculum tree, 404 page)
- [x] Course detail `/courses/$slug` (mirror curriculum tree, 404 page)
- [x] Leaderboard `/leaderboard` (dense ranking engine, seed board + local XP row, XP/drills toggle)
- [x] Remote progress sync (`syncPassToRemote`, UUID-guarded, explicit skip reasons, wired to drill passes; 9 smoke checks green)
- [x] Relocated `zero2one` → `Zero2One-Legacy` (read-only, remote `IamAdedo/zero2one` intact)
- [x] Created `./Zero2One`, `git init`, `origin → IamAdedo/Zero2One-Reloaded.git` (repo must exist on GitHub before push)
- [x] Phase 1 audit: legacy routes/schemas/state/workspace/gamification mapped; 7 reference repos inventoried (see ARCHITECTURE.md matrix)
- [x] Foundation: package.json (Zero2One namespace), tsconfig (strict), vite.config (COOP/COEP), .env.example, .gitignore/.gitattributes
- [x] Ported pure modules: `lib/domain/types.ts`, `lib/gamification/rules.ts`, `lib/content/schemas.ts`, `lib/rbac.ts`
- [x] Base DDL `supabase/schema.sql` + `public/logo.svg` carried over as migration start

## Next (incremental: Auth → DB → UI Core → Learning Engines → Gamification)
1. Lesson view (Phase 1) + Supabase wiring; live grading needs `JUDGE0_URL` in `.env`

## Gotchas
- `vite dev` regenerates `routeTree.gen.ts` WITHOUT the `@tanstack/react-start` Register block → permanent fix: augmentation lives in tracked `src/start-register.ts`, independent of the generated file. `npm run build` still required after adding routes (regenerates tree).
- Monaco must load via `lazy()` — static import breaks SSR module interop (client-render fallback, hydration risk).
4. Workspace ports: StandardIde → DrillInterface → VibeIde
5. Initial commit + push (after creating GitHub repo `Zero2One-Reloaded`)

## Constraints active
- Never mutate `./Zero2One-Legacy` or `./reference/*`
- Strict TS, no `any`; Tailwind tokens; COOP/COEP kept
- Host git user only, no --author flags
