import { PrismaClient } from "@prisma/client";
import type { EducationLevel, ExamCategory } from "@prisma/client";

const prisma = new PrismaClient();

const SEED_DATA: { educationLevel: EducationLevel; subjects: { name: string; topics: string[] }[] }[] = [
  {
    educationLevel: "MIDDLE_SCHOOL",
    subjects: [
      { name: "Matematik", topics: ["Kesirler", "Denklemler", "Oran ve Orantı"] },
      { name: "Fen Bilimleri", topics: ["Hücre", "Kuvvet ve Hareket"] },
    ],
  },
  {
    educationLevel: "HIGH_SCHOOL",
    subjects: [
      { name: "Matematik", topics: ["Türev", "İntegral", "Limit"] },
      { name: "Fizik", topics: ["Vektörler", "Kuvvet ve Newton Yasaları"] },
    ],
  },
  {
    educationLevel: "UNIVERSITY",
    subjects: [
      { name: "Veri Yapıları", topics: ["Bağlı Listeler", "Ağaçlar"] },
      { name: "Lineer Cebir", topics: ["Matrisler", "Vektör Uzayları"] },
    ],
  },
  {
    educationLevel: "LIFELONG_LEARNER",
    subjects: [
      { name: "Yazılım Geliştirme", topics: ["React", "TypeScript"] },
      { name: "Kişisel Gelişim", topics: ["Zaman Yönetimi"] },
    ],
  },
];

// Kaynak: ÖSYM/MEB-TTKB güncel kılavuz ve müfredat dokümanlarına dayanan genel bir
// sınav->bölüm->ders->konu->alt_konu iskeleti (kullanıcı tarafından sağlandı). Gerçek
// çıkmış soru metni içermez. Alt konusu olan her konu, alt konu başına ayrı bir Topic
// satırına dönüşür (ör. "Sözcükte Anlam - Gerçek-Mecaz-Terim Anlam").
interface KonuEntry {
  konu: string;
  altKonular?: string[];
}

function expandTopics(konular: KonuEntry[]): string[] {
  const result: string[] = [];
  for (const { konu, altKonular } of konular) {
    if (!altKonular || altKonular.length === 0) {
      result.push(konu);
    } else {
      for (const alt of altKonular) {
        result.push(`${konu} - ${alt}`);
      }
    }
  }
  return result;
}

