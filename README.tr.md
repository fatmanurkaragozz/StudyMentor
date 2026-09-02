# 🎓 StudyMentor

[English](README.md) · **Türkçe**

[![Tests](https://github.com/fatmanurkaragozz/StudyMentor/actions/workflows/test.yml/badge.svg)](https://github.com/fatmanurkaragozz/StudyMentor/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

StudyMentor; ortaokul, lise ve üniversite öğrencileri ile ömür boyu öğrenenler
için yapay zekâ destekli kişisel çalışma planlama ve öğrenme analitiği
platformudur. Çalışma programını düzenlemene, sınav kataloglarına göre ilerlemeni
takip etmene, alışkanlık kurmana ve bir makine öğrenmesi modelinden çalışma
önceliği önerileri almana yardımcı olur.

> **Proje durumu:** tek kişilik bir staj / öğrenme projesi olarak başladı, artık
> katkıya açık. Üç servisin de gerçek, çalışan kodu var. Test kapsamı hâlâ zayıf
> ve henüz barındırılan bir dağıtım yok — bkz. [yol haritası](#-yol-haritası).

---

## ✨ Özellikler

- **Kimlik doğrulama** — e-posta/parola kaydı, e-posta doğrulama ve parola
  sıfırlama (Gmail SMTP üzerinden 6 haneli kodlar), JWT access token + httpOnly
  refresh cookie, hassas uçlarda rate limiting.
- **Çift persona** — `STUDENT` ve `LIFELONG_LEARNER` modları; her birinin kendi
  metni ve veri kaynağı.
- **Kontrol paneli** — ders ve konu bazında ilerleme özeti.
- **Çalışma planlayıcı & takvim** — oturumlar, tüm Türk ulusal sınav kataloğuna
  (LGS, TYT/AYT/YDT, KPSS, ALES, DGS, YÖKDİL, AGS, YDS…) göre sınav takibi.
- **Alışkanlık takibi & günlük** — ruh hâli takibiyle.
- **AI içgörüleri** — eğitilmiş bir modele dayalı çalışma önceliği önerileri; ML
  servisi kapalıyken sezgisel bir yönteme düşer.
- **Açık / koyu tema.**

---

## 🏗 Mimari

```
frontend/  (React SPA)  ──HTTP──▶  backend/  (Express + Prisma API)  ──HTTP──▶  ml-service/  (FastAPI)
                                        │                                          │
                                        ▼                                          ▼
                                   PostgreSQL                              priority_model.joblib
```

| Servis | Teknoloji | Notlar |
| --- | --- | --- |
| **frontend/** | Vite, React 19, TypeScript, Tailwind CSS v4 | Tek sayfa uygulama, router yok — gezinme bileşen state'i ile. Ekranlar backend'i doğrudan `src/lib/apiClient.ts` üzerinden çağırır. |
| **backend/** | Node.js, Express, TypeScript, Prisma, PostgreSQL | Katı katmanlı: `routes → controllers (zod) → services (Prisma)`. JWT auth + e-posta doğrulama. Doğruluk kaynağı `prisma/schema.prisma`. |
| **ml-service/** | Python, FastAPI, scikit-learn / XGBoost, pandas | Tek modelli skorlama servisi. `train.py`, `models/priority_model.joblib` üretir (gitignore'lu); `app/main.py` tahminleri sunar. Yalnızca iç kullanım — **tasarım gereği kimlik doğrulaması yok.** |

Daha fazla ayrıntı ve kurallar [CLAUDE.md](CLAUDE.md) içinde.

---

## 🚀 Hızlı başlangıç

Ön koşullar: **Node.js 20+**, **Python 3.10+** (yalnızca ML servisi için) ve bir
**PostgreSQL** veritabanı (proje Supabase kullanıyor; Postgres 14+ herhangi bir
kurulum çalışır).

```bash
# 1. Backend
cd backend
cp .env.example .env          # DATABASE_URL, DIRECT_URL, JWT_SECRET, Gmail SMTP doldur
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev                   # http://localhost:5000

# 2. Frontend (yeni terminal)
cd frontend
cp .env.example .env
npm install
npm run dev                   # http://localhost:5173

# 3. ML servisi (opsiyonel — backend bu olmadan sezgisel yönteme düşer)
cd ml-service
python -m venv .venv
.venv\Scripts\pip.exe install -r requirements.txt
.venv\Scripts\python.exe train.py                    # models/priority_model.joblib üretir
.venv\Scripts\python.exe -m uvicorn app.main:app --reload   # http://localhost:8000
```

Gerçek bir JWT secret'ı `openssl rand -base64 32` ile üret.
Gmail Uygulama Şifresi dâhil tüm kurulum notları
[CONTRIBUTING.md](CONTRIBUTING.md) içinde.

---

## ✅ Test

```bash
cd backend  && npm test && npm run build
cd frontend && npm test && npm run lint && npm run build
```

Aynı kontroller her push ve pull request'te CI'da çalışır
([.github/workflows/test.yml](.github/workflows/test.yml)).

---

## 🚢 Dağıtım

Backend, `main`'e her push'ta **Azure Container Apps**'e otomatik dağıtılır
([.github/workflows/deploy.yml](.github/workflows/deploy.yml)). Azure kimlik
doğrulaması OIDC kullanır (saklanan sır yok); tek seferlik kurulum için
[docs/deployment.md](docs/deployment.md). Frontend ve ML servisi henüz
dağıtılmıyor.

---

## 📁 Proje yapısı

```
StudyMentor/
├── frontend/       React SPA
├── backend/        Express + Prisma API
│   └── prisma/     şema, migration'lar, seed
├── ml-service/     FastAPI tahmin servisi
│   ├── app/        sunulan API
│   ├── notebooks/  EDA ve model karşılaştırması
│   └── train.py    modeli eğitir
├── Documents/      tasarım dokümanları (UML, DB, ML metodolojisi)
└── CLAUDE.md       mimari notlar & kurallar
```

---

## 🤝 Katkı

Her boyutta katkı memnuniyetle karşılanır. Kurulum, kurallar ve PR kontrol
listesi için [CONTRIBUTING.md](CONTRIBUTING.md), davranış kuralları için
[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) dosyalarını oku.

- Hata / özellik → uygun şablonla bir issue aç.
- Başlangıç için iyi noktalar → `good first issue` ve `help wanted` etiketli
  issue'lar.
- Güvenlik açıkları → public issue **açma**; bkz. [SECURITY.md](SECURITY.md).

---

## 📅 Yol haritası

- [x] Gereksinim analizi, UML & veritabanı tasarımı
- [x] Kimlik doğrulama (JWT + e-posta doğrulama + parola sıfırlama)
- [x] Çalışma planlayıcı, takvim, kontrol paneli — gerçek API'ye bağlı
- [x] Sınav kataloğu (Türk ulusal sınavları) + müfredat seed'i
- [x] Alışkanlık takibi & günlük
- [x] ML öncelik modeli — eğitildi (ASSISTments veri seti) ve FastAPI ile sunuluyor
- [x] AI içgörüleri backend'e bağlı, sezgisel geri dönüşle
- [x] Backend dağıtım hattı (Azure Container Apps, OIDC)
- [ ] Daha geniş otomatik test kapsamı
- [ ] Frontend & ML servisi dağıtımı
- [ ] Kaynak önerileri (`ResourceSuggestion` modeli var ama kullanılmıyor)

---

## 📄 Lisans

[MIT](LICENSE) © 2026 Fatma Nur Karagöz
