# StudyMentor - Staj Defterim

Burada StudyMentor projesinde geçirdiğim her günü mümkün olduğunca gerçek haliyle tutmaya çalışıyorum: o gün ne yaptığımı, neden öyle yaptığımı ve genel olarak ne öğrendiğimi.

---

### 📅 1. Gün: 20 Temmuz 2026 (Pazartesi)

**O gün neler yaptım:**

- **Proje Tanımı ve Gereksinim Analizi:** AI destekli çalışma planlayıcısı ve öğrenme analitiği platformu (StudyMentor) için yazılım gereksinim analizi (SRS) raporu incelendi. Sistemin hedefleri, modülleri ve kullanıcı rolleri belirlendi.
- **Teknoloji Yığınının Seçilmesi:**
  - Arayüz (Frontend) için: React + TypeScript + Vite + Tailwind CSS
  - Sunucu (Backend) için: Node.js + Express.js + Prisma ORM + PostgreSQL
  - Yapay Zeka (AI/ML) için: Python + FastAPI + Pandas + Scikit-Learn
  - DevOps için: Docker + GitHub Actions + Supabase
- **Zaman Planlaması:** Projenin 8 haftalık Gantt şeması ve haftalık yol haritası hazırlanarak staj çalışma takvimi oluşturuldu.

Stajın ilk günü daha tek satır kod yazmadan bu kadar çok karar vermek gerektiğini görünce biraz şaşırdım — ama bu kararların üzerine sonradan gerçekten inşa ettiğimi fark ettim.

---

### 📅 2. Gün: 21 Temmuz 2026 (Salı)

**O gün neler yaptım:**

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

Bu gün biraz da "her şeyden biraz" günüydü ama en çok Prisma ile Supabase'i ilk kez birbirine bağlayıp gerçek tablolar oluşturduğumu görmek keyifliydi — proje artık kağıt üstünde kalmıyordu.

---

### 📅 3. Gün: 22 Temmuz 2026 (Çarşamba)

**O gün neler yaptım:**

- Bu gün StudyMentor projesi dışında, TÜBİTAK 2204-A Ortaöğretim Öğrencileri Araştırma Projeleri Yarışması (STAR) kapsamında yürütülen **süperkapasitörler** konulu araştırma projesiyle ilgilenildi.

---

### 📅 4. Gün: 23 Temmuz 2026 (Perşembe)

**O gün neler yaptım:**

- **Frontend Geliştirme - Uygulama İskeleti ve Temel Ekranlar:**
  - React + TypeScript + Vite + Tailwind CSS tabanlı frontend projesinin genel klasör yapısı ve bileşen mimarisi kuruldu.
  - `ThemeContext` (aydınlık/karanlık mod) ve `AppContext` (kullanıcı profili, çalışma oturumları, alışkanlıklar, günlük, kilometre taşları, AI önerileri için mock veri katmanı ve state yönetimi) oluşturuldu.
  - Uygulamanın genel navigasyon iskeleti olan `Sidebar` ve `Header` bileşenleri geliştirildi.
  - `Dashboard` ekranı: özet istatistikler, aktif alışkanlık serisi, güncel kilometre taşı ve öne çıkan AI önerisi gösterimi tamamlandı.

İlk defa gerçek bir ekranı çalışır halde görmek güzeldi; context/state yönetimini en baştan doğru kurmanın ileride ne kadar işime yarayacağını o an tam kestirememiştim.

---

### 📅 5. Gün: 24 Temmuz 2026 (Cuma)

**O gün neler yaptım:**

- **Frontend Geliştirme - Modül Ekranlarının Tamamlanması:**
  - `StudyPlanner`: Pomodoro zamanlayıcı ve çalışma oturumu kayıt ekranı geliştirildi.
  - `CalendarGoalTracker`: sınav ve kilometre taşı takip ekranı oluşturuldu.
  - `GrowthHub`: alışkanlık takibi ve günlük (journal) modülü geliştirildi.
  - `AIInsights`: yapay zeka destekli öneriler ekranı tasarlandı.
  - `AuthModal`: giriş/kayıt akışı (mock, gerçek API bağlantısı olmadan) eklendi.
  - Uygulamanın STUDENT / LIFELONG_LEARNER ikili persona ayrımı tüm ekranlara uygulandı.

Bütün ekranları arka arkaya tamamlayınca uygulamanın artık gerçekten "bir uygulama gibi" göründüğünü fark ettim, bu güzel bir histi.

---

### 📅 6. Gün: 27 Temmuz 2026 (Pazartesi)

**O gün neler yaptım:**

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

Bu gün asıl öğrendiğim şey şuydu: doğru veri setini bulmak, modeli eğitmekten çok daha uzun sürüyor ve çok daha önemli.

---

### 📅 7. Gün: 28 Temmuz 2026 (Salı)

**O gün neler yaptım:**

- **BTK Akademi - Scrum Eğitimi:** Sabah saatlerinde BTK Akademi üzerinden Scrum metodolojisine dair eğitim içeriği incelendi.
- **Jupyter Notebook'un Yeniden Düzenlenmesi:** Not defteri, aktif kullanılan ASSISTments modeli başa gelecek, terk edilen Duolingo denemesi ise "Ek: Neden Vazgeçtik" bölümünde sona gelecek şekilde yeniden yapılandırıldı.
- **Model Doğrulamasının Güçlendirilmesi:**
  - Gerçekçi olmayan uç değerler (`attempt_count` max=3740, `ms_first_response` max≈8 saat) 99. yüzdelikte kırpılarak (winsorize) temizlendi.
  - Tek bir train/test bölünmesinin güvenilirliğini test etmek için **5 katlı StratifiedKFold cross-validation** uygulandı: AUC 0.960 (±0.002), doğruluk %92.8 — sonucun şansa bağlı olmadığı ve aykırı değer temizliğinin sonucu neredeyse hiç değiştirmediği doğrulandı.

