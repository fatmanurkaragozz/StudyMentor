import type { PriorityLevel, UserMode } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { HttpError } from "../utils/httpError.js";

const CUSTOM_TOPIC_PLACEHOLDER = "Genel";

// Kullanıcıya özel "uğraş" kayıtlarında Topic her zaman "Genel" adıyla otomatik
// oluşturulur (bkz. subjects.service.ts) - bu durumda kullanıcıya konu adı yerine
// asıl anlamlı olan ders/uğraş adını göstermek gerekir.
export function getDisplayTopicLabel(topic: { name: string }, subject: { name: string }): string {
  return topic.name === CUSTOM_TOPIC_PLACEHOLDER ? subject.name : topic.name;
}

// Kullanıcının kendi ifadesiyle: yüksek öncelik ~2 günde bir, orta ~4 günde bir, düşük ~haftada bir tekrar.
// Export edilmiş durumda - topicReminders.service.ts da ayni "öncelik -> gün" eşlemesini
// kullansın diye (tek doğruluk kaynağı, iki yerde tekrar edilmesin).
export const REVIEW_INTERVAL_DAYS: Record<PriorityLevel, number> = {
  YUKSEK: 2,
  ORTA: 4,
  DUSUK: 7,
};

// Bu konu bir sınava bağlıysa (ExamSubject üzerinden) ve hesaplanan tekrar tarihi sınav tarihini
// geçiyorsa, sınavdan sonrasını önermenin anlamı olmadığı için tarih sınav gününe kısıtlanır.
async function computeNextReview(topicId: string, priority: PriorityLevel): Promise<Date> {
  const intervalDays = REVIEW_INTERVAL_DAYS[priority];
  const candidate = new Date();
  candidate.setUTCDate(candidate.getUTCDate() + intervalDays);

  const examLinks = await prisma.examSubject.findMany({
    where: { subject: { topics: { some: { id: topicId } } }, exam: { date: { gte: new Date() } } },
    include: { exam: true },
  });

  const nearestExamDate = examLinks.reduce<Date | null>((earliest, link) => {
    if (!earliest || link.exam.date < earliest) return link.exam.date;
    return earliest;
  }, null);

  if (nearestExamDate && nearestExamDate < candidate) {
    return nearestExamDate;
  }
  return candidate;
}

// AICoach bir oncelik hesapladiktan sonra cagirir - bir konunun "calisildi" ve
// (varsa) bir sonraki tekrar tarihinin ne oldugu Curriculum'un sorumlulugunda.
export async function markTopicReviewed(topicId: string, priority: PriorityLevel | null): Promise<void> {
  const nextReview = priority ? await computeNextReview(topicId, priority) : undefined;
  await prisma.topic.update({
    where: { id: topicId },
    data: { lastStudied: new Date(), ...(nextReview ? { nextReview } : {}) },
  });
}

// Konuyu dersiyle birlikte getirir - baska modullerin (LearningEngine) Topic
// tablosuna dogrudan erismesi yerine bu public arayuzu kullanmasi icin.
export async function getTopicWithSubject(topicId: string) {
  return prisma.topic.findUnique({ where: { id: topicId }, include: { subject: true } });
}

// Konu var mi VE verilen derse mi ait, tek seferde dogrular - StudySession/DailyTask
// olusturmadan once ayni dogrulamayi tekrar tekrar yazmamak icin.
export async function requireTopicInSubject(topicId: string, subjectId: string) {
  const topic = await getTopicWithSubject(topicId);
  if (!topic || topic.subjectId !== subjectId) {
    throw new HttpError(400, "Geçersiz ders/konu");
  }
  return topic;
}

export async function listTopicsForUser(userId: string, mode: UserMode) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new HttpError(404, "Kullanıcı bulunamadı");
  }

  // EXAM_PREP (okul/üniversite bağı olmadan bağımsız sınav hazırlığı) kullanıcıları için küresel
  // katalog, egitim seviyesi yerine hangi sınava (KPSS/AGS/ALES vb.) hazırlandıklarına göre gelir.
  const globalCatalogFilter =
    user.educationLevel === "EXAM_PREP" && user.examCategory
      ? { examCategory: user.examCategory }
      : { educationLevel: user.educationLevel };

  // Kuresel mufredat/sinav katalogu (Subject.userId === null) kavramsal olarak hep
  // ogrenci icerigi - Gelisim modunda hic gorunmemeli, o yuzden sadece STUDENT'ta OR'a dahil.
  const subjects = await prisma.subject.findMany({
    where: {
      OR: [
        ...(mode === "STUDENT" ? [globalCatalogFilter] : []),
        { userId, mode },
        // Kullanıcının eklediği bir sınavın (KPSS/YÖKDİL/ALES) kataloğundan seçtiği dersler
        { exams: { some: { exam: { userId, mode } } } },
      ],
    },
    include: { topics: true },
    orderBy: { name: "asc" },
  });

  return subjects.map((subject) => ({
    subjectId: subject.id,
    subjectName: subject.name,
    topics: subject.topics.map((topic) => ({
      id: topic.id,
      name: topic.name,
      status: topic.status,
      lastStudied: topic.lastStudied,
      nextReview: topic.nextReview,
    })),
  }));
}
