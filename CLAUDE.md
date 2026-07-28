# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

StudyMentor is an early-stage, solo-developer full-stack project (internship/learning project, currently on `setup/week-1`). Treat the three subprojects as being at very different levels of maturity:

- **frontend/** — a real React app with UI screens, mock in-memory data, and no backend wiring yet.
- **backend/** — only a Prisma schema and package scaffolding exist. There is **no `backend/src` directory and no Express server code yet** (`package.json` points at `src/index.js`, which does not exist). Don't assume API routes, controllers, or middleware exist — check first.
- **ml-service/** and **frontend/ml-service/** — placeholder/scratch material (a dataset CSV and a pandas learning script), not a running FastAPI service. Don't assume an ML API exists.

Because backend and ML service are unbuilt, the frontend currently runs entirely on mock data defined in [frontend/src/context/AppContext.tsx](frontend/src/context/AppContext.tsx) — there are no real HTTP calls yet.

## Commands

### Frontend (`frontend/`)
```
npm run dev       # start Vite dev server
npm run build     # tsc -b type-check + vite build
npm run lint      # oxlint
npm run preview   # preview production build
```
There is no test runner configured yet.

### Backend (`backend/`)
```
npm run dev              # nodemon src/index.js (will fail until src/index.js is created)
npm run start            # node src/index.js
npm run prisma:migrate   # prisma migrate dev
npm run prisma:studio    # prisma studio
npm run prisma:generate  # prisma generate
```
Requires `backend/.env` with `DATABASE_URL` and `DIRECT_URL` (Supabase Postgres, pooled + direct connection) and `JWT_SECRET` — see [backend/.env.example](backend/.env.example).

## Architecture

### Frontend
- Vite + React 19 + TypeScript + Tailwind CSS v4 (via `@tailwindcss/vite`).
- Single-page app; navigation is done via local component state, not a router. [frontend/src/App.tsx](frontend/src/App.tsx) sequences three screens: `NotebookIntro` (mode selection) → `LandingPage` → `MainLayout` (sidebar + header + tab content switched on `activeTab`).
- Global state lives in two React contexts, both wrapping the whole app in `App()`:
  - [ThemeContext](frontend/src/context/ThemeContext.tsx) — light/dark theme.
  - [AppContext](frontend/src/context/AppContext.tsx) — the app's single in-memory "database": user profile, study sessions, habits, journal entries, milestones/exams, AI recommendations, and subjects/projects. All of it is seeded with hardcoded mock data and mutated via `useState` setters exposed through `useApp()`. When wiring up the real backend, this is the layer to replace/back with real API calls.
- The app has two parallel personas driven by `UserMode` (`STUDENT` vs `LIFELONG_LEARNER`), set once during the `NotebookIntro` step. Most contexts branch on `user.mode` to pick different seed data/copy (e.g. `initialSubjectsStudent` vs `initialSubjectsLearner` in AppContext). Keep this dual-mode branching in mind when adding features — most data models need a sensible variant for both personas.
- Shared domain types are centralized in [frontend/src/types/index.ts](frontend/src/types/index.ts) — these mirror (but are not generated from) the Prisma schema's shape, so keep them in sync by hand when the schema changes.
- Linting uses `oxlint` (config in [frontend/.oxlintrc.json](frontend/.oxlintrc.json)), not ESLint.

### Backend (schema-first, unimplemented)
- [backend/prisma/schema.prisma](backend/prisma/schema.prisma) is the source of truth for the data model and is further ahead than any server code. Key models: `User` → `Subject` → `Topic` → `StudySession`; plus `Exam`/`ExamSubject`, `Habit`/`HabitLog`, `Journal`, `AIRecommendation`, `ResourceSuggestion`.
- `EducationLevel` in the Prisma schema (`MIDDLE_SCHOOL`, `HIGH_SCHOOL`, `UNIVERSITY`, `LIFELONG_LEARNER`) and the frontend's `UserMode`/`EducationLevel` types in [frontend/src/types/index.ts](frontend/src/types/index.ts) are meant to line up — double check both when changing either.
- Subjects can be either global/curriculum-defined (`educationLevel` set, `userId` null) or user-defined custom subjects (`userId` set) — respect this nullable-owner pattern rather than assuming every `Subject` belongs to a user.
- DB is Postgres via Supabase, accessed through Prisma with a pooled `DATABASE_URL` (pgbouncer, port 6543) for the app and a `DIRECT_URL` (port 5432) for migrations — don't collapse these into one connection string.
- Schema comments are in Turkish; the codebase mixes Turkish (domain content, comments) and English (identifiers) — keep that convention when extending the schema or seed content.

---

# Behavioral guidelines (Andrej Karpathy skills)

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.