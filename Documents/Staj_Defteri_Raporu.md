# StudyMentor - Staj Defteri Günlük Raporu

Bu rapor, StudyMentor projesi kapsamında gerçekleştirilen günlük çalışmaları ve teknik detayları staj defterine aktarılmak üzere özetlemektedir.

---

### 📅 1. Gün: 20 Temmuz 2026 (Pazartesi)
**Yapılan Çalışmalar:**
- **Proje Tanımı ve Gereksinim Analizi:** AI destekli çalışma planlayıcısı ve öğrenme analitiği platformu (StudyMentor) için yazılım gereksinim analizi (SRS) raporu incelendi. Sistemin hedefleri, modülleri ve kullanıcı rolleri belirlendi.
- **Teknoloji Yığınının Seçilmesi:** 
  - Arayüz (Frontend) için: React + TypeScript + Vite + Tailwind CSS
  - Sunucu (Backend) için: Node.js + Express.js + Prisma ORM + PostgreSQL
  - Yapay Zeka (AI/ML) için: Python + FastAPI + Pandas + Scikit-Learn
  - DevOps için: Docker + GitHub Actions + Supabase
- **Zaman Planlaması:** Projenin 8 haftalık Gantt şeması ve haftalık yol haritası hazırlanarak staj çalışma takvimi oluşturuldu.

---

### 📅 2. Gün: 21 Temmuz 2026 (Salı)
**Yapılan Çalışmalar:**
- **Sistem Tasarımı (UML Diyagramları):**
  - Öğrenci, yönetici ve yapay zeka servisi arasındaki etkileşimleri tanımlayan **Use Case Diyagramı** çizildi.
  - Kullanıcının ders çalışma seansı ekleme ve yapay zekanın bu veriyi analiz ederek öneri üretme akışını modelleyen **Activity Diyagramı** tasarlandı.
- **Veritabanı ER Modeli Tasarımı:** Kullanıcı, dersler (Subject), alt konular (Topic), çalışma oturumları (StudySession), deneme sınavları, alışkanlıklar ve günlük (Journal) arasındaki ilişkileri gösteren Entity Relationship Diagram (ERD) hazırlandı.
- **Proje Yapısının Kurulması ve Git Konfigürasyonu:**
  - `backend/` ve `ml-service/` klasör yapıları oluşturuldu.
  - `node_modules` ve `.env` gibi hassas ve gereksiz dosyaların versiyon kontrol sistemine (Git) gitmesini engellemek için projenin kök dizininde `.gitignore` dosyası yapılandırıldı.
- **Supabase ve Prisma Entegrasyonu:**
  - Bulut üzerinde PostgreSQL veritabanı barındırmak amacıyla **Supabase** projesi kuruldu. AWS Frankfurt (`eu-central-1`) lokasyonu seçilerek düşük gecikme sağlandı.
  - Prisma ORM şeması (`schema.prisma`) yazılarak veri tabanı tabloları tanımlandı. Supabase bağlantı havuzu (Transaction pooler - port 6543) ve doğrudan bağlantı (Session pooler - port 5432) ayarları `.env` üzerinden projeye bağlandı.
  - `npm run prisma:migrate` komutu çalıştırılarak tüm veritabanı şeması canlı PostgreSQL veritabanına aktarıldı ve tablolar oluşturuldu.
- **Veri Bilimi ve Makine Öğrenmesi Ön Hazırlığı:**
  - Pandas ve NumPy kütüphanelerini pekiştirmek için egzersiz senaryoları (`study_pandas.py`) ve ML bağımlılıkları (`requirements.txt`) yazıldı.
- **Figma UI/UX Tasarım Süreci:**
  - Figma AI kullanılarak uygulamanın aydınlık mod Bento Grid yapısındaki dashboard sayfası tasarlandı. Tasarım dili, renk paleti ve tipografi standartları belirlendi.
