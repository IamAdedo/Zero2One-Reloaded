# Zero2One Reloaded

Next-generation tech learning platform: dual-phase (Concept Lesson → Hands-On Drill)
micro-modules, career tracks + micro-courses, in-browser execution (WebContainers /
Pyodide / WASM + Judge0 fallback), XP/streak gamification, RBAC authoring studio.

Synthesized from `Zero2One-Legacy` + 7 open-source references (see `ARCHITECTURE.md`).
Sources are read-only; all new code lives here.

## Quickstart

```bash
cp .env.example .env   # fill SUPABASE_URL / keys / GEMINI_API_KEY
npm install
npm run dev            # http://localhost:3000
npm run typecheck
```

WASM runners require the COOP/COEP headers (already in `vite.config.ts`).

## Docs

- `ARCHITECTURE.md` — synthesis matrix, schema, directory map, decisions
- `WORKING.md` — active state / next steps
- `supabase/schema.sql` — Postgres DDL with RLS
