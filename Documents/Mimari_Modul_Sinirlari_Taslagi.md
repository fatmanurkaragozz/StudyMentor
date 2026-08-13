# StudyMentor — Modül Sınırları Mimari Taslağı (Ara Kontrol)

Bu belge, mevcut kod tabanının (backend `src/services`, `prisma/schema.prisma`, frontend `components/`) gerçek durumuna bakılarak çıkarılmıştır — henüz uygulanmamış bir "hayal mimari" değil, bugünkü hâli tarif eden ve buradan nereye gidebileceğimizi işaretleyen bir taslaktır. **Kod değişikliği yapılmadı**, bu sadece bir tartışma/karar belgesi.

**Önemli bir zemin notu:** Şu an backend'de hiçbir servis başka bir servisi doğrudan import etmiyor (`grep` ile doğrulandı) — ama hepsi Prisma Client üzerinden istediği tabloya doğrudan erişebiliyor, ve bunu fiilen yapıyor. Yani **bugün modül sınırı yok**, sadece dosya/klasör düzeyinde bir ayrım var. Aşağıdaki taslak, "olması gereken" sınırları tarif ediyor; her modülün altında bugün bu sınırı zaten ihlal eden gerçek örnekler de not edildi.

---

## 1. Modüller: Tek Sorumluluk ve Kavramsal Veri Sahipliği

