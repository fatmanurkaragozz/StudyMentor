import type { PriorityLevel } from "@prisma/client";
import { prisma } from "../config/prisma.js";

// Kullanıcının kendi ifadesiyle: yüksek öncelik ~2 günde bir, orta ~4 günde bir, düşük ~haftada bir tekrar.
const REVIEW_INTERVAL_DAYS: Record<PriorityLevel, number> = {
  YUKSEK: 2,
  ORTA: 4,
  DUSUK: 7,
};

// Bu konu bir sınava bağlıysa (ExamSubject üzerinden) ve hesaplanan tekrar tarihi sınav tarihini
// geçiyorsa, sınavdan sonrasını önermenin anlamı olmadığı için tarih sınav gününe kısıtlanır.
export async function computeNextReview(topicId: string, priority: PriorityLevel): Promise<Date> {
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
