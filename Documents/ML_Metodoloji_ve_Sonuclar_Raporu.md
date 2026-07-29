# StudyMentor — Makine Öğrenmesi Metodoloji ve Sonuçlar Raporu

Bu doküman, StudyMentor'ın öneri motoru (spaced repetition / çalışma önceliklendirme) için yürütülen makine öğrenmesi çalışmasının tamamını — hangi yöntemlerin neden kullanıldığını, aralarındaki farkları ve sonuçların ne anlama geldiğini — tek bir yerde topluca açıklar. Kod karşılığı: `ml-service/train.py` ve `ml-service/notebooks/spaced_repetition_eda.ipynb`.

---

## 1. Amaç: Bu Model Ne Yapıyor?

**Soru**: Bir öğrencinin bir ders konusundaki geçmiş çalışma davranışı (kaç kez tekrar ettiği, kaç deneme yaptığı, ne kadar sürede yanıtladığı, kaç ipucu istediği) verildiğinde, **şu an o konudaki bir soruyu doğru çözme olasılığı nedir?**

**Neden bu soru?** Bu olasılık düşükse, o konu "unutulmaya yüz tutmuş" demektir ve öğrenciye "bu konuyu şimdi tekrar et" önerisi verilebilir. Yani model, StudyMentor'ın "AI Study Coach" / öneri modülünün temelini oluşturuyor — UML tasarım dokümanında öngörülen "Random Forest + Spaced Repetition" bileşeninin somut karşılığı.

