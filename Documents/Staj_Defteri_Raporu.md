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

---

### 📅 3. Gün: 22 Temmuz 2026 (Çarşamba)

**Yapılan Çalışmalar:**

- Bu gün StudyMentor projesi dışında, TÜBİTAK 2204-A Ortaöğretim Öğrencileri Araştırma Projeleri Yarışması (STAR) kapsamında yürütülen **süperkapasitörler** konulu araştırma projesiyle ilgilenildi.

---

### 📅 4. Gün: 23 Temmuz 2026 (Perşembe)

**Yapılan Çalışmalar:**

- **Frontend Geliştirme - Uygulama İskeleti ve Temel Ekranlar:**
  - React + TypeScript + Vite + Tailwind CSS tabanlı frontend projesinin genel klasör yapısı ve bileşen mimarisi kuruldu.
  - `ThemeContext` (aydınlık/karanlık mod) ve `AppContext` (kullanıcı profili, çalışma oturumları, alışkanlıklar, günlük, kilometre taşları, AI önerileri için mock veri katmanı ve state yönetimi) oluşturuldu.
  - Uygulamanın genel navigasyon iskeleti olan `Sidebar` ve `Header` bileşenleri geliştirildi.
  - `Dashboard` ekranı: özet istatistikler, aktif alışkanlık serisi, güncel kilometre taşı ve öne çıkan AI önerisi gösterimi tamamlandı.

---

### 📅 5. Gün: 24 Temmuz 2026 (Cuma)

**Yapılan Çalışmalar:**

- **Frontend Geliştirme - Modül Ekranlarının Tamamlanması:**
  - `StudyPlanner`: Pomodoro zamanlayıcı ve çalışma oturumu kayıt ekranı geliştirildi.
  - `CalendarGoalTracker`: sınav ve kilometre taşı takip ekranı oluşturuldu.
  - `GrowthHub`: alışkanlık takibi ve günlük (journal) modülü geliştirildi.
  - `AIInsights`: yapay zeka destekli öneriler ekranı tasarlandı.
  - `AuthModal`: giriş/kayıt akışı (mock, gerçek API bağlantısı olmadan) eklendi.
  - Uygulamanın STUDENT / LIFELONG_LEARNER ikili persona ayrımı tüm ekranlara uygulandı.

---

### 📅 6. Gün: 27 Temmuz 2026 (Pazartesi)

**Yapılan Çalışmalar:**

- **Makine Öğrenmesi İçin Veri Seti Araştırma Süreci:**
  - Mevcut `studymentor_dataset.csv`'nin sentetik (kural tabanlı/rastgele üretilmiş) olduğu ve gerçek öğrenme örüntülerini yansıtmadığı belirlendi.
  - Hedef netleştirildi: ders/konu bazlı "şimdi tekrar etmeli mi?" önceliklendirmesi.
  - Sırasıyla **xAPI-Edu-Data** (küçük örneklem, konu/tekrar bilgisi yetersiz), **UCI Student Performance** (çalışma süresi ile not arasında neredeyse hiç korelasyon bulunmadığı için hipotezi desteklemedi) ve **Duolingo Half-Life Regression** (13M satır gerçek veri, ancak kelime bazlı olup ders/konu bazlı hedefle uyuşmadığı ve düz regresyonun R²≈0 vererek başarısız olduğu tespit edildi) veri setleri incelenip gerekçeleriyle elendi.
  - Son olarak **ASSISTments 2009-2010** (gerçek matematik-öğretim platformu logları; 4.217 öğrenci, 110 gerçek matematik konusu) veri seti bulundu, iki bağımsız kaynaktan doğrulanarak indirildi ve 100.000 satırlık temiz bir örneklem hazırlandı.
- **Model Eğitimi ve Değerlendirmesi:**
  - `scikit-learn` ile bir `RandomForestClassifier` pipeline'ı kurularak "öğrenci bu konudaki soruyu doğru çözecek mi?" sorusu ikili sınıflandırma problemi olarak modellendi.
  - Sonuçlar: **AUC 0.958, doğruluk %93**; `classification_report` ve confusion matrix ile her iki sınıf için de precision/recall/F1 ayrı ayrı doğrulandı (tek bir metriğe güvenilmedi).
  - En güçlü yordayıcının öğrencinin istediği ipucu sayısı (`hint_count`, korelasyon ≈ -0.54) olduğu belirlendi.
- **FastAPI Servisinin Kurulması ve Uçtan Uca Testi:** Eğitilen model `joblib` ile kaydedilerek minimal bir FastAPI servisi (`/health`, `/predict/priority`) üzerinden gerçek isteklerle (struggling vs. confident öğrenci senaryoları) test edildi ve modelin mantıklı önceliklendirme çıktıları ürettiği doğrulandı.
- **Jupyter Notebook ile Süreç Dokümantasyonu:** Tüm keşifçi veri analizi, başarısız denemeler ve nihai model eğitimi süreci, çalıştırılmış çıktıları (ve confusion matrix görselini) içeren bir Jupyter not defterinde (`ml-service/notebooks/spaced_repetition_eda.ipynb`) adım adım belgelendi.

---

### 📅 7. Gün: 28 Temmuz 2026 (Salı)

**Yapılan Çalışmalar:**

