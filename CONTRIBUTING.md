<!-- Language: **English** | [Türkçe](#türkçe) -->

# Contributing to StudyMentor

Thanks for taking the time to contribute! This project is a learning-focused
full-stack app (React + Express/Prisma + a small FastAPI ML service) and
contributions of all sizes are welcome — bug reports, docs, tests, and features.

## Ways to contribute

- **Report a bug** — open an issue with the "Bug report" template.
- **Suggest a feature** — open an issue with the "Feature request" template.
- **Pick up an issue** — anything labelled `good first issue` or `help wanted`.
- **Improve docs** — README, code comments, this file.

If you plan a larger change, please open an issue first so we can agree on the
approach before you spend time on it.

## Project layout

| Path | What it is |
| --- | --- |
| `frontend/` | Vite + React 19 + TypeScript + Tailwind v4 single-page app |
| `backend/` | Express + TypeScript + Prisma REST API (JWT auth, email verification) |
| `ml-service/` | FastAPI service that serves study-priority predictions from a trained model |
| `Documents/` | Design docs (UML, DB, ML methodology) |
| `CLAUDE.md` | Architecture notes and conventions — **read this before a non-trivial change** |

## Prerequisites

- **Node.js 20+** and npm
- **Python 3.10+** (only for `ml-service/`)
- A **PostgreSQL** database. The project is developed against Supabase, but any
  Postgres 14+ works. You need a pooled connection URL and a direct connection URL.
- A Gmail account with an **App Password** (only if you want to test the
  email-verification / password-reset flow).

## Local setup

### 1. Backend

```bash
cd backend
cp .env.example .env          # then fill in the values (see comments in the file)
npm install
npm run prisma:generate
npm run prisma:migrate        # apply migrations to your database
npm run prisma:seed           # seed the exam / subject / topic catalog
npm run dev                   # http://localhost:5000
```

Generate a real `JWT_SECRET`:

```bash
openssl rand -base64 32
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env          # VITE_API_URL defaults to http://localhost:5000/api
npm install
npm run dev                   # http://localhost:5173
```

### 3. ML service (optional)

The backend degrades gracefully when this is not running (predictions fall back
to a heuristic), so you only need it when working on ML features.

```bash
cd ml-service
python -m venv .venv
.venv/bin/pip install -r requirements.txt        # Windows: .venv\Scripts\pip.exe
# You need models/priority_model.joblib — train it once:
.venv/bin/python train.py                         # Windows: .venv\Scripts\python.exe train.py
.venv/bin/python -m uvicorn app.main:app --reload # http://localhost:8000
```

On Windows, `powershell -File start.ps1` does the last step. Run it from
`ml-service/`, not `ml-service/app/`.

> **Security note:** `ml-service` has no authentication and permissive CORS. It is
> an internal service — never expose it on a public network.

## Running checks before you open a PR

```bash
# backend
cd backend && npm test && npm run build

# frontend
cd frontend && npm test && npm run lint && npm run build
```

CI ([.github/workflows/test.yml](.github/workflows/test.yml)) runs the same
checks on every push and pull request.

## Branch & commit conventions

- Branch off `main`: `feat/short-description`, `fix/short-description`,
  `chore/short-description`, `docs/short-description`.
- Commits follow **Conventional Commits** (`feat:`, `fix:`, `docs:`, `chore:`,
  `refactor:`, `test:`). Existing history is mostly Turkish — English is fine too,
  just keep the prefix.
- Keep each PR focused on one thing. Every changed line should trace to the issue
  it closes.

## Code conventions

- The codebase mixes **Turkish** (domain content, comments, user-facing copy) and
  **English** (identifiers, types). Match the file you are editing.
- Backend is strictly layered: `routes/ → controllers/ (zod validation) →
  services/ (Prisma) → prisma`. Throw `HttpError` for business errors.
- `backend/prisma/schema.prisma` is the source of truth for the data model —
  every schema change needs a matching migration (`npm run prisma:migrate`).
- Frontend shared types live in `frontend/src/types/index.ts` and are hand-kept
  in sync with the Prisma schema.
- The app has two personas (`STUDENT` / `LIFELONG_LEARNER`) — new features
  usually need a sensible variant for both.

## Reporting security issues

Please **do not** open a public issue for a vulnerability. See
[SECURITY.md](SECURITY.md).

---

<a name="türkçe"></a>

# Türkçe

# StudyMentor'a Katkı

Katkıda bulunmaya vakit ayırdığın için teşekkürler! Bu proje öğrenme odaklı bir
full-stack uygulama (React + Express/Prisma + küçük bir FastAPI ML servisi) ve her
boyutta katkı memnuniyetle karşılanır — hata bildirimi, dokümantasyon, test ve
özellikler.

## Nasıl katkı sağlayabilirsin

- **Hata bildir** — "Bug report" şablonuyla bir issue aç.
- **Özellik öner** — "Feature request" şablonuyla bir issue aç.
- **Bir issue üstlen** — `good first issue` veya `help wanted` etiketli olanlar.
- **Dokümanları iyileştir** — README, kod yorumları, bu dosya.

Büyük bir değişiklik planlıyorsan, zaman harcamadan önce yaklaşım üzerinde
anlaşabilmek için lütfen önce bir issue aç.

## Proje yapısı

| Yol | Nedir |
| --- | --- |
| `frontend/` | Vite + React 19 + TypeScript + Tailwind v4 tek sayfa uygulama |
| `backend/` | Express + TypeScript + Prisma REST API (JWT auth, e-posta doğrulama) |
| `ml-service/` | Eğitilmiş modelden çalışma-önceliği tahmini sunan FastAPI servisi |
| `Documents/` | Tasarım dokümanları (UML, DB, ML metodolojisi) |
| `CLAUDE.md` | Mimari notlar ve kurallar — **önemli bir değişiklikten önce oku** |

## Ön koşullar

- **Node.js 20+** ve npm
- **Python 3.10+** (yalnızca `ml-service/` için)
- Bir **PostgreSQL** veritabanı. Proje Supabase ile geliştiriliyor ama Postgres
  14+ herhangi bir kurulum çalışır. Bir pooled (havuzlanmış) bağlantı URL'i ve bir
  direct (doğrudan) bağlantı URL'i gerekiyor.
- **Uygulama Şifreli** bir Gmail hesabı (yalnızca e-posta doğrulama / şifre
  sıfırlama akışını test etmek istiyorsan).

## Yerel kurulum

### 1. Backend

```bash
cd backend
cp .env.example .env          # sonra değerleri doldur (dosyadaki yorumlara bak)
npm install
npm run prisma:generate
npm run prisma:migrate        # migration'ları veritabanına uygula
npm run prisma:seed           # sınav / ders / konu kataloğunu doldur
npm run dev                   # http://localhost:5000
```

Gerçek bir `JWT_SECRET` üret:

```bash
openssl rand -base64 32
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env          # VITE_API_URL varsayılanı http://localhost:5000/api
npm install
npm run dev                   # http://localhost:5173
```

### 3. ML servisi (opsiyonel)

Bu servis çalışmadığında backend zarifçe devam eder (tahminler bir sezgisel
yönteme düşer), o yüzden yalnızca ML özellikleri üzerinde çalışırken gerekir.

```bash
cd ml-service
python -m venv .venv
.venv\Scripts\pip.exe install -r requirements.txt
# models/priority_model.joblib gerekiyor — bir kez eğit:
.venv\Scripts\python.exe train.py
.venv\Scripts\python.exe -m uvicorn app.main:app --reload   # http://localhost:8000
```

Windows'ta son adımı `powershell -File start.ps1` yapar. `ml-service/app/`
içinden değil, `ml-service/` içinden çalıştır.

> **Güvenlik notu:** `ml-service`'in kimlik doğrulaması yok ve CORS'u serbest. Bu
> bir iç servistir — asla public bir ağda açığa çıkarma.

## PR açmadan önce kontroller

```bash
# backend
cd backend && npm test && npm run build

# frontend
cd frontend && npm test && npm run lint && npm run build
```

CI ([.github/workflows/test.yml](.github/workflows/test.yml)) aynı kontrolleri her
push ve pull request'te çalıştırır.

## Branch & commit kuralları

- `main`'den branch aç: `feat/kisa-aciklama`, `fix/kisa-aciklama`,
  `chore/kisa-aciklama`, `docs/kisa-aciklama`.
- Commit'ler **Conventional Commits** biçiminde (`feat:`, `fix:`, `docs:`,
  `chore:`, `refactor:`, `test:`). Mevcut geçmiş çoğunlukla Türkçe — İngilizce de
  olur, yeter ki ön ek dursun.
- Her PR tek bir şeye odaklı olsun. Değişen her satır kapattığı issue'ya
  bağlanabilmeli.

## Kod kuralları

- Kod tabanı **Türkçe** (alan içeriği, yorumlar, kullanıcıya görünen metin) ve
  **İngilizce** (tanımlayıcılar, tipler) karışımıdır. Düzenlediğin dosyaya uy.
- Backend katı katmanlıdır: `routes/ → controllers/ (zod doğrulama) → services/
  (Prisma) → prisma`. İş hataları için `HttpError` fırlat.
- Veri modelinin doğruluk kaynağı `backend/prisma/schema.prisma` — her şema
  değişikliği bir migration gerektirir (`npm run prisma:migrate`).
- Frontend ortak tipleri `frontend/src/types/index.ts` içindedir ve Prisma
  şemasıyla elle senkron tutulur.
- Uygulamanın iki personası var (`STUDENT` / `LIFELONG_LEARNER`) — yeni
  özellikler genelde ikisi için de mantıklı bir varyant ister.

## Güvenlik açığı bildirimi

Bir güvenlik açığı için lütfen **public issue açma**. Bkz. [SECURITY.md](SECURITY.md).