**Girdi (feature'lar)**: konu adı, o konudaki tekrar sayısı (`opportunity`), bu soruya yapılan deneme sayısı (`attempt_count`), ilk yanıt süresi (`ms_first_response`), soru üzerinde harcanan toplam süre (`overlap_time`), istenen ipucu sayısı (`hint_count`).

**Çıktı**: doğru cevap olasılığı (0-1) → düşükse `YUKSEK` öncelik, ortaysa `ORTA`, yüksekse `DUSUK` öncelik etiketi.

---

## 2. Veri Seti Araştırma Süreci — Neden Bu Kadar Çok Veri Seti Denedik?

İyi bir model, ancak gerçek davranış örüntüsü taşıyan bir veri setiyle anlamlı olur. Bu yüzden aday veri setlerini sırayla test edip elemeler yaptık:

| Veri seti | Sonuç | Neden elendi / seçildi |
|---|---|---|
| `studymentor_dataset.csv` (kendi sentetik verimiz) | — | Kural tabanlı/rastgele üretilmiş; üzerine model eğitmek sadece üretim formülünü ezberletir, gerçek örüntü öğretmez. |
| **xAPI-Edu-Data** | — | Sadece 480 satır, dönem-sonu toplam katılım sayıları var ama konu-bazlı tekrar/zaman bilgisi yok. |
| **UCI Student Performance** | `studytime` ↔ `G3` korelasyonu = **0.098** | Çalışma süresi ile final not arasında neredeyse hiç ilişki yok — "çalışma davranışı → performans" hipotezimizi desteklemedi. |
| **Duolingo Half-Life Regression** | Regresyon R²=**0.004**, ikili sınıflandırma AUC=**0.732** | 13M satır gerçek veri ama **kelime bazlı** (dil öğrenimi) — bizim **ders/konu bazlı** hedefimizle uyuşmadı. Ayrıca `p_recall` hedefi çok çarpık (%84'ü tam 1.0) olduğu için düz regresyon başarısız oldu. |
| **ASSISTments 2009-2010** | AUC=**0.958-0.967** (aşağıda detay) | Gerçek, 4.217 öğrenci, 110 gerçek matematik konusu, dengeli hedef dağılımı (%69.5/%30.5), güçlü davranışsal sinyal. **Seçildi.** |

---

## 3. Kullanılan Yöntemler ve Aralarındaki Farklar

### 3.1 Veri Bölme Stratejileri

| Yöntem | Ne yapar | Neden kullandık |
|---|---|---|
| **Train/Test Split (80/20)** | İlk denemelerde kullanıldı: veriyi tek seferde ikiye böler. | Basit ama tek bölünme "şanslı/şanssız" çıkabilir. |
| **Train/Validation/Test Split (70/15/15)** | Veriyi üçe böler: **eğitim** (modeli kurmak), **doğrulama** (geliştirme sırasında ayar/kontrol), **test** (en sonda, bir kez, tarafsız nihai ölçüm). | **Mentör talebi.** Test setini geliştirme sırasında hiç görmemek, gerçek genelleme performansını ölçmenin altın standardı. |
| **K-Fold Cross-Validation (5 kat)** | Veriyi 5 parçaya bölüp, her seferinde 4 parçayla eğitip 1 parçayla test ederek 5 farklı sonuç üretir, ortalama+standart sapma raporlanır. | Tek bir bölünmenin (train/val/test) sonucunun **şansa bağlı olup olmadığını** doğrulamak için ek bir kontrol. |

**Sonuç karşılaştırması**: Doğrulama AUC 0.959, Test AUC 0.958, 5-kat CV AUC 0.960±0.002 — üçü de birbirine çok yakın. Bu, modelin **overfitting yapmadığının** ve sonucun **güvenilir** olduğunun kanıtı.

### 3.2 Model Aileleri

**Decision Tree (Karar Ağacı)**
Veriyi sorular sorarak ("hint_count > 2 mi?") dallara ayırıp bir tahmine ulaşan tek bir ağaç yapısı. Basit ve yorumlanabilir ama tek başına **aşırı öğrenmeye (overfitting)** yatkındır — veriyi ezberleyebilir.

**Ensemble (Topluluk Öğrenmesi)** — genel strateji
Birden fazla modelin tahminini birleştirerek tek bir modelden daha güçlü/kararlı bir sonuç elde etme yaklaşımı. İki ana alt türü var: **Bagging** ve **Boosting**.

**Bagging → Random Forest**
Veriden rastgele alt örneklemler alıp, **birbirinden bağımsız**, paralel olarak yüzlerce ağaç eğitip sonuçların ortalamasını/oyunu alır. Random Forest ayrıca her ağaçta rastgele bir özellik alt kümesi de kullanır (ağaçlar arası korelasyonu azaltmak için). Tek ağaca göre çok daha az overfitting yapar.

**Boosting → XGBoost**
Bagging'in aksine ağaçlar **sırayla** eğitilir — her yeni ağaç, bir öncekinin **hatalarına** odaklanıp onları düzeltmeye çalışır. Zayıf ağaçlar zincirleme birleşerek güçlü bir model oluşturur. Genellikle Random Forest'tan biraz daha yüksek performans verir ama hiperparametre ayarına daha duyarlıdır.

**Logistic Regression** — doğrusal baseline
Özelliklerin ağırlıklı toplamını alıp bir sigmoid fonksiyonuyla olasılığa çevirir. Ağaç tabanlı modellerin aksine **doğrusal olmayan ilişkileri** (örn. "az ipucu iyi, çok ipucu kötü" gibi eşik etkileri) yakalayamaz. Basit, hızlı, iyi bir "acaba karmaşık model gerçekten gerekli mi?" kıyaslama noktası.

### 3.3 Model Anlama ve Sadeleştirme Araçları

**Feature Importance (Özellik Önemi)**
Random Forest/XGBoost gibi ağaç tabanlı modeller, her özelliğin karar noktalarında ne kadar sık ve etkili kullanıldığını raporlayabilir (`feature_importances_`). Bu, "model gerçekte neye bakıyor?" sorusunun cevabıdır.

**Korelasyon vs. Feature Importance farkı**: Korelasyon, iki değişken arasındaki **doğrusal, tekil** ilişkiyi ölçer. Feature importance ise modelin **karar ağaçlarında gerçekte nasıl karar verdiğini** ölçer (diğer özelliklerle etkileşimleri de dahil). Bizim verimizde bu ikisi **farklı sonuç verdi**: korelasyonda `hint_count` (-0.54) önde, ama Random Forest'in gerçek karar mekanizmasında `attempt_count` (%45.9) daha belirleyici çıktı, `hint_count` (%29.4) ikinci sırada. Bu, iki metriğin farklı şeyler ölçtüğünü gösteren iyi bir örnek.

**Feature Selection (Özellik Seçimi)**
Performansı ciddi düşürmeden gereksiz özellikleri çıkarma sürecidir. Feature importance analizinde `skill_name` (110 kategori) sadece %6.6 katkı gösterdiği için, onu tamamen çıkarıp modeli tekrar eğittik.

**Outlier (Aykırı Değer) Temizliği — Winsorizing**
Veride gerçekçi olmayan uç değerler bulundu (`attempt_count` max=3740, `ms_first_response` max≈8 saat — muhtemelen kayıt hataları). Bu değerleri silmek yerine 99. yüzdelikte **kırptık (clip)** — böylece birkaç bozuk satır, ağaçların bölme noktalarını çarpıtmıyor.

---

## 4. Sonuçlar ve Yorumları

### 4.1 Model Karşılaştırması (aynı veri, aynı %70/%15/%15 bölünme)

| Model | AUC | Accuracy | Yorum |
|---|---|---|---|
| Logistic Regression | 0.915 | 0.879 | En zayıf — verideki ilişkilerin **doğrusal olmadığını** kanıtlıyor. |
| Decision Tree | 0.944 | 0.930 | Tek ağaç bile şaşırtıcı derecede iyi — özellikler (özellikle `hint_count`, `attempt_count`) çok güçlü bağımsız sinyaller taşıyor. |
| Random Forest | 0.958 | 0.926 | Bagging, tek ağaca göre gerçek ama ölçülü bir iyileşme sağlıyor. |
| **XGBoost** | **0.967** | 0.928 | En iyi sonuç — boosting'in hataya-odaklanma stratejisi burada işe yaradı. |

### 4.2 Feature Selection Sonucu

`skill_name` (hangi konu olduğu) tamamen çıkarılınca AUC 0.958'den 0.941-0.942'ye düştü — **sadece ~0.016-0.017 puanlık bir kayıp**. Bu, modelin büyük ölçüde **davranışa** (ne kadar denedi, ne kadar ipucu istedi) dayandığını, **hangi spesifik konu olduğuna** nispeten az bağlı olduğunu gösteriyor. Pratik anlamı: bu davranışsal sinyaller muhtemelen StudyMentor'daki **her derse/konuya genellenebilir**.

### 4.3 Veri Doğrulama Tutarlılığı

Doğrulama seti (AUC 0.959), test seti (AUC 0.958) ve 5-kat cross-validation (AUC 0.960±0.002) sonuçları birbirine çok yakın çıktı. Bunun anlamı: model, gördüğü veriyi ezberlemiyor (overfit değil), gerçekten genelleme yapıyor — yani üretimde de benzer performans beklenebilir.

### 4.4 Genel Sonuç

- **Kullanılabilir bir model var**: XGBoost ile AUC 0.967 (notebook karşılaştırması) / 0.968 (üretim modeli, tam eğitim), Random Forest ile 0.958 — XGBoost daha iyi performans verdi.
- **En büyük tek sinyal**: öğrencinin bir soruda ne kadar "zorlandığı" (deneme sayısı + ipucu sayısı) — bu, klasik unutma-eğrisi mantığıyla (ne kadar çok tekrar/çaba gerekiyor, o kadar çok pekiştirme gerekir) örtüşüyor.
- **Karar verildi: Üretim modeli XGBoost**. `train.py`, `app/model.py` ve FastAPI servisi artık XGBoost kullanıyor — 5-katlı cross-validation AUC 0.970 (±0.001), test AUC 0.968, "yanlış" sınıfını yakalama oranı (recall) Random Forest'e göre arttı (0.77 → 0.84).
- **Duolingo veri seti için gelecek planı**: Bu veri seti (kelime bazlı, gerçek dil öğrenimi verisi) StudyMentor'a ileride eklenebilecek bir **İngilizce kelime kartı (flashcard)** özelliği için referans olarak `ml-service/fixtures/duolingo_sample_50k.csv`'de saklanmaya devam ediyor — o özellik geliştirildiğinde doğrudan kullanılabilir.
- **Sıradaki faz**: Şu an ASSISTments (proxy/vekil) veriyle çalışan bir sistem kuruyoruz. StudyMentor gerçek kullanıcılardan veri topladıkça (kendi öğrencilerin gerçek çalışma oturumları), aynı `train.py` kalıbı gerçek veriyle yeniden eğitilip çok daha kapsamlı, uygulamaya özel bir model haline getirilecek.
- **Bilinen sınırlama**: Bu veri setinde gerçek saat/tarih bilgisi yok (sadece işlem sırası var), o yüzden "günün hangi saatinde daha verimli çalışıyor" sorusunu şu an cevaplayamıyoruz.

---

## 5. Kod Karşılığı

- `ml-service/train.py` — üretim modelini eğiten script (şu an Random Forest, 70/15/15 bölünme + 5-kat CV).
- `ml-service/notebooks/spaced_repetition_eda.ipynb` — bu raporun dayandığı tüm analizler, çalıştırılmış çıktılarıyla birlikte (Duolingo denemesi dahil, "Ek" bölümünde).
- `ml-service/app/model.py`, `ml-service/app/predict.py` — eğitilen modeli FastAPI üzerinden servis eden kod (`/predict/priority` endpoint'i).