### 1.1 Kimlik (`Identity`)
**Sorumluluk:** Kullanıcının kim olduğu, oturum açması, e-posta doğrulaması, şifre kurtarma.
**Sahip olduğu kavram:** Kullanıcı hesabı ve kimlik doğrulama durumu (profil bilgisi dahil — ad, eğitim seviyesi, sınıf).
**Bugünkü karşılığı:** `auth.service`, `users.service`, `mailer.service` (e-posta gönderimi Identity'nin bir alt-yeteneği olarak kullanılıyor, kendi başına modül değil).

### 1.2 Müfredat & Program (`Curriculum`)
**Sorumluluk:** "Ne çalışılabilir" kataloğunu tanımlamak — hazır müfredat/sınav kataloğu ve kullanıcının kendi tanımladığı ders/konular; haftalık sabit ders programı.
**Sahip olduğu kavram:** Ders/konu kataloğu (global + kullanıcıya özel), haftalık program.
**Bugünkü karşılığı:** `subjects.service`, `topics.service`, `schedule.service`.

### 1.3 Sınav Takibi (`ExamTracking`)
**Sorumluluk:** Kullanıcının hedeflediği sınavları, tarihlerini ve sonuçlarını takip etmek.
**Sahip olduğu kavram:** Sınav hedefleri ve sonuçları.
**Bugünkü karşılığı:** `exams.service`.
**🟡 Açık nokta:** Bu, Curriculum'un bir parçası mı yoksa ayrı bir modül mü olmalı? Bugün `exams.service` zaten `Subject` tablosuna doğrudan okuma yapıyor (sınav-ders ilişkisi kurmak için). **Önerim:** Ayrı modül olarak kalsın — "ne çalışılır" (Curriculum) ile "hangi sınava hazırlanıyorum" (ExamTracking) farklı yaşam döngülerine sahip (biri kalıcı katalog, diğeri zamanla biten hedefler). Gerekçe: ExamTracking'in kendi CRUD'u ve kendi iş kuralları (sınav tarihi geçince ne olacağı gibi) var, Curriculum'a gömmek onu şişirir.

### 1.4 Öğrenme Motoru (`LearningEngine`)
**Sorumluluk:** Gerçek çalışma aktivitesini kaydetmek (Pomodoro oturumları, mini-kontroller), günlük çalışma planını yönetmek, ve bu aktiviteden **tekrar zamanlaması** (spaced repetition) üretmek.
**Sahip olduğu kavram:** Çalışma geçmişi (ne zaman, ne kadar, nasıl geçti), günlük görev listesi, "bu konuyu ne zaman tekrar etmeliyim" bilgisi.
**Bugünkü karşılığı:** `studySessions.service`, `topicChecks.service`, `dailyTasks.service`, `utils/spacedRepetition.ts`.
**🔴 Bugün ihlal edilen sınır:** `studySessions.service` ve `topicChecks.service`, kendi işini bitirince doğrudan `prisma.aIRecommendation.create(...)` çağırıyor — yani AI Coach modülünün (bkz. 1.5) verisine kendi elleriyle yazıyor. Ayrıca `computeNextReview` (`utils/spacedRepetition.ts`) `Topic.nextReview`'i güncelliyor — bu, Curriculum'un tablosuna LearningEngine'in yazması demek.

### 1.5 AI Koç & Öneri (`AICoach`)
**Sorumluluk:** Çalışma sinyallerini (deneme sayısı, ipucu, zorluk algısı vb.) ML servisine göndermek, dönen önceliği yorumlayıp kullanıcıya gösterilecek öneri/mesaj üretmek ("Kaptan" kişiliği dahil).
**Sahip olduğu kavram:** Öneri/tavsiye kayıtları, öncelik hesaplama sonucu.
**Bugünkü karşılığı:** `recommendations.service` (sadece OKUMA tarafı — `GET /recommendations`), `mlClient.service` (ML servisine HTTP çağrısı). **Yazma tarafı bu modülde değil** — bkz. 1.4'teki ihlal notu. Bugün `AICoach`'ın kendi "önce ML'i çağır, sonra öneri yarat" akışı yok; bu akış LearningEngine'in içine gömülü.
**🟡 Açık nokta (en önemlisi):** Bu, taslağın en büyük kararı. Şu an `StudySession`/`TopicCheck` tamamlanınca ML çağrısı + öneri yaratma işi LearningEngine'in servis fonksiyonlarının İÇİNDE yapılıyor. Doğru sınır çizersek, LearningEngine'in bunu bilmemesi, sadece "bir oturum tamamlandı" demesi (2. bölümdeki domain event tartışmasına bağlı) ve AICoach'ın buna tepki verip kendi tablosuna (`AIRecommendation`) kendi yazması gerekir. **Önerim:** Evet, bu ayrımı hedefleyelim ama V1'de zorla yapmayalım (bkz. bölüm 4) — bunun yerine en azından "AICoach'ın public arayüzü" olarak `AICoach.scoreAndRecommend(input): Promise<Recommendation | null>` gibi tek bir fonksiyon çıkaralım, LearningEngine bunu çağırsın ama `AIRecommendation` tablosuna kendi değil AICoach yazsın. Bu, büyük bir yeniden yazım değil, mevcut `predictPriority` + öneri oluşturma kodunun `mlClient.service.ts`'ten `recommendations.service.ts`'e taşınması kadar küçük bir iş.

### 1.6 Kişisel Gelişim (`Growth`)
**Sorumluluk:** Çalışma dışı alışkanlıkları ve ruh hali/günlük kayıtlarını takip etmek.
**Sahip olduğu kavram:** Alışkanlık serileri (streak), günlük duygu durumu.
**Bugünkü karşılığı:** `habits.service`, `journals.service`.
**🟡 Açık nokta:** Habit ve Journal aslında birbirinden bağımsız iki kavram (biri davranış takibi, diğeri duygu durumu) ama frontend'de tek ekranda (`GrowthHub`) birleşmiş durumdalar ve `Dashboard`'daki Kaptan mesajı `Journal.mood`'u okuyor (`getKaptanMessage`'a `mood` parametresi geçiliyor — bu, AICoach'ın Growth'un verisini okuduğu, bugün zaten var olan bir kesişim). **Önerim:** Backend'de iki ayrı modül (Habit, Journal) olarak kalsınlar — birleştirmenin somut bir faydası yok, ileride biri büyürse (örn. Journal'a gerçek NLP sentiment eklenirse) ayrı olmaları işimizi kolaylaştırır. Ama AICoach'ın Journal.mood okuması bilinçli bir tasarım kararı olarak burada belgeleniyor, kaza değil.

### 1.7 ML Servisi (`ml-service`, harici)
**Sorumluluk:** Verilen davranışsal sinyallerden "doğru cevap verme olasılığı" tahmini üretmek. Model eğitimi ve versiyonlama bu servisin sınırları içinde.
**Sahip olduğu kavram:** Eğitilmiş model, eğitim verisi, tahmin mantığı. **Hiçbir StudyMentor tablosunu bilmiyor** — bu zaten bugün de doğru: `ml-service` Prisma'ya hiç dokunmuyor, sadece `POST /predict/priority` üzerinden sayısal girdi alıp sayısal çıktı veriyor. Bu, tüm taslaktaki **en temiz** modül sınırı.

