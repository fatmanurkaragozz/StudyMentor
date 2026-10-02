import type { PriorityLevel, Prisma, UserMode } from "@prisma/client";
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

// Bu konu kullanicinin KENDI bir sinavina bagliysa (ExamSubject uzerinden) ve hesaplanan tekrar tarihi
// sinav tarihini geciyorsa, sinavdan sonrasini onermenin anlami olmadigi icin tarih sinav gunune kisitlanir.
async function computeNextReview(userId: string, topicId: string, priority: PriorityLevel): Promise<Date> {
  const intervalDays = REVIEW_INTERVAL_DAYS[priority];
  const candidate = new Date();
  candidate.setUTCDate(candidate.getUTCDate() + intervalDays);

  const examLinks = await prisma.examSubject.findMany({
    where: { subject: { topics: { some: { id: topicId } } }, exam: { userId, date: { gte: new Date() } } },
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
// (varsa) bir sonraki tekrar tarihinin ne oldugu Curriculum'un sorumlulugunda. Ilerleme kullanici
// basina tutuluyor: katalog konulari paylasildigi icin Topic satirina yazmak herkesi etkilerdi.
export async function markTopicReviewed(userId: string, topicId: string, priority: PriorityLevel | null): Promise<void> {
  const nextReview = priority ? await computeNextReview(userId, topicId, priority) : undefined;
  const lastStudied = new Date();
  await prisma.userTopicProgress.upsert({
    where: { userId_topicId: { userId, topicId } },
    create: { userId, topicId, lastStudied, nextReview: nextReview ?? null },
    // Oncelik yoksa (ML kapali) onceki tekrar tarihi korunur.
    update: { lastStudied, ...(nextReview ? { nextReview } : {}) },
  });
}

export async function getTopicProgress(userId: string, topicId: string) {
  return prisma.userTopicProgress.findUnique({ where: { userId_topicId: { userId, topicId } } });
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

// Kullanicinin verilen moddaki "ders listesi" - Calisma & Odak/Dashboard'un ders listesi
// (listTopicsForUser) ile tekrar hatirlatmalari (listDueReminders) ayni kurali kullansin diye tek yerde.
export async function studyListSubjectWhere(userId: string, mode: UserMode): Promise<Prisma.SubjectWhereInput> {
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
  return {
    OR: [
      ...(mode === "STUDENT" ? [globalCatalogFilter] : []),
      { userId, mode },
      // Kullanıcının eklediği bir sınavın (KPSS/YÖKDİL/ALES) kataloğundan seçtiği dersler
      { exams: { some: { exam: { userId, mode } } } },
    ],
  };
}

export async function listTopicsForUser(userId: string, mode: UserMode) {
  const subjects = await prisma.subject.findMany({
    where: await studyListSubjectWhere(userId, mode),
    include: { topics: { include: { progress: { where: { userId } } } } },
    orderBy: { name: "asc" },
  });

  return subjects.map((subject) => ({
    subjectId: subject.id,
    subjectName: subject.name,
    topics: subject.topics.map((topic) => ({
      id: topic.id,
      name: topic.name,
      lastStudied: topic.progress[0]?.lastStudied ?? null,
      nextReview: topic.progress[0]?.nextReview ?? null,
    })),
  }));
}