- **Feature Importance (Özellik Önem) Analizi:** Modelin davranışsal özelliklere (deneme sayısı, ipucu sayısı, yanıt süresi, tekrar sayısı) toplamda **%93.4**, konu bilgisine (`skill_name`, 110 kategori) ise sadece **%6.6** ağırlık verdiği görüldü. Tekil en önemli özellik `attempt_count` (%45.9) olarak belirlendi; bu, korelasyon analizindeki en güçlü yordayıcı olan `hint_count`'tan (%29.4) farklı çıkarak korelasyon ile model-içi önemin farklı şeyler ölçtüğünü gösterdi.
- **Model Karşılaştırması (Mentör Talebi Üzerine):** Aynı veri ve bölünmeyle **Decision Tree**, **Logistic Regression** (sayısal özellikler `StandardScaler` ile ölçeklendirilerek) ve **Random Forest** karşılaştırıldı:

  | Model               | AUC   | Doğruluk |
  | ------------------- | ----- | -------- |
  | Decision Tree       | 0.946 | 0.927    |
  | Logistic Regression | 0.915 | 0.881    |
  | Random Forest       | 0.958 | 0.927    |

  Random Forest'in tek bir karar ağacına göre sağladığı katkının ölçülü olduğu, buna karşın doğrusal bir modelin (Logistic Regression) belirgin şekilde geride kaldığı (verideki ilişkilerin doğrusal olmadığını doğrulayarak) gözlemlendi.

- **Feature Selection Denemesi:** `skill_name` özelliği tamamen çıkarılıp sadece 5 davranışsal özellikle model yeniden eğitildi: AUC 0.958'den 0.942'ye (yalnızca 0.016 düşüş) geriledi — bu da konu bilgisinin katkısının sınırlı olduğu bulgusunu (feature importance analiziyle tutarlı şekilde) doğruladı.

Korelasyon ile modelin gerçekte neye baktığının (feature importance) aynı şey olmadığını kendi verimde görmek, kitaptan okumaktan çok daha kalıcı oldu.

---

### 📅 8. Gün: 29 Temmuz 2026 (Çarşamba)

**O gün neler yaptım:**