### 1.8 Modül Sayılmayan Ortak Altyapı
- `utils/httpError.ts`, `middleware/errorHandler.ts`, `utils/asyncHandler.ts` — hiçbir modüle ait değil, hepsi kullanıyor. Bu doğru ve kalmalı (gerçek bir "shared kernel").
- `utils/topicLabel.ts` (`getDisplayTopicLabel`) — LearningEngine ve AICoach'ın ikisi de kullanıyor ama aslında Curriculum'un sorumluluğunda olması gereken bir fonksiyon (bir konunun "görünen adı"nı hesaplıyor). **🟡 Açık nokta:** Bunu Curriculum modülünün public arayüzüne taşımalı mıyız, yoksa gerçekten paylaşılan bir yardımcı fonksiyon olarak mı kalsın? **Önerim:** Curriculum'a taşı — "bir konunun görünen adı ne" sorusu tanım gereği Curriculum'un bilmesi gereken bir şey, başka modüllerin kendi kendine hesaplamaması gerekir.
- `health.service` — hiçbir domain'e ait değil, operasyonel bir uç nokta (`/health`). Modül değil.

---

## 2. Modüller Arası İletişim Kuralları

Bugün StudyMentor'da **domain event altyapısı yok** — mesaj kuyruğu, event emitter, hiçbir şey. Her şey senkron, aynı process içinde, doğrudan fonksiyon çağrısı (ya da doğrudan Prisma çağrısı) ile oluyor. Bu yüzden bu bölüm büyük ölçüde **gelecek için bir öneri**, bugünün tarifi değil.

**Önerilen kural:**

- **Doğrudan çağrı (senkron):** Çağıran taraf, sonucu HEMEN bilmesi gerekiyorsa (örn. "bu konunun görünen adı ne, ekrana onu basacağım" ya da "bu kullanıcı gerçekten var mı") → modülün public arayüzünden senkron bir fonksiyon çağrısı. Bu, request/response döngüsünün büyük çoğunluğunu kapsar.
- **Domain event (asenkron/decouple):** Bir modül kendi işini bitirdi, bunun SONUCUNDA başka modüllerin bir şeyler yapması gerekiyor ama üretici modül bunu bilmek/beklemek zorunda değilse → event. Somut aday: `LearningEngine`, bir `StudySession`/`TopicCheck` tamamlandığında `StudyActivityCompleted` event'i yayınlar; `AICoach` bunu dinleyip skorlama+öneri üretir. Böylece LearningEngine "ML nasıl çalışıyor" bilgisinden tamamen bağımsızlaşır.

**🟡 Açık nokta:** Gerçek bir event altyapısı (in-process event emitter bile olsa) kurmak yeni bir soyutlama demek — solo geliştirilen, orta ölçekli bir projede bunun bedeli (öğrenme eğrisi, debug zorluğu — "bu event kim tarafından dinleniyor" takibi) faydasından fazla olabilir. **Önerim:** V1'de event altyapısı KURMAYALIM. Bunun yerine 1.5'teki öneriyi (AICoach'ın kendi public fonksiyonunu LearningEngine'in doğrudan çağırması, ama kendi tablosuna kendi yazması) yeterli görelim — bu, "doğrudan çağrı" ile de sınır ihlalini büyük ölçüde çözüyor, event'e gerek kalmadan. Event'i gerçekten event yapan şey (üreticinin tüketiciyi bilmemesi) burada şart değil; şu an tek bir tüketici (AICoach) var.

---

## 3. YASAK Liste (Hedef Kural — Bugün İhlal Ediliyor, Belgeleniyor)

Bu kurallar **V1'in sonundan itibaren** geçerli olmalı (bkz. bölüm 4 — bugünden itibaren zorla uygulamıyoruz, ama yeni kod bu kurallara göre yazılmalı):

1. **Bir modülün servisi, başka bir modülün sahip olduğu Prisma modeline doğrudan `prisma.X.*` çağrısı yapamaz.** Erişim, o modülün `service` dosyasındaki export edilmiş (public) fonksiyonlar üzerinden olmalı.
   - **Bugünkü ihlaller (gerçek):** `studySessions.service` → `prisma.topicCheck.count`, `prisma.topic.update`, `prisma.aIRecommendation.create`; `topicChecks.service` → `prisma.topic.update`, `prisma.aIRecommendation.create`; `dailyTasks.service` → `prisma.topic.findUnique`, `prisma.studySession.findUnique`; `exams.service`/`subjects.service`/`schedule.service` → `prisma.subject.*`/`prisma.topic.*` çapraz erişimleri.
