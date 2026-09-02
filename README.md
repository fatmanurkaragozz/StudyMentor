# 🎓 StudyMentor

**English** · [Türkçe](README.tr.md)

[![Tests](https://github.com/fatmanurkaragozz/StudyMentor/actions/workflows/test.yml/badge.svg)](https://github.com/fatmanurkaragozz/StudyMentor/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

StudyMentor is an AI-powered personalized study-planning and learning-analytics
platform for middle-school, high-school and university students, as well as
lifelong learners. It helps you organise study schedules, track progress against
exam catalogs, build habits, and get study-priority recommendations from a
machine-learning model.

> **Project status:** started as a solo internship / learning project, now open to
> contributions. All three services have real, working code. Test coverage is
> still thin and there is no hosted deployment yet — see the [roadmap](#-roadmap).

---

## ✨ Features

- **Auth** — email/password registration, email verification and password reset
  (6-digit codes over Gmail SMTP), JWT access tokens + httpOnly refresh cookie,
  rate limiting on sensitive endpoints.
- **Dual personas** — `STUDENT` and `LIFELONG_LEARNER` modes, each with its own
  copy and data sources.
- **Dashboard** — progress overview per subject and topic.
- **Study planner & calendar** — sessions, exam tracking against the full Turkish
  national exam catalog (LGS, TYT/AYT/YDT, KPSS, ALES, DGS, YÖKDİL, AGS, YDS…).
- **Habit tracker & daily journal** — with mood tracking.
- **AI insights** — study-priority recommendations backed by a trained model,
  with a heuristic fallback when the ML service is offline.
- **Light / dark theme.**

---

## 🏗 Architecture

```
frontend/  (React SPA)  ──HTTP──▶  backend/  (Express + Prisma API)  ──HTTP──▶  ml-service/  (FastAPI)
                                        │                                          │
                                        ▼                                          ▼
                                   PostgreSQL                              priority_model.joblib
```

| Service | Stack | Notes |
| --- | --- | --- |
| **frontend/** | Vite, React 19, TypeScript, Tailwind CSS v4 | Single-page app, no router — navigation via component state. Screens call the backend directly through `src/lib/apiClient.ts`. |
| **backend/** | Node.js, Express, TypeScript, Prisma, PostgreSQL | Strictly layered: `routes → controllers (zod) → services (Prisma)`. JWT auth + email verification. `prisma/schema.prisma` is the source of truth. |
| **ml-service/** | Python, FastAPI, scikit-learn / XGBoost, pandas | Single-model scoring service. `train.py` produces `models/priority_model.joblib` (gitignored); `app/main.py` serves predictions. Internal only — **no auth by design.** |

More detail and conventions are in [CLAUDE.md](CLAUDE.md).

---

## 🚀 Quickstart

Prerequisites: **Node.js 20+**, **Python 3.10+** (for the ML service only), and a
**PostgreSQL** database (the project uses Supabase; any Postgres 14+ works).

```bash
# 1. Backend
cd backend
cp .env.example .env          # fill in DATABASE_URL, DIRECT_URL, JWT_SECRET, Gmail SMTP
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev                   # http://localhost:5000

# 2. Frontend (new terminal)
cd frontend
cp .env.example .env
npm install
npm run dev                   # http://localhost:5173

# 3. ML service (optional — backend falls back to a heuristic without it)
cd ml-service
python -m venv .venv
.venv/bin/pip install -r requirements.txt     # Windows: .venv\Scripts\pip.exe
.venv/bin/python train.py                      # produces models/priority_model.joblib
.venv/bin/python -m uvicorn app.main:app --reload   # http://localhost:8000
```

Generate a real JWT secret with `openssl rand -base64 32`.
Full setup notes, including the Gmail App Password, are in
[CONTRIBUTING.md](CONTRIBUTING.md).

---

## ✅ Testing

```bash
cd backend  && npm test && npm run build
cd frontend && npm test && npm run lint && npm run build
```

The same checks run in CI on every push and pull request
([.github/workflows/test.yml](.github/workflows/test.yml)).

---

## 🚢 Deployment

The backend auto-deploys to **Azure Container Apps** on every push to `main`
([.github/workflows/deploy.yml](.github/workflows/deploy.yml)). Azure auth uses
OIDC (no stored secret); see [docs/deployment.md](docs/deployment.md) for the
one-time setup. The frontend and ML service are not deployed yet.

---

## 📁 Project structure

```
StudyMentor/
├── frontend/       React SPA
├── backend/        Express + Prisma API
│   └── prisma/     schema, migrations, seed
├── ml-service/     FastAPI prediction service
│   ├── app/        the served API
│   ├── notebooks/  EDA and model comparison
│   └── train.py    trains the model
├── Documents/      design docs (UML, DB, ML methodology)
└── CLAUDE.md       architecture notes & conventions
```

---

## 🤝 Contributing

Contributions of all sizes are welcome. Please read
[CONTRIBUTING.md](CONTRIBUTING.md) for setup, conventions, and the PR checklist,
and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

- Bugs / features → open an issue with the matching template.
- Good starting points → issues labelled `good first issue` and `help wanted`.
- Security issues → **do not** open a public issue; see [SECURITY.md](SECURITY.md).

---

## 📅 Roadmap

- [x] Requirements analysis, UML & database design
- [x] Authentication (JWT + email verification + password reset)
- [x] Study planner, calendar, dashboard — wired to the real API
- [x] Exam catalog (Turkish national exams) + curriculum seed
- [x] Habit tracker & journal
- [x] ML priority model — trained (ASSISTments dataset) and served via FastAPI
- [x] AI insights wired to the backend, with heuristic fallback
- [x] Backend deployment pipeline (Azure Container Apps, OIDC)
- [ ] Broader automated test coverage
- [ ] Frontend & ML service deployment
- [ ] Resource suggestions (`ResourceSuggestion` model exists but is unused)

---

## 📄 License

[MIT](LICENSE) © 2026 Fatma Nur Karagöz