- **BTK Akademi - Scrum Eğitimi:** Sabah saatlerinde BTK Akademi üzerinden Scrum metodolojisine dair eğitim içeriği incelendi.
- **Jupyter Notebook'un Yeniden Düzenlenmesi:** Not defteri, aktif kullanılan ASSISTments modeli başa gelecek, terk edilen Duolingo denemesi ise "Ek: Neden Vazgeçtik" bölümünde sona gelecek şekilde yeniden yapılandırıldı.
- **Model Doğrulamasının Güçlendirilmesi:**
  - Gerçekçi olmayan uç değerler (`attempt_count` max=3740, `ms_first_response` max≈8 saat) 99. yüzdelikte kırpılarak (winsorize) temizlendi.
  - Tek bir train/test bölünmesinin güvenilirliğini test etmek için **5 katlı StratifiedKFold cross-validation** uygulandı: AUC 0.960 (±0.002), doğruluk %92.8 — sonucun şansa bağlı olmadığı ve aykırı değer temizliğinin sonucu neredeyse hiç değiştirmediği doğrulandı.
- **Feature Importance (Özellik Önem) Analizi:** Modelin davranışsal özelliklere (deneme sayısı, ipucu sayısı, yanıt süresi, tekrar sayısı) toplamda **%93.4**, konu bilgisine (`skill_name`, 110 kategori) ise sadece **%6.6** ağırlık verdiği görüldü. Tekil en önemli özellik `attempt_count` (%45.9) olarak belirlendi; bu, korelasyon analizindeki en güçlü yordayıcı olan `hint_count`'tan (%29.4) farklı çıkarak korelasyon ile model-içi önemin farklı şeyler ölçtüğünü gösterdi.
- **Model Karşılaştırması (Mentör Talebi Üzerine):** Aynı veri ve bölünmeyle **Decision Tree**, **Logistic Regression** (sayısal özellikler `StandardScaler` ile ölçeklendirilerek) ve **Random Forest** karşılaştırıldı:
  | Model | AUC | Doğruluk |
  |---|---|---|
  | Decision Tree | 0.946 | 0.927 |
  | Logistic Regression | 0.915 | 0.881 |
  | Random Forest | 0.958 | 0.927 |

  Random Forest'in tek bir karar ağacına göre sağladığı katkının ölçülü olduğu, buna karşın doğrusal bir modelin (Logistic Regression) belirgin şekilde geride kaldığı (verideki ilişkilerin doğrusal olmadığını doğrulayarak) gözlemlendi.
- **Feature Selection Denemesi:** `skill_name` özelliği tamamen çıkarılıp sadece 5 davranışsal özellikle model yeniden eğitildi: AUC 0.958'den 0.942'ye (yalnızca 0.016 düşüş) geriledi — bu da konu bilgisinin katkısının sınırlı olduğu bulgusunu (feature importance analiziyle tutarlı şekilde) doğruladı.

---

### 📅 8. Gün: 29 Temmuz 2026 (Çarşamba)

**Yapılan Çalışmalar:**

- **Scrum Eğitimi:** Scrum framework'leri ve Scrum teorisi (roller, olaylar, artefaktlar) incelendi.
- **%70/%15/%15 Eğitim/Doğrulama/Test Bölünmesi (Mentör Talebi Üzerine):** Tek `train_test_split` çağrısıyla bölünemediği için iki aşamalı bölme uygulandı (önce %15 test, kalan %85'ten 15/85 oranıyla doğrulama ayrıldı). Doğrulama AUC 0.959 ve test AUC 0.958'in birbirine çok yakın çıkması, modelin doğrulama setine göre "ayarlanıp" test setinde şişirilmiş bir sonuç almadığını doğruladı.
- **XGBoost'un Model Karşılaştırmasına Eklenmesi:** Mentörün belirttiği Bagging/Boosting/Ensemble kavramları doğrultusunda, notebook'taki karşılaştırmaya boosting ailesinden **XGBoost** eklendi:
  | Model | AUC | Doğruluk |
  |---|---|---|
  | Logistic Regression | 0.915 | 0.879 |
  | Decision Tree | 0.944 | 0.930 |
  | Random Forest | 0.958 | 0.926 |
  | **XGBoost** | **0.967** | 0.928 |
- **Üretim Modelinin XGBoost'a Geçirilmesi:** Karşılaştırmada en iyi sonucu veren XGBoost, `train.py` ve `app/model.py`'da üretim modeli olarak benimsendi (sınıf dengesizliği `scale_pos_weight` ile ele alındı). Sonuçlar: 5 katlı cross-validation AUC 0.970 (±0.001), test AUC 0.968 — Random Forest'e göre "yanlış" sınıfını yakalama oranı (recall) %77'den %84'e yükseldi. FastAPI servisi üzerinden uçtan uca tekrar doğrulandı.
- **Kapsamlı ML Metodoloji Raporu:** Tüm veri seti araştırma süreci, kullanılan yöntemlerin (Decision Tree, Bagging/Random Forest, Boosting/XGBoost, Logistic Regression, feature importance, feature selection, cross-validation, train/validation/test bölünmesi) birbirinden farkları ve sonuçların yorumunu içeren `Documents/ML_Metodoloji_ve_Sonuclar_Raporu.md` dokümanı hazırlandı.
- **Yol Haritası Netleştirildi:** Duolingo veri setinin ileride eklenebilecek bir İngilizce kelime kartı (flashcard) özelliği için referans olarak saklanmasına karar verildi. Kısa vadeli hedef ASSISTments (vekil/proxy) veriyle sistemi ilerletmek; StudyMentor gerçek kullanıcı verisi topladıkça aynı eğitim sürecinin gerçek veriyle tekrarlanıp daha kapsamlı bir modele dönüştürülmesi planlandı.