const EXAM_CATALOG: { examCategory: ExamCategory; subjects: { name: string; konular: KonuEntry[] }[] }[] = [
  {
    // LGS - Tek Oturum
    examCategory: "LGS",
    subjects: [
      {
        name: "Türkçe",
        konular: [
          { konu: "Sözcükte Anlam", altKonular: ["Gerçek-Mecaz-Terim Anlam", "Deyim ve Atasözleri", "Eş ve Zıt Anlamlılık"] },
          { konu: "Cümlede Anlam", altKonular: ["Neden-Sonuç, Amaç-Sonuç İlişkisi", "Öznel-Nesnel Yargı", "Cümle Tamamlama"] },
          { konu: "Paragraf", altKonular: ["Ana Düşünce", "Yardımcı Düşünce", "Paragrafta Anlatım Teknikleri", "Paragrafta Yapı (Giriş-Gelişme-Sonuç)"] },
          { konu: "Söz Sanatları", altKonular: ["Benzetme", "Kişileştirme", "Abartma"] },
          { konu: "Dil Bilgisi", altKonular: ["Fiilimsiler", "Cümlenin Ögeleri", "Cümle Türleri", "Yazım Kuralları", "Noktalama İşaretleri"] },
          { konu: "Görsel Yorumlama", altKonular: ["Grafik-Tablo Yorumlama", "İnfografik Okuma"] },
        ],
      },
      {
        name: "Matematik",
        konular: [
          { konu: "Çarpanlar ve Katlar", altKonular: ["EBOB-EKOK"] },
          { konu: "Üslü İfadeler" },
          { konu: "Kareköklü İfadeler" },
          { konu: "Veri Analizi", altKonular: ["Merkezi Eğilim Ölçüleri", "Grafik Türleri"] },
          { konu: "Olasılık", altKonular: ["Basit Olayların Olma Olasılığı"] },
          { konu: "Cebirsel İfadeler ve Özdeşlikler" },
          { konu: "Doğrusal Denklemler" },
          { konu: "Eşitsizlikler" },
          { konu: "Üçgenler", altKonular: ["Eşlik ve Benzerlik", "Açıortay-Kenarortay"] },
          { konu: "Dönüşüm Geometrisi", altKonular: ["Öteleme", "Yansıma"] },
          { konu: "Eşlik ve Benzerlik" },
          { konu: "Geometrik Cisimler", altKonular: ["Katı Cisimlerin Yüzey Alanı ve Hacmi"] },
        ],
      },
      {
        name: "Fen Bilimleri",
        konular: [
          { konu: "Mevsimler ve İklim" },
          { konu: "DNA ve Genetik Kod", altKonular: ["Kalıtım", "Mutasyon-Modifikasyon"] },
          { konu: "Basınç", altKonular: ["Katı-Sıvı-Gaz Basıncı"] },
          { konu: "Madde ve Endüstri", altKonular: ["Periyodik Sistem", "Kimyasal Bağlar"] },
          { konu: "Basit Makineler" },
          { konu: "Enerji Dönüşümleri ve Çevre Bilimi" },
          { konu: "Elektrik Yükleri ve Elektrik Enerjisi", altKonular: ["Elektriksel Direnç", "Devre Elemanları"] },
        ],
      },
      {
        name: "T.C. İnkılap Tarihi ve Atatürkçülük",
        konular: [
          { konu: "Bir Kahraman Doğuyor", altKonular: ["Mustafa Kemal'in Çocukluğu ve Askerlik Hayatı"] },
          { konu: "Milli Uyanış: Bağımsızlık Yolunda Atılan Adımlar", altKonular: ["I. Dünya Savaşı", "Mondros Ateşkesi", "İşgaller"] },
          { konu: "Milli Bir Destan: Ya İstiklal Ya Ölüm", altKonular: ["Kongreler Süreci", "Kurtuluş Savaşı Cepheleri"] },
          { konu: "Atatürkçülük ve Çağdaşlaşan Türkiye", altKonular: ["Siyasi İnkılaplar", "Hukuk İnkılabı", "Eğitim ve Kültür İnkılapları"] },
          { konu: "Demokratikleşme Çabaları" },
          { konu: "Atatürk Dönemi Dış Politika" },
          { konu: "Atatürk'ün Ölümü ve Sonrası" },
        ],
      },
      {
        name: "Din Kültürü ve Ahlak Bilgisi",
        konular: [
          { konu: "Kader İnancı" },
          { konu: "Zekat ve Sadaka" },
          { konu: "Din ve Hayat" },
          { konu: "Hz. Muhammed'in Örnekliği" },
          { konu: "Kur'an-ı Kerim ve Özellikleri" },
        ],
      },
      {
        name: "İngilizce",
        konular: [
          { konu: "Friendship" }, { konu: "Teen Life" }, { konu: "In the Kitchen" }, { konu: "On the Phone" },
          { konu: "The Internet" }, { konu: "Adventures" }, { konu: "Tourism" }, { konu: "Chores" },
          { konu: "Science" }, { konu: "Natural Forces" },
        ],
      },
    ],
  },
  {
    // YKS - TYT
    examCategory: "TYT",
    subjects: [
      {
        name: "Türkçe",
        konular: [
          { konu: "Sözcükte Anlam", altKonular: ["Gerçek-Mecaz-Terim Anlam", "Çok Anlamlılık"] },
          { konu: "Cümlede Anlam", altKonular: ["Cümle Tamamlama", "Anlatım Bozuklukları"] },
          { konu: "Paragraf", altKonular: ["Anlatım Teknikleri", "Düşünceyi Geliştirme Yolları", "Paragrafta Yapı", "Paragrafta Konu-Ana Düşünce"] },
          { konu: "Ses Bilgisi" },
          { konu: "Yazım Kuralları" },
          { konu: "Noktalama İşaretleri" },
          { konu: "Sözcükte Yapı/Ekler" },
          { konu: "Sözcük Türleri", altKonular: ["İsimler", "Fiiller", "Zamirler", "Sıfatlar", "Zarflar", "Edat-Bağlaç-Ünlem"] },
          { konu: "Fiilde Çatı" },
          { konu: "Cümlenin Ögeleri" },
          { konu: "Cümle Türleri" },
          { konu: "Anlatım Bozukluğu" },
        ],
      },
      {
        name: "Sosyal Bilimler",
        konular: [
          { konu: "Tarih", altKonular: ["Tarih ve Zaman", "İlk ve Orta Çağlarda Türk Dünyası", "İslam Medeniyeti ve Türkler", "Türkiye Tarihi (11-13. yy)", "Beylikten Devlete Osmanlı Siyaseti", "Devlet-i Aliyye (Osmanlı)", "Değişen Dünya Dengeleri Karşısında Osmanlı Siyaseti", "En Uzun Yüzyıl", "Milli Mücadele", "Atatürkçülük ve Türk İnkılabı"] },
          { konu: "Coğrafya", altKonular: ["Doğa ve İnsan", "Dünya'nın Şekli ve Hareketleri", "Coğrafi Konum", "Harita Bilgisi", "Atmosfer ve İklim", "Yerin Şekillenmesi (İç-Dış Kuvvetler)", "Su-Toprak-Bitki", "Nüfus", "Yerleşme", "Ekonomik Faaliyetler (Tarım-Sanayi-Ticaret)"] },
          { konu: "Felsefe", altKonular: ["Felsefeyle Tanışma", "Bilgi Felsefesi", "Varlık Felsefesi", "Ahlak Felsefesi", "Sanat Felsefesi", "Din Felsefesi", "Siyaset Felsefesi", "Bilim Felsefesi"] },
          { konu: "Din Kültürü ve Ahlak Bilgisi", altKonular: ["Bilgi ve İnanç", "İslam ve İbadet", "Gençlik ve Değerler", "Ahlaki Tutum ve Davranışlar", "Din ve Hayat", "Kur'an'a Göre Hz. Muhammed"] },
        ],
      },
      {
        name: "Temel Matematik",
        konular: [
          { konu: "Temel Kavramlar", altKonular: ["Sayı Basamakları", "Bölme-Bölünebilme", "EBOB-EKOK"] },
          { konu: "Rasyonel Sayılar" },
          { konu: "Basit Eşitsizlikler" },
          { konu: "Mutlak Değer" },
          { konu: "Üslü İfadeler" },
          { konu: "Köklü İfadeler" },
          { konu: "Çarpanlara Ayırma" },
          { konu: "Oran-Orantı" },
          { konu: "Problemler", altKonular: ["Sayı Problemleri", "Yaş Problemleri", "İşçi-Havuz Problemleri", "Hareket Problemleri", "Yüzde-Kar-Zarar Problemleri", "Karışım Problemleri"] },
          { konu: "Kümeler" },
          { konu: "Fonksiyonlar" },
          { konu: "Polinomlar" },
          { konu: "II. Dereceden Denklemler" },
          { konu: "Permütasyon-Kombinasyon-Olasılık" },
          { konu: "İstatistik", altKonular: ["Veri, Sıklık, Grafik Yorumlama"] },
          { konu: "Geometri", altKonular: ["Üçgenler", "Çokgenler", "Çember ve Daire", "Analitik Geometri", "Katı Cisimler", "Dönüşüm Geometrisi"] },
        ],
      },
      {
        name: "Fen Bilimleri",
        konular: [
          { konu: "Fizik", altKonular: ["Fizik Bilimine Giriş", "Madde ve Özellikleri", "Hareket ve Kuvvet", "Enerji", "Isı ve Sıcaklık", "Elektrostatik", "Elektrik ve Manyetizma", "Basınç ve Kaldırma Kuvveti", "Optik", "Dalgalar"] },
          { konu: "Kimya", altKonular: ["Kimya Bilimi", "Atom ve Periyodik Sistem", "Kimyasal Türler Arası Etkileşimler", "Maddenin Halleri", "Doğa ve Kimya", "Kimyanın Temel Kanunları", "Karışımlar", "Asit-Baz-Tuz", "Kimya Her Yerde"] },
          { konu: "Biyoloji", altKonular: ["Yaşam Bilimi Biyoloji", "Hücre", "Canlılar Dünyası", "Hücre Bölünmeleri ve Üreme", "Kalıtım", "Ekosistem Ekolojisi", "Canlılık ve Enerji", "İnsan Fizyolojisi (Sistemler)"] },
        ],
      },
    ],
  },
  {
    // YKS - AYT
    examCategory: "AYT",
    subjects: [
      {
        name: "Türk Dili ve Edebiyatı - Sosyal Bilimler-1",
        konular: [
          { konu: "Türk Dili ve Edebiyatı", altKonular: ["Anlam Bilgisi", "Dil Bilgisi", "Edebiyat Bilgi ve Kuramları", "İslamiyet Öncesi Türk Edebiyatı", "Halk Edebiyatı", "Divan Edebiyatı", "Tanzimat Edebiyatı", "Servet-i Fünun ve Fecr-i Ati", "Milli Edebiyat", "Cumhuriyet Dönemi Türk Edebiyatı", "Dünya Edebiyatı"] },
          { konu: "Tarih-1", altKonular: ["İnkılap Tarihi ve Atatürkçülük Öncesi Dönem (Tarih tekrar konuları)"] },
          { konu: "Coğrafya-1", altKonular: ["Beşeri Sistemler", "Küresel Ortam: Bölgeler ve Ülkeler"] },
        ],
      },
      {
        name: "Sosyal Bilimler-2",
        konular: [
          { konu: "Tarih-2", altKonular: ["20. yy Başlarında Osmanlı Devleti ve Dünya", "Milli Mücadele", "Atatürkçülük ve Türk İnkılabı", "İki Savaş Arası Dönemde Türkiye ve Dünya", "II. Dünya Savaşı Sürecinde Türkiye ve Dünya", "Soğuk Savaş Dönemi", "Yumuşama Dönemi ve Sonrası", "Küreselleşen Dünya"] },
          { konu: "Coğrafya-2", altKonular: ["Ekosistem", "Nüfus Politikaları", "Şehirlerin Fonksiyonları", "Türkiye Ekonomisi", "Türkiye'de Tarım-Sanayi-Ulaşım", "Ülkeler Arası Etkileşim", "Çevre ve Toplum", "Doğal Afetler"] },
          { konu: "Felsefe Grubu", altKonular: ["Felsefe", "Psikoloji", "Sosyoloji", "Mantık"] },
          { konu: "Din Kültürü ve Ahlak Bilgisi (AYT)", altKonular: ["İslam Düşüncesinde Yorumlar", "Din, Kültür ve Medeniyet", "Güncel Dini Meseleler", "Hint ve Çin Dinleri"] },
        ],
      },
      {
        name: "Matematik",
        konular: [
          { konu: "Fonksiyonlar" }, { konu: "Polinomlar" }, { konu: "II. Dereceden Denklemler" }, { konu: "Karmaşık Sayılar" },
          { konu: "Eşitsizlikler" }, { konu: "Parabol" }, { konu: "Trigonometri" }, { konu: "Logaritma" }, { konu: "Diziler" },
          { konu: "Limit ve Süreklilik" }, { konu: "Türev" }, { konu: "İntegral" }, { konu: "Permütasyon-Kombinasyon-Olasılık-Binom" },
          { konu: "Analitik Geometri", altKonular: ["Doğru", "Çember", "Elips-Parabol-Hiperbol"] },
          { konu: "Katı Cisimler" }, { konu: "Vektörler" },
        ],
      },
      {
        name: "Fen Bilimleri",
        konular: [
          { konu: "Fizik", altKonular: ["Vektörler ve Kuvvet", "Bağıl Hareket", "Newton'un Hareket Yasaları", "İş-Güç-Enerji", "Atışlar", "İtme-Momentum", "Elektrik Alan-Potansiyel", "Manyetik Alan", "İndüksiyon-Alternatif Akım", "Çembersel Hareket", "Kütle Çekim ve Kepler Yasaları", "Basit Harmonik Hareket", "Dalga Mekaniği", "Atom Fiziği ve Radyoaktivite", "Modern Fizik", "Elektronik"] },
          { konu: "Kimya", altKonular: ["Modern Atom Teorisi", "Gazlar", "Sıvı Çözeltiler ve Çözünürlük", "Kimyasal Tepkimelerde Enerji", "Kimyasal Tepkimelerde Hız", "Kimyasal Tepkimelerde Denge", "Asit-Baz Dengesi", "Çözünürlük Dengesi", "Elektrokimya", "Karbon Kimyasına Giriş", "Organik Kimya (Hidrokarbonlar ve Türevleri)", "Enerji Kaynakları ve Bilimsel Gelişmeler"] },
          { konu: "Biyoloji", altKonular: ["Sinir Sistemi", "Endokrin Sistem", "Duyu Organları", "Destek ve Hareket Sistemi", "Sindirim Sistemi", "Dolaşım ve Bağışıklık Sistemi", "Solunum Sistemi", "Boşaltım Sistemi", "Üreme Sistemi ve Embriyonik Gelişim", "Komünite ve Popülasyon Ekolojisi", "Genden Proteine", "Bitki Biyolojisi", "Canlılarda Enerji Dönüşümleri (Fotosentez-Solunum)", "Bitki ve Hayvanlarda Üreme-Büyüme-Gelişme", "Canlılar ve Çevre"] },
        ],
      },
    ],
  },
  {
    // YKS - YDT
    examCategory: "YDT",
    subjects: [
      {
        name: "Yabancı Dil (İngilizce/Almanca/Fransızca)",
        konular: [
          { konu: "Kelime Bilgisi" },
          { konu: "Dil Bilgisi (Gramer)", altKonular: ["Zamanlar", "Edatlar", "Bağlaçlar", "Kalıp İfadeler"] },
          { konu: "Cloze Test (Boşluk Doldurma)" },
          { konu: "Cümle Tamamlama" },
          { konu: "Çeviri (Türkçe-Yabancı Dil / Yabancı Dil-Türkçe)" },
          { konu: "Diyalog Tamamlama" },
          { konu: "Paragraf Tamamlama" },
          { konu: "Anlam Bütünlüğünü Bozan Cümle" },
          { konu: "Okuduğunu Anlama (Reading Comprehension)" },
          { konu: "Çeviride Anlamca En Yakın Cümle" },
        ],
      },
    ],
  },
  {
    // KPSS - Genel Yetenek Genel Kültür (tüm adaylar için ortak)
    examCategory: "KPSS",
    subjects: [
      {
        name: "Türkçe",
        konular: [
          { konu: "Sözcükte ve Cümlede Anlam", altKonular: ["Gerçek-Mecaz-Terim Anlam", "Eş-Zıt-Yakın Anlamlılık", "Deyim ve Atasözü"] },
          { konu: "Paragraf", altKonular: ["Ana Düşünce", "Yardımcı Düşünce", "Paragrafta Yapı", "Anlatım Teknikleri", "Düşünceyi Geliştirme Yolları"] },
          { konu: "Anlatım Bozuklukları" },
          { konu: "Ses Bilgisi" },
          { konu: "Yapı Bilgisi (Ekler)" },
          { konu: "Sözcük Türleri" },
          { konu: "Cümlenin Ögeleri" },
          { konu: "Yazım Kuralları" },
          { konu: "Noktalama İşaretleri" },
        ],
      },
      {
        name: "Matematik (Sayısal Yetenek)",
        konular: [
          { konu: "Temel Kavramlar", altKonular: ["Sayı Basamakları", "Bölme-Bölünebilme", "EBOB-EKOK"] },
          { konu: "Rasyonel Sayılar" },
          { konu: "Üslü-Köklü İfadeler" },
          { konu: "Oran-Orantı" },
          { konu: "Problemler", altKonular: ["Sayı", "Yaş", "İşçi-Havuz", "Hareket", "Yüzde-Kar-Zarar", "Karışım"] },
          { konu: "Kümeler-Mantık" },
          { konu: "Permütasyon-Kombinasyon-Olasılık" },
          { konu: "Grafik ve Tablo Yorumlama" },
        ],
      },
      {
        name: "Geometri",
        konular: [
          { konu: "Üçgenler" }, { konu: "Çokgenler ve Dörtgenler" }, { konu: "Çember ve Daire" },
          { konu: "Katı Cisimler" }, { konu: "Analitik Geometri" },
        ],
      },
      {
        name: "Tarih",
        konular: [
          { konu: "İslamiyet Öncesi Türk Tarihi" },
          { konu: "Türk-İslam Tarihi" },
          { konu: "Osmanlı Kuruluş-Yükseliş-Duraklama-Gerileme-Dağılma Dönemleri" },
          { konu: "Osmanlı Kültür ve Medeniyeti" },
          { konu: "Milli Mücadele Dönemi", altKonular: ["Kongreler", "Cepheler"] },
          { konu: "Atatürk İlke ve İnkılapları" },
          { konu: "Çağdaş Türk ve Dünya Tarihi" },
        ],
      },
      {
        name: "Coğrafya",
        konular: [
          { konu: "Türkiye'nin Yer Şekilleri" },
          { konu: "Türkiye'nin İklimi ve Bitki Örtüsü" },
          { konu: "Türkiye'de Nüfus ve Yerleşme" },
          { konu: "Türkiye'de Tarım-Hayvancılık-Madencilik" },
          { konu: "Türkiye'de Sanayi ve Ticaret" },
          { konu: "Türkiye'de Ulaşım ve Turizm" },
          { konu: "Bölgeler Coğrafyası" },
          { konu: "Harita Bilgisi" },
        ],
      },
      {
        name: "Vatandaşlık",
        konular: [
          { konu: "Temel Hukuk Kavramları" },
          { konu: "Anayasa Hukuku", altKonular: ["1982 Anayasası'nın Genel Esasları", "Temel Hak ve Ödevler"] },
          { konu: "Yasama", altKonular: ["TBMM'nin Yapısı ve Görevleri"] },
          { konu: "Yürütme", altKonular: ["Cumhurbaşkanlığı", "Bakanlıklar"] },
          { konu: "Yargı", altKonular: ["Yüksek Mahkemeler"] },
          { konu: "İdare Hukuku", altKonular: ["Merkezi ve Yerel Yönetim"] },
        ],
      },
      {
        name: "Güncel Bilgiler",
        konular: [
          { konu: "Güncel Siyaset ve Ekonomi Gündemi" },
          { konu: "Uluslararası Kuruluşlar ve İlişkiler" },
          { konu: "Bilim-Teknoloji Gelişmeleri" },
          { konu: "Kültür-Sanat-Spor Gündemi" },
        ],
      },
    ],
  },
  {
    // KPSS - Eğitim Bilimleri (öğretmenlik için)
    examCategory: "KPSS_EGITIM_BILIMLERI",
    subjects: [
      {
        name: "Eğitim Bilimleri",
        konular: [
          { konu: "Gelişim Psikolojisi", altKonular: ["Bilişsel Gelişim (Piaget)", "Psikososyal Gelişim (Erikson)", "Ahlak Gelişimi (Kohlberg)", "Dil Gelişimi"] },
          { konu: "Öğrenme Psikolojisi", altKonular: ["Davranışçı Yaklaşım", "Bilişsel Yaklaşım", "Sosyal Öğrenme Kuramı", "Yapılandırmacı Yaklaşım", "Transfer ve Unutma"] },
          { konu: "Öğretim İlke ve Yöntemleri", altKonular: ["Öğretim İlkeleri", "Öğretim Strateji-Yöntem-Teknikleri", "Öğretim Materyalleri"] },
          { konu: "Program Geliştirme", altKonular: ["Program Geliştirmenin Temelleri", "Program Geliştirme Modelleri", "Öğretim Programının Ögeleri"] },
          { konu: "Ölçme ve Değerlendirme", altKonular: ["Ölçme Araç ve Yöntemleri", "Test Geliştirme", "Not Verme Sistemleri"] },
          { konu: "Rehberlik", altKonular: ["Rehberliğin İlkeleri", "Rehberlik Hizmet Alanları"] },
          { konu: "Sınıf Yönetimi" },
          { konu: "Özel Eğitim" },
          { konu: "Öğretim Teknolojileri ve Materyal Tasarımı" },
          { konu: "Türk Eğitim Sistemi ve Okul Yönetimi" },
        ],
      },
    ],
  },
  {
    // ALES - Sözel + Sayısal
    examCategory: "ALES",
    subjects: [
      {
        name: "Sözel Muhakeme",
        konular: [
          { konu: "Sözcük ve Cümle Bilgisi", altKonular: ["Anlamca Yakın-Uzak Cümleler"] },
          { konu: "Paragraf", altKonular: ["Ana Düşünce", "Anlatım Teknikleri", "Paragraf Tamamlama"] },
          { konu: "Mantıksal Akıl Yürütme (Sözel)", altKonular: ["Akıl Yürütme", "Sıralama-Eşleştirme Problemleri"] },
          { konu: "Anlatım Bozukluğu" },
        ],
      },
      {
        name: "Sayısal Muhakeme",
        konular: [
          { konu: "Temel Matematik", altKonular: ["Sayılar", "Bölünebilme", "EBOB-EKOK", "Üslü-Köklü İfadeler"] },
          { konu: "Problemler", altKonular: ["Sayı, Yaş, Hareket, İşçi-Havuz, Yüzde-Kar-Zarar, Karışım"] },
          { konu: "Geometri", altKonular: ["Temel Geometrik Kavramlar", "Alan-Hacim Hesapları"] },
          { konu: "Veri Yorumlama", altKonular: ["Grafik ve Tablo Okuma", "İstatistik Temelleri"] },
          { konu: "Mantıksal Akıl Yürütme (Sayısal)" },
        ],
      },
    ],
  },
  {
    // DGS - Tek Oturum
    examCategory: "DGS",
    subjects: [
      {
        name: "Sözel Bölüm",
        konular: [
          { konu: "Sözcükte ve Cümlede Anlam" },
          { konu: "Paragraf", altKonular: ["Ana Düşünce", "Anlatım Teknikleri", "Paragrafta Yapı"] },
          { konu: "Dil Bilgisi", altKonular: ["Yazım Kuralları", "Noktalama", "Anlatım Bozukluğu"] },
          { konu: "Sözel Mantık" },
        ],
      },
      {
        name: "Sayısal Bölüm",
        konular: [
          { konu: "Temel Kavramlar", altKonular: ["Sayılar", "Bölünebilme", "EBOB-EKOK"] },
          { konu: "Üslü-Köklü İfadeler" },
          { konu: "Çarpanlara Ayırma-Denklemler" },
          { konu: "Problemler", altKonular: ["Sayı, Yaş, Hareket, İşçi-Havuz, Yüzde-Kar-Zarar, Karışım"] },
          { konu: "Geometri", altKonular: ["Üçgenler", "Çokgenler", "Çember-Daire", "Katı Cisimler"] },
          { konu: "İstatistik ve Olasılık" },
        ],
      },
    ],
  },
  {
    // YÖKDİL - Fen Bilimleri
    examCategory: "YOKDIL_FEN",
    subjects: [
      {
        name: "İngilizce/Almanca/Fransızca (Fen Bilimleri Metinleri)",
        konular: [
          { konu: "Dil Bilgisi (Gramer)" }, { konu: "Kelime Bilgisi" }, { konu: "Cümle Çevirisi" },
          { konu: "Paragraf Çevirisi" }, { konu: "Cloze Test" },
          { konu: "Okuduğunu Anlama (Fen/Mühendislik Metinleri)" }, { konu: "Diyalog Tamamlama" },
        ],
      },
    ],
  },
  {
    // YÖKDİL - Sosyal Bilimler
    examCategory: "YOKDIL_SOSYAL",
    subjects: [
      {
        name: "İngilizce/Almanca/Fransızca (Sosyal Bilimler Metinleri)",
        konular: [
          { konu: "Dil Bilgisi (Gramer)" }, { konu: "Kelime Bilgisi" }, { konu: "Cümle Çevirisi" },
          { konu: "Paragraf Çevirisi" }, { konu: "Cloze Test" },
          { konu: "Okuduğunu Anlama (Sosyal Bilimler Metinleri)" }, { konu: "Diyalog Tamamlama" },
        ],
      },
    ],
  },
  {
    // YÖKDİL - Sağlık Bilimleri
    examCategory: "YOKDIL_SAGLIK",
    subjects: [
      {
        name: "İngilizce/Almanca/Fransızca (Sağlık Bilimleri Metinleri)",
        konular: [
          { konu: "Dil Bilgisi (Gramer)" }, { konu: "Kelime Bilgisi" }, { konu: "Cümle Çevirisi" },
          { konu: "Paragraf Çevirisi" }, { konu: "Cloze Test" },
          { konu: "Okuduğunu Anlama (Tıp/Sağlık Metinleri)" }, { konu: "Diyalog Tamamlama" },
        ],
      },
    ],
  },
  {
    // AGS - Genel Yetenek + Eğitim Bilimleri + Genel Kültür (Alan Bilgisi branşa göre değiştiği için atlandı)
    examCategory: "AGS",
    subjects: [
      {
        name: "Sözel Yetenek",
        konular: [{ konu: "Sözcükte ve Cümlede Anlam" }, { konu: "Paragraf" }, { konu: "Sözel Mantık" }],
      },
      {
        name: "Sayısal Yetenek",
        konular: [{ konu: "Temel Matematik" }, { konu: "Problemler" }, { konu: "Sayısal Mantık" }],
      },
      {
        name: "Eğitim Bilimleri",
        konular: [
          { konu: "Gelişim Psikolojisi" }, { konu: "Öğrenme Psikolojisi" }, { konu: "Öğretim İlke ve Yöntemleri" },
          { konu: "Ölçme ve Değerlendirme" }, { konu: "Rehberlik" }, { konu: "Sınıf Yönetimi" },
        ],
      },
      {
        name: "Genel Kültür (Türkçe, Tarih, Coğrafya, Vatandaşlık)",
        konular: [
          { konu: "Türkçe" },
          { konu: "Tarih" },
          { konu: "Coğrafya" },
          { konu: "Vatandaşlık", altKonular: ["Anayasal Bilgiler", "Hukukun Temelleri"] },
          { konu: "Güncel Bilgiler" },
        ],
      },
    ],
  },
  {
    // YDS - Tek Oturum
    examCategory: "YDS",
    subjects: [
      {
        name: "İngilizce/Almanca/Fransızca/Diğer Diller",
        konular: [
          { konu: "Kelime Bilgisi" },
          { konu: "Dil Bilgisi (Gramer)", altKonular: ["Zamanlar", "Edatlar", "Bağlaçlar", "Kalıp İfadeler", "Modal Fiiller"] },
          { konu: "Cloze Test (Boşluk Doldurma)" },
          { konu: "Cümle Tamamlama" },
          { konu: "Çeviri (Cümle ve Paragraf)" },
          { konu: "Diyalog Tamamlama" },
          { konu: "Anlam Bütünlüğünü Bozan Cümle" },
          { konu: "Paragraf Tamamlama" },
          { konu: "Okuduğunu Anlama (Reading Comprehension)" },
          { konu: "Anlamca En Yakın Cümle" },
        ],
      },
    ],
  },
];