2. **Bir modül, başka bir modülün internal tiplerini (Prisma'nın ürettiği model tipleri dahil) kendi fonksiyon imzalarında kullanamaz.** Sadece o modülün public arayüzünün tanımladığı DTO/interface'ler geçilebilir.
   - Bugün bu ayrım hiç yok — her yerde doğrudan Prisma tipleri dolaşıyor. Bunu netleştirmek muhtemelen en büyük emek isteyen madde.
3. **Frontend, backend'in hangi modülden geldiğini bilmeden `apiClient` üzerinden çağırır** — bu zaten bugün de doğru (frontend Prisma'yı hiç görmüyor, sadece REST). Değişiklik gerekmiyor.
4. **`ml-service`, hiçbir zaman StudyMentor'un veritabanına (Prisma/Postgres'e) doğrudan bağlanamaz.** Bugün zaten böyle, bilinçli olarak korunmalı — ML servisinin "sadece sayısal girdi/çıktı" sınırı, en kıymetli mevcut sınır.

**🟡 Açık nokta:** Madde 1 ve 2'yi bugün itibariyle SIKI uygulamaya kalksak, neredeyse her servis dosyasını yeniden yazmamız gerekir (yukarıdaki liste bunu gösteriyor). **Önerim:** Bu kuralı "yeni yazılan kod için zorunlu, var olan kod için aşama aşama" olarak kabul edelim — her yeni özellik/düzeltmede dokunduğumuz dosyada fırsat bulursak ihlali düzeltelim, ama bunun için ayrı bir "büyük refactor" sprint'i açmayalım (bkz. bölüm 4).

---

## 4. V1 Kapsam Dışı — Bilinçli Kararlar

Aşağıdakiler, bu taslağın ışığında **V1 için bilinçli olarak ertelenen** kararlar. Hepsi öneri niteliğinde, onayına açık:

- **Modül sınırlarının kod düzeyinde zorla uygulanması** (bölüm 3'teki ihlallerin düzeltilmesi) — büyük bir refactor, V1'in hızını düşürür. Öneri: V2'ye, ya da "dokunduğun yeri düzelt" prensibiyle organik olarak.
- **Domain event altyapısı** (bölüm 2) — gerçek ihtiyaç (birden fazla tüketici) doğana kadar kurulmasın.
- **`AICoach`'ın yazma tarafının ayrılması** (1.5) — tek başına küçük ve değerli bir iş olduğu için bunu V1 kapsam dışı saymak yerine **yakın vadede yapılacaklar** listesine almayı öneririm (kapsam dışı değil, sırada).
- **`ResourceSuggestion` modülü** — şema var, hiç servis/controller/route yazılmamış (CLAUDE.md'de zaten "Known gaps" olarak işaretli). Hangi modüle ait olacağı bile netleşmedi (Growth mu, AICoach mu?). Bilinçli olarak V1 dışı.
- **Modüller arası tip paylaşımı için ayrı bir `@studymentor/shared-types` paketi gibi bir çözüm** — monorepo tooling'i büyütür, tek backend process'i için şart değil. V1'de gerek yok.
- **`ExamTracking`'in Curriculum'dan tam ayrışması** (1.3) — bugünkü hafif çapraz-erişim (Subject okuma) kabul edilebilir seviyede, ayrıştırmaya değecek bir acı henüz yok.

---

## Özet: Karar Beklenen Noktalar

| # | Konu | Önerim |
|---|---|---|
| 1 | ExamTracking ayrı modül mü, Curriculum'un parçası mı? | Ayrı kalsın |
| 2 | AICoach'ın yazma tarafı LearningEngine'den ayrılsın mı? | Evet, yakın vadede (küçük iş) |
| 3 | Habit/Journal tek modül mü, iki mi? | İki ayrı modül, AICoach'ın Journal.mood okuması bilinçli istisna |
| 4 | `getDisplayTopicLabel` nerede yaşamalı? | Curriculum'un public arayüzüne taşınsın |
| 5 | Domain event altyapısı kurulsun mu? | Hayır, V1'de gerek yok |
| 6 | YASAK listesi bugünden sıkı uygulansın mı? | Hayır, yeni kod için zorunlu / eski kod için organik düzeltme |

Bu tablodaki her satır senin kararına açık — hepsinde kendi gerekçemi yazdım ama itiraz edersen değiştirebiliriz.
