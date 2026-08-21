# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

StudyMentor is a solo-developer full-stack project (internship/learning project, currently on `feature/exam-catalog-and-platform-fixes`, not yet merged to `main`). All three subprojects now have real, working code — this is no longer an early scaffolding-only state:

- **frontend/** — a React app whose screens are wired to the real backend via [frontend/src/lib/apiClient.ts](frontend/src/lib/apiClient.ts) (Dashboard, StudyPlanner, RealCalendar, GrowthHub, MyCourses, AIInsights, auth/onboarding flow all call it directly). Session survives a page reload (see `App.tsx`'s bootstrap effect + `GET /users/me`).
- **backend/** — a full Express + TypeScript + Prisma API under `backend/src` (JWT auth + email verification, layered controllers/services/routes/validation/middleware, auth rate limiting). `npm run dev` actually runs a server now.
- **ml-service/** — a small FastAPI service (`ml-service/app/main.py`, `model.py`, `predict.py`) that serves priority predictions from a trained model (`ml-service/models/priority_model.joblib`, gitignored, produced by `ml-service/train.py`). Backend calls it from [backend/src/services/mlClient.service.ts](backend/src/services/mlClient.service.ts) via the `ML_SERVICE_URL` env var, with a fallback when it's unreachable. Treat it as a small single-model scoring service, not a general ML platform — don't assume endpoints beyond what's in `app/main.py`.

### Known gaps (don't assume these are finished)
- No automated test suite exists yet for backend or frontend.
- `ResourceSuggestion` (Prisma model) is defined but unused by any service — see Architecture below.
- Tailwind v4's dark mode is class-based via `@custom-variant dark (&:where(.dark, .dark *));` in [frontend/src/index.css](frontend/src/index.css) — if this line is ever removed/lost (e.g. during a merge), every `dark:` utility class silently falls back to following the OS `prefers-color-scheme` instead of the in-app theme toggle, with no error or warning. Worth remembering if dark mode ever "stops working" after a merge.

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
npm run dev              # tsx watch src/index.ts
npm run build             # tsc
npm run start             # node dist/index.js
npm run prisma:migrate    # prisma migrate dev
npm run prisma:studio     # prisma studio
npm run prisma:generate   # prisma generate
npm run prisma:seed       # tsx prisma/seed.ts (seeds the full exam/subject/topic catalog)
```
Requires `backend/.env` with `DATABASE_URL` and `DIRECT_URL` (Supabase Postgres, pooled + direct connection), `JWT_SECRET`, and Gmail SMTP credentials (`GMAIL_USER`, `GMAIL_APP_PASSWORD`) for email verification — see [backend/.env.example](backend/.env.example). Optional `ML_SERVICE_URL` points at the ml-service below.

### ML service (`ml-service/`)
Python/FastAPI, with its own `.venv` and `requirements.txt`. `train.py` trains the model and writes `models/priority_model.joblib`; `app/main.py` serves predictions from it.

**Starting it:** unlike frontend/backend, nothing starts this automatically — it must be run manually from `ml-service/`:
```
.venv\Scripts\python.exe -m uvicorn app.main:app --reload
```
(or `powershell -File ml-service/start.ps1`). Must be run from `ml-service/`, not `ml-service/app/` — `app.main:app` relies on absolute imports rooted at `ml-service/`. Don't use `.venv\Scripts\Activate.ps1` first — PowerShell execution-policy issues have made venv activation unreliable on this machine; calling `.venv\Scripts\python.exe` directly sidesteps that. Backend gracefully degrades (`mlClient.service.ts`, 5s timeout) when this isn't running, so the app still works without it — but priority predictions/mini-check results won't be real.

## Architecture

### Frontend
- Vite + React 19 + TypeScript + Tailwind CSS v4 (via `@tailwindcss/vite`).
- Single-page app; navigation is done via local component state, not a router. [frontend/src/App.tsx](frontend/src/App.tsx) sequences three screens: `NotebookIntro` (mode selection) → `LandingPage` → `MainLayout` (sidebar + header + tab content switched on `activeTab`).
- Global state lives in two React contexts, both wrapping the whole app in `App()`:
  - [ThemeContext](frontend/src/context/ThemeContext.tsx) — light/dark theme.
  - [AppContext](frontend/src/context/AppContext.tsx) — holds the current `user` profile (hydrated from the backend on login and restored from a stored JWT via `GET /users/me` on page load, see `App.tsx`) and `activeTab`. It is not a general data cache — most screens fetch their own domain data (recommendations, sessions, habits, etc.) directly via `apiClient` rather than going through context.
- The app has two parallel personas driven by `UserMode` (`STUDENT` vs `LIFELONG_LEARNER`), set once during the `NotebookIntro` step. Most screens branch on `user.mode` / `isStudent` to pick different copy and data sources. Keep this dual-mode branching in mind when adding features — most data models need a sensible variant for both personas.
- Shared domain types are centralized in [frontend/src/types/index.ts](frontend/src/types/index.ts) — these mirror (but are not generated from) the Prisma schema's shape, so keep them in sync by hand when the schema changes.
- Linting uses `oxlint` (config in [frontend/.oxlintrc.json](frontend/.oxlintrc.json)), not ESLint.

### Backend
- Layered and consistent: `routes/` → `controllers/` (parse input via zod schemas in [backend/src/validation/schemas.ts](backend/src/validation/schemas.ts)) → `services/` (business logic + Prisma) → `prisma`. Every route is wrapped in [asyncHandler](backend/src/utils/asyncHandler.ts); business errors are thrown as [HttpError](backend/src/utils/httpError.ts) and centrally handled by [errorHandler](backend/src/middleware/errorHandler.ts).
- [backend/prisma/schema.prisma](backend/prisma/schema.prisma) is the source of truth for the data model. Key models: `User` → `Subject` → `Topic` → `StudySession`; plus `Exam`/`ExamSubject`, `Habit`/`HabitLog`, `Journal`, `AIRecommendation`, `DailyTask`, and `ResourceSuggestion` (defined but not yet used by any service — don't build against it without checking first).
- `backend/prisma/migrations/` holds the real incremental history (8 migrations as of this writing) — don't hand-edit the schema without a matching migration.
- `ExamCategory` covers the full Turkish national exam catalog (LGS, TYT/AYT/YDT, KPSS incl. Eğitim Bilimleri, ALES, DGS, YÖKDİL incl. Fen/Sosyal/Sağlık, AGS, YDS, plus legacy `YOKDIL` kept for back-compat and `OTHER` for user-defined exams) — seeded via [backend/prisma/seed.ts](backend/prisma/seed.ts), which also builds the full subject/topic curriculum tree per exam category.
- `EducationLevel` in the Prisma schema (`MIDDLE_SCHOOL`, `HIGH_SCHOOL`, `UNIVERSITY`, `LIFELONG_LEARNER`) and the frontend's `UserMode`/`EducationLevel` types in [frontend/src/types/index.ts](frontend/src/types/index.ts) are meant to line up — double check both when changing either.
- Subjects can be either global (curriculum/`educationLevel`-defined, or exam-catalog/`examCategory`-defined, `userId` null) or user-defined custom subjects (`userId` set) — respect this nullable-owner pattern rather than assuming every `Subject` belongs to a user.
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