async function main() {
  for (const { educationLevel, subjects } of SEED_DATA) {
    for (const { name, topics } of subjects) {
      let subject = await prisma.subject.findFirst({
        where: { name, userId: null, educationLevel },
      });
      if (!subject) {
        subject = await prisma.subject.create({
          data: { name, educationLevel, userId: null },
        });
        console.log(`Olusturuldu: ${educationLevel} / ${name}`);
      }

      for (const topicName of topics) {
        const existingTopic = await prisma.topic.findFirst({
          where: { name: topicName, subjectId: subject.id },
        });
        if (!existingTopic) {
          await prisma.topic.create({
            data: { name: topicName, subjectId: subject.id },
          });
          console.log(`  + Konu: ${topicName}`);
        }
      }
    }
  }

  for (const { examCategory, subjects } of EXAM_CATALOG) {
    for (const { name, konular } of subjects) {
      let subject = await prisma.subject.findFirst({
        where: { name, userId: null, examCategory },
      });
      if (!subject) {
        subject = await prisma.subject.create({
          data: { name, examCategory, userId: null },
        });
        console.log(`Olusturuldu: ${examCategory} / ${name}`);
      }

      const topics = expandTopics(konular);
      for (const topicName of topics) {
        const existingTopic = await prisma.topic.findFirst({
          where: { name: topicName, subjectId: subject.id },
        });
        if (!existingTopic) {
          await prisma.topic.create({
            data: { name: topicName, subjectId: subject.id },
          });
          console.log(`  + Konu: ${topicName}`);
        }
      }
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