- **Scrum Eğitimi:** Scrum framework'leri ve Scrum teorisi (roller, olaylar, artefaktlar) incelendi.
- **%70/%15/%15 Eğitim/Doğrulama/Test Bölünmesi (Mentör Talebi Üzerine):** Tek `train_test_split` çağrısıyla bölünemediği için iki aşamalı bölme uygulandı (önce %15 test, kalan %85'ten 15/85 oranıyla doğrulama ayrıldı). Doğrulama AUC 0.959 ve test AUC 0.958'in birbirine çok yakın çıkması, modelin doğrulama setine göre "ayarlanıp" test setinde şişirilmiş bir sonuç almadığını doğruladı.
- | **XGBoost'un Model Karşılaştırmasına Eklenmesi:** Mentörün belirttiği Bagging/Boosting/Ensemble kavramları doğrultusunda, notebook'taki karşılaştırmaya boosting ailesinden **XGBoost** eklendi: | Model     | AUC   | Doğruluk |
  | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- | ----- | -------- |
  | Logistic Regression                                                                                                                                                                              | 0.915     | 0.879 |          |
  | Decision Tree                                                                                                                                                                                    | 0.944     | 0.930 |          |
  | Random Forest                                                                                                                                                                                    | 0.958     | 0.926 |          |
  | **XGBoost**                                                                                                                                                                                      | **0.967** | 0.928 |          |
- **Üretim Modelinin XGBoost'a Geçirilmesi:** Karşılaştırmada en iyi sonucu veren XGBoost, `train.py` ve `app/model.py`'da üretim modeli olarak benimsendi (sınıf dengesizliği `scale_pos_weight` ile ele alındı). Sonuçlar: 5 katlı cross-validation AUC 0.970 (±0.001), test AUC 0.968 — Random Forest'e göre "yanlış" sınıfını yakalama oranı (recall) %77'den %84'e yükseldi. FastAPI servisi üzerinden uçtan uca tekrar doğrulandı.
- **Kapsamlı ML Metodoloji Raporu:** Tüm veri seti araştırma süreci, kullanılan yöntemlerin (Decision Tree, Bagging/Random Forest, Boosting/XGBoost, Logistic Regression, feature importance, feature selection, cross-validation, train/validation/test bölünmesi) birbirinden farkları ve sonuçların yorumunu içeren `Documents/ML_Metodoloji_ve_Sonuclar_Raporu.md` dokümanı hazırlandı.
- **Yol Haritası Netleştirildi:** Duolingo veri setinin ileride eklenebilecek bir İngilizce kelime kartı (flashcard) özelliği için referans olarak saklanmasına karar verildi. Kısa vadeli hedef ASSISTments (vekil/proxy) veriyle sistemi ilerletmek; StudyMentor gerçek kullanıcı verisi topladıkça aynı eğitim sürecinin gerçek veriyle tekrarlanıp daha kapsamlı bir modele dönüştürülmesi planlandı.
- Bugün ethernet ucu da bastık caston kablo ucu da yaptık. (görseller gelecek)

Mentörümün istediği train/val/test ayrımını uygulayıp XGBoost'u eklediğimde ilk defa "gerçek bir ML süreci" yürüttüğümü hissettim — artık sadece tek bir model eğitip durmuyor, karşılaştırıp gerekçelendiriyordum.

📅 9. Gün: 30 Temmuz 2026 (Perşembe)

Bilgisayar kasası açtık. İçindeki parçaları inceledik: işlemci, anakart ,ram, kablo girişleri bios ekranı... bu konuların detaylarını anlattı (fotoğraflar gelecek)

---

### 📅 10. Gün: 31 Temmuz 2026 (Cuma)

**O gün neler yaptım:**

- **Backend + Frontend + ML Servisinin Gerçek Entegrasyonu (Faz 1):** Şu ana kadar birbirinden bağımsız çalışan üç alt sistem ilk kez birbirine bağlandı.
  - **Kimlik Doğrulama:** `POST /auth/register` ve `POST /auth/login` uç noktaları geliştirildi; şifreler `bcryptjs` ile hash'lenerek (10 round) Supabase Postgres'e yazılıyor, JWT (7 gün geçerli) ile oturum yönetiliyor. `HttpError`, `asyncHandler`, genişletilmiş `errorHandler` (Zod hataları dahil) ile hata yönetimi altyapısı kuruldu.
  - **Prisma Şema Genişletmesi:** `User.grade`, `TopicCheck` (mini-kontrol) modeli, `AIRecommendation.topicId` eklendi; global (müfredat) ve kullanıcıya özel (`userId` dolu) ders/konu ayrımını destekleyen mevcut `Subject`/`Topic` şeması bu akışa entegre edildi. İdempotent bir seed script'i (`seed.ts`) ile her eğitim seviyesi için örnek ders/konu verisi oluşturuldu.
  - **Onboarding Akışı:** Kayıt sırasında eğitim seviyesi/sınıf seçimi (`EducationLevelStep`), ardından "dünkü çalışma verisi" girişi veya **mini kontrol** (soru-cevap) akışı (`DataEntryStep`, `TopicCheckModal`) eklendi. Mini kontrol; gerçek `hint_count`, `attempt_count` ve yanıt süresini ölçerek backend üzerinden FastAPI ML servisine gönderiyor, dönen öncelik (YÜKSEK/ORTA/DÜŞÜK) ve öneri metni `AIRecommendation` tablosuna kaydediliyor. ML servisi geçici olarak ulaşılamazsa sistem çökmeden ham veriyi kaydedip nazik bir mesaj döndürüyor (graceful degradation).
  - Artık kayıt/giriş olmadan uygulamaya anında giriş yapılan eski kısayol kapatıldı; gerçek kimlik doğrulama zorunlu hale getirildi.
- **E-posta Doğrulama ve Şifremi Unuttum Sistemi:** Gmail SMTP (`nodemailer`, projeye özel bir Gmail hesabı ve Uygulama Şifresi ile) üzerinden 6 haneli doğrulama/sıfırlama kodları gönderiliyor. Kayıt sonrası e-posta doğrulaması zorunlu hale getirildi (doğrulanmamış hesapla giriş `403` ile engelleniyor); `POST /auth/verify-email`, `/resend-verification`, `/forgot-password`, `/reset-password` uç noktaları eklendi.
- **"Öğrenci" / "Gelişim" Modu Ayrımının Düzeltilmesi:** Kapsamlı bir kod taraması sonucunda iki kullanıcı personası arasında karışan birçok nokta (mod'a göre filtrelenmeyen öneri/oturum listeleri, sabit-kodlanmış "Ders" etiketleri) tespit edilip düzeltildi. Öğrenciler müfredat tipi ders/konu seçiyor; "Gelişim" modundaki kullanıcılar ise serbest metinle kendi "uğraşlarını" giriyor (arka planda kullanıcıya özel `Subject` kaydı otomatik oluşturuluyor).
- **"Derslerim" ve "Takvim" Modüllerinin Gerçek Backend'e Bağlanması (Öğrenci Modu):** Öğrencilerin kendi derslerini ve her dersin konularını ekleyip yönetebildiği yeni bir "Derslerim" sekmesi; haftalık ders programı (yeni `ScheduleSlot` Prisma modeli) ve sınav tarihlerini (mevcut `Exam`/`ExamSubject` modelleri için ilk kez yazılan CRUD servisleri) yönetebildiği yeni bir "Takvim" sekmesi eklendi. Tüm yeni uç noktalarda sahiplik (ownership) kontrolü test edildi (başka kullanıcının dersine erişim `403` ile engelleniyor).
- **Modelin Verimli Kullanımı İçin Kullanıcı Akışının Yeniden Tasarlanması:** Giriş (login) sonrası her seferinde zorla açılan "veri girişi" ekranının kullanıcı deneyimini bozduğu belirlendi; bu ekran sadece ilk kayıt anına taşındı. Bunun yerine, modeli gerçekten besleyen mini-kontrol akışı uygulamanın günlük kullanılan yerlerine entegre edildi: Dashboard'da gerçek `GET /recommendations` verisiyle çalışan bir AI öneri kartı (doğrudan "Kontrol Et" ile mini-kontrolü açıyor) ve "Derslerim" sekmesinde her konunun yanında bir kontrol aksiyonu eklendi.
- **Diğer Düzeltmeler:** Aydınlık/karanlık tema tutarsızlıkları (onboarding modallarının sabit koyu renkte kalması) giderildi; gerçek kullanıcı bilgilerini gösteren bir "Profilim" sayfası eklendi; Sidebar'daki mod değiştirme butonunun gerçek kullanıcı profilini (`educationLevel`/`grade`) istemci tarafında bozması hatası tespit edilip, gerçek profil ayrıca saklanacak şekilde kalıcı olarak düzeltildi.

Bu, sanırım o ana kadarki en yoğun günümdü — frontend, backend ve ML servisini ilk kez gerçekten birbirine bağladım ve üçünün birlikte çalıştığını görmek çok güzel bir histi.

📅 11. Gün: 3 Ağustos 2026 (Pazartesi)

1. Bildirim Sistemine Gönderen Adı ve Otomatik E-posta Entegrasyonu
   Amaç: Kullanıcılar bir bildirim aldığında ("bir yorumunuz beğenildi" gibi) bunu kimin yaptığını göremiyordu; ayrıca bildirimler yalnızca site içinde görünüyordu, kullanıcı siteye girmeden haberdar olamıyordu.

Yapılanlar:

NotificationService merkezi hale getirilerek, bildirim gönderen kullanıcının adı {{senderName}} yer tutucusu üzerinden mesaj metnine otomatik işlenecek şekilde yeniden tasarlandı (örn. "Ayşe tartışmanızı beğendi").
Bir yoruma verilen yanıtlarda, önceden sadece tartışma sahibine giden bildirim akışına, yanıtlanan yorumun sahibine de ayrı bir bildirim gönderilmesi eklendi.
EmailService'e yeni bir sendNotificationEmail metodu eklenerek, oluşturulan her bildirim aynı zamanda kullanıcının e-posta adresine (Nodemailer/SMTP üzerinden) iletilecek şekilde entegre edildi.
Teknolojiler: Node.js, Express, Prisma ORM, Nodemailer.

2. Tartışmalara Görsel Ekleme (Supabase Storage Entegrasyonu)
   Amaç: Kullanıcıların tartışma oluştururken/düzenlerken bir kapak görseli ekleyebilmesi.

Yapılanlar:

Prisma şemasına Discussion.imageUrl alanı eklenip migration oluşturuldu ve veritabanına uygulandı.
Backend'de multer (bellek tabanlı, disk'e yazmayan) ile dosya yükleme middleware'i yazıldı; dosya tipi (JPEG/PNG/WEBP/GIF) ve boyutu (5MB) sınırlandırıldı.
Görsellerin depolanması için Supabase Storage entegre edildi (@supabase/storage-js kullanılarak — @supabase/supabase-js'in Node 20'de çökmesine sebep olan Realtime/WebSocket bağımlılığından kaçınmak için bilinçli olarak daha hafif bu paket tercih edildi).
Tartışma düzenleme akışına görsel ekleme/değiştirme/kaldırma desteği eklendi; eski görsel her değişiklikte Storage'dan gerçekten silinerek çöp birikmesi engellendi.
Frontend'de (CreateTopic.tsx, TopicDetail.tsx) dosya seçici, önizleme ve kaldırma butonu içeren arayüzler geliştirildi; API istekleri JSON yerine multipart/form-data formatına çevrildi.
Teknolojiler: Supabase Storage, Multer, Prisma Migration, React (FormData API).

3. "Kimi Takip Etmeli?" Bölümüne Kullanıcı Arama Özelliği
   Amaç: Kullanıcıların sadece pasif önerilenler listesinden değil, tanıdıkları belirli kişileri arayarak bulup takip edebilmesi.

Yapılanlar:

Backend'de GET /api/v1/users/search?q= uç noktası eklendi; kullanıcı adı/ad-soyad üzerinde büyük/küçük harf duyarsız arama yapıyor, arayan kişiyi sonuçlardan hariç tutuyor ve her sonuç için "zaten takip ediliyor mu" bilgisini tek sorguda hesaplıyor.
Frontend'de, ana sayfadaki mevcut arama kutusuyla aynı desende (500ms gecikmeli/debounced) canlı arama kutusu eklendi; yükleniyor durumu için "Araştırılıyor..." göstergesi entegre edilerek kullanıcı deneyimindeki bir kusur (sonuç gelmeden önce anlık "kimse bulunamadı" mesajı çıkması) giderildi.
Teknolojiler: Prisma (ilişkisel filtreleme), React (debounce pattern, optimistic UI update).

4. "Bugün Düşün" Kartının Etkileşimli Hale Getirilmesi
   Amaç: Ana sayfadaki günün sorusu kartının sadece gösterim amaçlı olmasının önüne geçip, kullanıcıyı doğrudan tartışma başlatmaya yönlendirmek.

Yapılanlar:

Kart tıklanabilir hale getirildi (klavye erişilebilirliği için Enter/Space desteği de eklendi).
Tıklanınca React Router state'i üzerinden günün sorusu, yeni tartışma formuna başlık olarak otomatik taşınıyor ve kullanıcı formu açar açmaz doğrudan içerik alanına odaklanıyor. 5. Kapsamlı Güvenlik Analizi ve Düzeltmeleri
Amaç: Projenin canlıya alınmadan önce backend, web frontend ve mobil uygulama genelinde güvenlik açıkları ve eksiklikler açısından denetlenmesi.

Tespit edilen ve düzeltilen kritik açıklar:

JWT secret için kod içinde sabit bir yedek değer ('tart_super_secret') bulunuyordu — ortam değişkeni eksikse herkesin sahte oturum token'ı üretebileceği bir risk oluşturuyordu. Kaldırıldı.
Her istekte kullanıcının şifre hash'i dahil tüm bilgilerinin sunucu loglarına yazıldığı tespit edildi ve bu debug logları temizlendi.
Sunucunun, zorunlu ortam değişkenleri (DATABASE_URL, JWT_SECRET, CLIENT_URL) eksik olsa bile sessizce başladığı görüldü; artık bu durumda net bir hata mesajıyla başlamayı reddediyor.
CORS ayarındaki origin: '\*' + credentials: true çakışması, sadece gerçek frontend adresine izin verecek şekilde düzeltildi.
express-rate-limit ile giriş/kayıt/şifre sıfırlama uçlarına kaba kuvvet saldırılarına karşı hız sınırlaması eklendi.
Bildirim e-postalarına kullanıcı içeriğinin (başlık, kullanıcı adı) HTML kaçışı yapılmadan basıldığı, bu yüzden zararlı kod içeren bir başlığın e-posta istemcisinde çalışabileceği tespit edildi ve giderildi.
Kullanılmayan, içinde varsayılan bir geliştirme şifresi bulunan ölü bir veritabanı bağlantı dosyası silindi.
Yöntem: Backend, web ve mobil için ayrı ayrı kod incelemesi yapılarak bulgular önem derecesine (kritik/orta/düşük) göre sınıflandırıldı, ardından kullanıcıyla önceliklendirilip sırayla uygulandı ve her biri gerçek uçtan uca testlerle doğrulandı.

6. Git İş Akışı ve Azure Deployment Sorun Giderme
   Yapılanlar:

Tüm bu değişiklikler, main'den açılan yeni bir branch (feat/notifications-media-security) üzerinde, her biri tek bir konuyu kapsayan 5 ayrı, anlamlı commit mesajıyla (conventional commits formatında) düzenlendi ve GitHub'a push edilerek Pull Request üzerinden main'e alındı.
Deploy sırasında Conflict (CODE: 409) hatası alındı; kök neden analiz edildiğinde, projede hem GitHub Actions hem de Azure DevOps Pipelines'ın aynı Azure Web App'e aynı anda deploy etmeye çalıştığı, bu yüzden Azure'un deployment motorunun (Kudu) ikisini çakıştırdığı tespit edildi. Azure DevOps tarafındaki eski/yedek pipeline kaldırılarak tek bir deploy sistemi (GitHub Actions) üzerinden ilerlenmesine karar verildi.
Teknolojiler: Git (branch/stash/commit yönetimi), GitHub Actions, Azure Web App, Azure DevOps Pipelines.

Güvenlik denetimi kısmı beni en çok geren kısımdı — kod içine sabit kodlanmış bir JWT secret bulmak ürkütücüydü, ama bunu fark edebilecek kadar öğrenmiş olduğumu görmek de iyi hissettirdi.

📅 12. Gün: 4 Ağustos 2026 (Salı)

**O gün neler yaptım:**

- **Mini-Kontrol Akışındaki "İpucu" Sorusunun Arayüzden Kaldırılması:** Onboarding sırasındaki mini-kontrol modalinde (`TopicCheckModal`) kullanıcıya "ipucu kullandın mı?" sorulması ve bir "İpucu Göster" butonuyla ipucu metni gösterilmesi, gerçek kullanıcılar ML modelinin `hint_count` özelliğinin ne işe yaradığını bilmediği için anlamsız/kafa karıştırıcı bulundu. Buton, ipucu metni gösterimi ve sayaç state'i arayüzden tamamen kaldırıldı; gönderimde `hintCount` sabit `0` olarak yollanıyor. Backend ve ML servisi tarafında `hintCount` alanı geriye dönük uyumluluk için değişmeden bırakıldı.
- **Modül A — Çalışma Oturumlarının (StudySession) Gerçek Backend'e Bağlanması:** `StudyPlanner` ekranı artık mock veriyle değil, `GET /topics` ile çekilen gerçek ders/konu listesiyle çalışıyor; oturum kaydı `POST /study-sessions` uç noktasına gidiyor ve dönen ML önceliği (YÜKSEK/ORTA/DÜŞÜK) kayıt sonrası modalde gösteriliyor. Dashboard'daki "Son Oturum Kayıtları" listesi yeni eklenen `GET /study-sessions` ile gerçek veriye bağlandı.
- **Modül B — "Öğrenci" / "Gelişim" Modu Arasında Özellik Eşitliği:** "Derslerim"/"Uğraşlarım" (`MyCourses`) ve takvim modüllerinin her iki personada da aynı gerçek backend'e bağlı olması sağlandı. Eski `StudentCalendar`/`CalendarGoalTracker` bileşenleri kaldırılıp yerlerine, her iki modu da (sınav ↔ hedef metin farkıyla) destekleyen tek bir `RealCalendar` bileşeni yazıldı. Sidebar sekmeleri (Derslerim, Takvim) artık her iki modda da tutarlı şekilde gösteriliyor.
- **Modül C — Alışkanlık Takibi (Habit) ve Günlük (Journal) Modüllerinin İlk Kez Backend'e Yazılması:** Şemada baştan beri var olan ama hiç backend kodu yazılmamış `Habit`/`HabitLog`/`Journal` modelleri için ilk kez `service`/`controller`/`route` katmanları geliştirildi: alışkanlık ekleme, günlük bazlı işaretleme (toggle) ve seri (streak) hesaplama backend'de; günlük kaydı ve pozitif-kelime tabanlı sentiment skoru hesaplaması da (önceden frontend'de mock olarak yapılıyordu) backend'e taşındı. Tüm uç noktalarda sahiplik (ownership) kontrolü eklendi. `GrowthHub` ve Dashboard'daki "Alışkanlık Zinciri" kartı gerçek veriye bağlandı; ayrıca `GrowthHub`'daki alışkanlık günü kutucuklarının sabit kodlanmış 5 tarihe bakması hatası düzeltilerek "bugünden geriye son 5 gün" dinamik olarak hesaplanacak şekilde değiştirildi.
- Tüm modüller için backend `npm run build` + uçtan uca curl testleri (kayıt oluşturma, sahiplik/403 senaryoları, streak/sentiment doğrulaması) ve frontend `npm run build` ile doğrulama yapıldı.

Kullanıcı için anlamsız bir soruyu (ipucu kullandın mı?) arayüzden kaldırmak küçük bir değişiklik gibi görünüyordu ama bana kullanıcı deneyiminin sadece "çalışıyor mu" sorusundan ibaret olmadığını hatırlattı.

---

📅 13. Gün: 5 Ağustos 2026 (Çarşamba)

**O gün neler yaptım:**

- **KPSS Sınav Hazırlık Sistemi — Kapsamlı Planlama:** Kullanıcının 6 Eylül'de gireceği KPSS sınavına yönelik ihtiyaçları (hazır sınav kataloğu, günlük çalışma planı, aralıklı tekrar, ruh haline duyarlı mentor, sınav geri sayımı) analiz edilerek beş modüllük (E-I) bir yol haritası çıkarıldı ve onaylandı.
- **Modül E — Sınav Kataloğu:** `ExamCategory` enum'u (KPSS/YÖKDİL/ALES/OTHER) ve `Subject`/`Exam` modellerine `examCategory` alanı eklendi. KPSS (Türkçe, Matematik, Tarih, Coğrafya, Vatandaşlık), YÖKDİL (İngilizce) ve ALES (Sayısal/Sözel Yetenek) için gerçek müfredat verisi seed edildi. Yeni `GET /exams/catalog/:category` uç noktasıyla sınav türü seçilince dersler/konular otomatik geliyor; `topics.service.ts`, kullanıcının eklediği sınavların derslerini de kapsayacak şekilde genişletildi.
- **Modül F — Günlük To-Do Listesi:** Yeni `DailyTask` modeli ve `daily-tasks` servis/controller/route katmanı. `StudyPlanner`'a "Bugün Ne Çalışacağım?" paneli eklendi — madde eklenip pomodoro çalıştırmadan doğrudan oturum başlatılabiliyor, tamamlanınca gerçek `StudySession` kaydına bağlanıyor.
- **Modül G — Aralıklı Tekrar Motoru:** Şemada var olan ama hiç yazılmamış `Topic.nextReview` alanı artık gerçekten hesaplanıyor (öncelik bazlı: YÜKSEK +2 gün, ORTA +4 gün, DÜŞÜK +7 gün; konu bir sınava bağlıysa tarih sınav gününü geçmeyecek şekilde kısıtlanıyor). Dashboard'a "Bugün Tekrar Zamanı" kartı eklendi.
- **Modül H — Kaptan'ın Ruh Haline Duyarlılığı:** Günlükteki mood emojisi (😔/😴) düşükse Kaptan'ın sert/aciliyetli şablonlar yerine nazik, anlayışlı bir şablon setiyle konuşması sağlandı.
- **Modül I — Sınav Geri Sayımı:** Dashboard'a en yakın sınava kalan gün sayısını ve o sınava bağlı derslerden kaç konunun tekrar beklediğini gösteren kart eklendi.
- **Ders/Uğraş Silme Özelliği:** Şemada eksik olan cascade-delete ilişkileri (`StudySession`/`ExamSubject`/`DailyTask` → `Subject`/`Topic`) düzeltilip `DELETE /subjects/:id` uç noktası eklendi; hem "Derslerim" hem "Ders/Konu Seçimi" panelinden onaylı silme yapılabiliyor.
- **Pomodoro Süresi Ayarlanabilir Hale Getirildi:** Sabit 25/5/15 dakika yerine her mod için kullanıcı kendi süresini girebiliyor; oturum süresi hesaplaması da buna göre düzeltildi.
- **Dashboard/Header Genel Bakım:** Açık modda metinlerin okunmaz görünmesinin kök nedeni bulundu (`glass-panel`'in CSS `background` kısayolu Tailwind gradient/bg sınıflarını eziyordu) ve düzeltildi. Üst bardaki gereksiz "Çalışma Başlat" butonu kaldırıldı, sabit kodlanmış tarih dinamikleştirildi, "Yaklaşan Sınav Hedefi" ve "Aktif Müfredat Dersleri & İlerleme" kartları gerçek backend verisine (sınavlar, konu bazlı çalışma oranı) bağlandı; kullanılmayan mock state'ler (`milestones`, `subjectsOrProjects`) `AppContext`'ten temizlendi.
- **Kaptan Maskotu ve Açılış Sayfası Tasarımı:** 3D maskot, jenerik amber renkli mezuniyet kepli figürden lacivert/altın kaptan üniformalı, kaptan şapkalı, önünde dümen olan bir karaktere dönüştürüldü; konuşma balonu artık sayfa her açıldığında Kaptan'ın sesiyle tutarlı rastgele bir Türkçe selamlama gösteriyor. Açılış sayfasındaki "Spaced Repetition" jargonu sadeleştirildi, amaç cümlesi ve marka diline uygun başlık eklendi. Kullanıcı geri bildirimiyle konuşma balonunun kırpılma sorunu ve yüz ifadesi (göz/gülümseme) netleştirildi, kafa ile gövde arasına belirgin bir boyun/yaka eklendi.
- Her modül için backend `npm run build` + curl ile uçtan uca test (kayıt/giriş, sahiplik/403 senaryoları, cascade-delete, nextReview hesaplaması) ve frontend `npm run build` ile doğrulama yapıldı.

Bu günün en sevdiğim kısmı Kaptan'ın ruh haline duyarlı konuşmasıydı — bir özelliğin sadece çalışması değil, kullanıcıyı gerçekten anlıyormuş gibi hissettirmesi gerektiğini düşündüm.

---

📅 14. Gün: 6 Ağustos 2026 (Perşembe)

**O gün neler yaptım:**

- **Kaptan Maskotunda İkinci Tur İnce Ayar:** Kullanıcı geri bildirimiyle (ekran görüntüsü üzerinden) kafa-gövde arasındaki boşluğun aşırı/kopuk durduğu ve genel oranların çocuksu göründüğü tespit edildi. Kafa küçültüldü, kırmızı yanaklar tamamen kaldırıldı, gözler/gülümseme sadeleştirildi, kafa ile gövde arasına önceki inceden yaka yerine daha dolgun, belirgin bir boyun/yaka eklendi — daha olgun ve gençlere hitap eden bir görünüm hedeflendi.
- **Konuşma Balonu ve Gövde/Kol Revizyonu:** Konuşma balonu kafanın üstünden Kaptan'ın sağına alındı, balon kuyruğu buna göre sola çevrildi (`SpeechBubble.tsx`). Gövde inceltildi, omuzlara kolları gövdeye yumuşakça bağlayan küre eklemler ve her kol ucuna ten rengi eller eklenerek maskot daha insansı hale getirildi.
- **Manta Vatozu Yol Arkadaşı:** "Kaptan" metaforunu bir deniz canlısıyla zenginleştirme fikri üzerine (yunus, narval ve manta vatozu seçenekleri değerlendirilip **manta vatozu**da karar kılındı) yeni bir `MantaRay.tsx` bileşeni eklendi — senkronize kanat çırpma animasyonlu, Kaptan'ın yanında süzülen, tamamen primitive Three.js geometrileriyle inşa edilmiş bir companion karakter.

Tasarım tarafında kullanıcı geri bildirimine göre ince ayar yapmanın da en az kod yazmak kadar zaman aldığını fark ettim.

---

📅 15. Gün: 7 Ağustos 2026 (Cuma)

**O gün neler yaptım:**

- **Açılış Sayfası Kompozisyon Yenilemesi:** Sahnedeki dağınık/tematik olarak alakasız dekoratif elemanlar (`FeatureOrbit` rastgele şekiller, `DeskScene` masa figürü) tamamen kaldırıldı. Sayfanın en altında gizli kalan dalga şeridi hero alanının içine de taşınarak (ortak `WaveStrip.tsx` bileşeni) deniz görseli ilk açılışta hemen görünür hale getirildi. STUDY/MENTOR dev yazısının 3D karakterlerin üzerinden geçmesine neden olan z-index çakışması düzeltildi (yazı arkada, Kaptan/Manta önde), kompozisyon dengelendi, hero'dan ana içeriğe akıcı bir gradyan geçiş eklendi.
- **Gerçekçi 3 Katmanlı Dalga:** Deniz dalgası şeridi; gradyanlı renklendirme (ışık-gölge geçişli), üç derinlik katmanı (uzak/orta/yakın), yakın katmanda köpük çizgisi ve yatay kaymaya ek dikey yalpalama animasyonuyla zenginleştirildi.
- **Fareye Duyarlı Canlı Deniz Shader Arka Planı:** Yeni bağımlılık kurmadan, mevcut `@react-three/fiber` altyapısı üzerinde tamamen prosedürel (doku/resim dosyası yok) bir GLSL shader (`OceanShaderBackground.tsx`) yazıldı — katmanlı fbm gürültüsüyle akışkan bir su deseni üretiyor, fare imlecine yakın bölgede yumuşak bir girdap bozulması oluşturuyor; `prefers-reduced-motion` ile uyumlu.
- **Figma İçin Tasarım Prompt'u:** Kurulan tüm marka kimliği (Kaptan, Manta, deniz atmosferi, renk paleti, sayfa yapısı) tek bir kapsamlı Figma AI prompt'unda toparlandı, İngilizce ve Türkçe versiyonları hazırlandı.
- **Proje Durum Değerlendirmesi:** Kod tabanı taranarak somut bir sonraki-adımlar listesi çıkarıldı: 55 dosyalık commit edilmemiş değişiklik birikmiş olması, Modül D'nin (teknik borç) hiç başlanmamış olması ve `Sidebar.tsx`/`GrowthHub.tsx`'te hâlâ düzeltilmemiş açık-mod kontrast sorunları tespit edildi.
- **Modül D Başladı — Hız Sınırlama:** `express-rate-limit` paketi kuruldu; genel auth uçları için `authLimiter` (15 dk / 15 istek), e-posta kodu gönderen uçlar için daha sıkı `emailCodeLimiter` (60 dk / 5 istek) middleware'leri yazıldı. Program/sınav düzenleme-silme uç noktaları ve temel test altyapısı henüz sırada.

55 dosyalık commit edilmemiş değişiklik biriktiğini görünce biraz endişelendim, ama bunun ertesi gün düzenli commit'lere bölünerek rahatça toparlanabileceğini öğrendim.

---

📅 16. Gün: 10 Ağustos 2026 (Pazartesi)

**O gün neler yaptım:**

- **Kod Tabanı Sağlık Denetimi:** Üç paralel araştırma ajanıyla backend, frontend ve repo genelinde kapsamlı bir durum tespiti yapıldı. Bulgular: `AppContext.tsx`'in artık güvenilir bir gerçek veri kaynağı olmadığı (statik mock `recommendations`, Dashboard'un ayrı ve bağımsız bir öneri kaynağı kullanması), yazılmış ama hiç route'a bağlanmamış bir rate limiter, `recommendations`/`health` uç noktalarının servis katmanını atlayıp Prisma'yı doğrudan route içinde çağırması ve `CLAUDE.md`'nin projenin artık çok gerisinde kaldığı (hâlâ "backend/src yok" gibi yanlış ifadeler içermesi) tespit edildi.
- **CLAUDE.md Güncellemesi:** Rehber dosya, doğrulanmış güncel bilgilerle (gerçek backend mimarisi, `ml-service`'in artık çalışan bir FastAPI servisi olduğu, güncel komutlar) yeniden yazıldı; bilinçli olarak henüz çözülmemiş eksiklerin listelendiği yeni bir "Known gaps" bölümü eklendi.
- **Oturum Kalıcılığı ve AppContext Temizliği:** `GET /users/me` uç noktası eklendi; uygulama artık sayfa yenilendiğinde `localStorage`'daki token'ı kontrol edip oturumu geri yüklüyor (önceden F5 atınca kullanıcı login ekranına düşüyordu). `AppContext.tsx`'teki hiç güncellenmeyen `recommendations` mock verisi tamamen kaldırıldı; "AI Analiz & Koç" sekmesi artık Dashboard'la aynı şekilde gerçek backend verisiyle çalışıyor.
- **Auth Rate Limiting:** Önceden yazılıp hiçbir route'a bağlanmamış olan `authLimiter`/`emailCodeLimiter` middleware'leri login/register/e-posta doğrulama/şifre sıfırlama uçlarına bağlandı; kaba kuvvet saldırılarına karşı koruma canlıya alındı ve gerçek istek testleriyle (16. denemede 429 dönmesi) doğrulandı.
- **Playwright ile Gerçek Tarayıcı Testi Kurulumu:** Bu oturumda ilk kez, kodun sadece derlendiğini değil gerçekten doğru göründüğünü de kontrol edebilmek için proje bağımlılıklarına dokunmadan izole bir Playwright ortamı kuruldu (ekran görüntüsü alma, DOM/CSS cascade inceleme, uçtan uca kullanıcı akışı otomasyonu). Bu sayede üç gerçek, kod okumayla fark edilemeyecek bug bulundu ve düzeltildi:
  - Açılış sayfasındaki 3D sahne (Kaptan, Manta, okyanus shader'ı) hiçbir konsol hatası vermeden hiç render edilmiyordu — sebebi `min-h-[640px]` (kesin olmayan yükseklik) kullanan bir kapsayıcının içinde `height: 100%` kullanılması, CSS'te bunun 0'a çökmesiydi.
  - Kaptan'ın çene sakalı 3D uzayda gülümseme şekliyle çakışıp garip bir görüntü oluşturuyordu; sakal aşağı/geri taşınıp küçültülerek düzeltildi.
  - **En önemli bulgu:** Tailwind CSS v4'te class tabanlı karanlık mod için gereken `@custom-variant dark (&:where(.dark, .dark *));` satırı hiç yoktu — bu olmadan Tailwind, uygulamanın kendi tema anahtarı yerine işletim sisteminin `prefers-color-scheme` tercihine bakıyordu. Yani bu ve önceki oturumlarda eklenen **hiçbir** `dark:` Tailwind sınıfı, işletim sistemi açık modda olan bir kullanıcıda gerçekte çalışmıyordu. Chrome DevTools Protokolü ile kanıtlanıp tek satırlık resmi düzeltmeyle giderildi.
- **GrowthHub Light-Mode Kontrast Düzeltmesi:** "Habit & Journal Hub" sekmesinin tamamında hiç `dark:` varyantı kullanılmadığı (Dashboard/Header'da zaten yapılmış olan düzeltmenin bu dosyaya hiç uygulanmamış olduğu) tespit edildi; Dashboard'daki mevcut renk deseniyle tüm dosya light/dark modda okunur hale getirildi.
- **Mimari Tutarlılık:** `recommendations.routes.ts` ve `health.routes.ts`, projedeki tek istisna olarak Prisma'yı doğrudan route içinde çağırıyordu; diğer tüm uç noktalarla aynı route→controller→service zincirine taşındı, davranış değişmedi.
- **Ölü Kod Temizliği:** Hiç çağrılmayan `apiClient.updateProfile` kaldırıldı. Hiç kullanılmayan `ResourceSuggestion` Prisma modeli, geri dönüşü zor bir migration/DROP TABLE gerektirdiği için silinmedi — sadece amacı belgelenip "Known gaps"a not düşüldü.
- **.gitignore Düzeltmesi:** Kökten yanlış sabitlendiği için hiçbir şeyi eşlemeyen `/prisma/migrations/` kuralı kaldırıldı.
- **Git Düzeni:** Birikmiş 74 dosyalık commit edilmemiş değişiklik, `feature/exam-catalog-and-platform-fixes` adında yeni bir dalda 13 anlamlı, tek-konulu commit'e bölünerek düzenlendi ve `origin`'e push'landı; `main`'e birleştirme kararı henüz verilmedi.

Playwright ile gerçek tarayıcıda test etmek gözümü gerçekten açtı; kodu sadece okuyarak asla fark edemeyeceğim üç gerçek hatayı (özellikle o tek satırlık eksik dark-mode satırını) bu sayede buldum. Bu günden sonra "derlendi, çalışıyor" ile "gerçekten doğru görünüyor"un aynı şey olmadığını öğrendim.

---

📅 17. Gün: 11 Ağustos 2026 (Salı)

Dünkü sağlık taramasında çıkan maddelerden birini seçip ilerledim: ML tarafındaki eksiklikleri konuştuk ve günü tamamen makine öğrenmesi servisinin gerçekten ne kadar "gerçek" olduğunu sorgulayarak geçirdim.

- **`skill_name` Özelliğinin Anlamsızlığının Fark Edilmesi:** Modelin `skill_name` (konu adı) özelliğini nasıl kullandığını incelerken ilginç bir şey fark ettim: backend gerçek Türkçe ders/konu adlarını gönderiyordu ama model, eğitimde sadece 110 sabit İngilizce ASSISTments konu etiketini görmüştü. `OneHotEncoder(handle_unknown="ignore")` bu yüzden gerçek her isteği sessizce sıfır vektöre çeviriyordu - yani bu özellik üretimde hiçbir zaman hiçbir işe yaramamıştı. `train.py`, `app/predict.py` ve backend'deki ilgili servislerden (`mlClient.service.ts`, `topicChecks.service.ts`, `studySessions.service.ts`) bu alanı kaldırıp modeli yeniden eğittim (CV AUC 0.941). Notebook'ta daha önce yapılmış olan ablation testi (skill_name çıkarılınca AUC 0.958'den 0.941'e düşüyor) bu kararı zaten gerekçelendirmişti.
- **Notebook'ta Küçük Bir Sürpriz:** Aynı notebook dosyasında commit'lenmemiş bir gerileme fark ettim - çalışma kopyası, zaten commit edilmiş olan daha gelişmiş haldeki (%70/%15/%15 split, XGBoost karşılaştırması) yerine daha eski bir sürüme dönmüştü. `git checkout` ile geri yükledim; muhtemelen eski bir kernel oturumunu kazara tekrar kaydetmişim.
- **Eğitim/Servis Tutarsızlığı (İkinci Bulgu):** Modeli Pomodoro akışına bağlarken, eğitimde uyguladığımız uç-değer kırpmasının (winsorize, 99. yüzdelik) servis anında hiç uygulanmadığını fark ettim - gerçek istekler (örneğin uzun bir çalışma oturumu) modelin hiç görmediği aralıklara savruluyordu. Kırpma sınırlarını artık modelle birlikte kaydedip (`train.py`), servis anında da (`app/model.py`) uyguluyorum.
- **Pomodoro'daki Sabit Değerlerin Gerçek Veriyle Değiştirilmesi:** `studySessions.service.ts`'te `attempt_count`/`hint_count` her zaman aynı sabit değeri (1/0) gönderiyordu, kullanıcı ister çok kolay ister çok zor bir oturum geçirsin. Bunu, kullanıcının zaten doldurduğu "Zorluk Algısı" (1-5) alanından türetilen bir değere çevirdim - notebook'un feature importance analizi zaten bu iki özelliğin tam olarak "zorlanma" sinyalini taşıdığını göstermişti, o yüzden bu eşleme bana dürüst geldi.
- **En İlginç Bulgu - `overlap_time` Kavram Uyuşmazlığı:** Değişikliği test ederken garip bir şey fark ettim: zorluk=1 ile zorluk=5 arasında hiç fark çıkmıyordu, ikisi de aynı (çok düşük) olasılığa çöküyordu. Araştırınca sebebini buldum: ASSISTments'ta `overlap_time`, TEK bir soruya harcanan süre (medyan 27 saniye), ama ben Pomodoro'nun tüm süresini (25 dakika = 1.500.000 ms) aynı alana koyuyordum. Model bunu "bir soruda inanılmaz uzun süre takılmak" olarak yorumlayıp her oturumu aşırı zorlanma sayıyordu - zorluk sinyalim bu yüzden boğuluyordu. Bunu, `ms_first_response` için zaten yaptığımız gibi, nötr bir sabite (eğitim medyanına) çekerek çözdüm.
- **Frontend'de Gerçek Bir Mantık Hatası:** Günlük görev listesindeki "Oturum Başlat" düğmesinin zamanlayıcıyı hiç başlatmadan doğrudan zorluk/verimlilik formunu açtığını fark ettim - yani kullanıcı henüz hiç çalışmamışken ondan geri bildirim isteniyordu. Bunu, gerçekten geri sayımı başlatacak ve form sadece süre dolunca veya elle bitirilince açılacak şekilde düzelttim.
- **Kaptan'a Yeni Bir Ses Kazandırdım:** Uygulamada zaten "Kaptan" adında bir mentor-sesi sistemi vardı (`kaptan.ts`) ama Pomodoro oturum sonu ekranında hiç kullanılmıyordu. Kullanıcının bildirdiği zorluk+verimliliğe göre ton değiştiren yeni bir mesaj seti (`getKaptanSessionMessage`) yazıp bu ekrana bağladım - artık oturum bittiğinde Kaptan gerçekten "seninle konuşuyor" gibi hissettiriyor.
- **Git Düzeni:** Bugünkü tüm değişiklikleri, `fix/ml-pipeline-and-pomodoro-flow` adında yeni bir dalda, her biri kendi başına anlamlı ve derlenebilir üç commit'e ayırıp GitHub'a gönderdim.

Bugün genel olarak öğrendiğim şey şu oldu: bir ML modelinin "çalışması" ile modele giden verinin gerçekten anlamlı olması aynı şey değil. Üst üste üç kez ("skill_name" boşa gidiyor, kırpma sınırları uyuşmuyor, overlap_time kavramsal olarak yanlış) aynı ailenin farklı versiyonlarına denk geldim: eğitim ile servis arasındaki sessiz bir tutarsızlık. Tek tek küçük düzeltmeler gibi görünüyorlar ama hepsi aynı dersi veriyor - bir modeli üretime koyduğunda, ona gerçekte ne gönderdiğini satır satır kontrol etmeden güvenmemek gerekiyor.
