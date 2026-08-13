import type { ExamCategory } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { HttpError } from "../utils/httpError.js";

const CUSTOM_TOPIC_NAME = "Genel";

// ExamTracking (exams.service.ts) bir sinava ders eklerken bu derslerin gercekten
// var olup olmadigini kontrol etmek icin cagirir - yetki kontrolu (kimin
// kullanabilecegi) ExamTracking'in kendi isi, burada sadece ham veri donuyor.
export async function getSubjectsByIds(subjectIds: string[]) {
  return prisma.subject.findMany({ where: { id: { in: subjectIds } } });
}

// Merkezi sinav kataloguna (KPSS/YOKDIL/ALES vb.) ait ders/konu listesini dondurur.
// Exam tablosuna hic dokunmuyor - kavramsal olarak ExamTracking'in degil,
// Curriculum'un (biz) is'i, o yuzden burada yasiyor.
export async function getExamCatalog(category: ExamCategory) {
  const subjects = await prisma.subject.findMany({
    where: { examCategory: category },
    include: { topics: true },
    orderBy: { name: "asc" },
  });

  return subjects.map((subject) => ({
    subjectId: subject.id,
    subjectName: subject.name,
    topics: subject.topics.map((topic) => ({ id: topic.id, name: topic.name })),
  }));
}

export async function createOrGetCustomSubject(userId: string, name: string) {
  const subject = await prisma.subject.upsert({
    where: { name_userId: { name, userId } },
    update: {},
    create: { name, userId, educationLevel: null },
  });

  let topic = await prisma.topic.findFirst({
    where: { subjectId: subject.id, name: CUSTOM_TOPIC_NAME },
  });
  if (!topic) {
    topic = await prisma.topic.create({
      data: { subjectId: subject.id, name: CUSTOM_TOPIC_NAME },
    });
  }

  return { subjectId: subject.id, topicId: topic.id };
}

export async function listMySubjects(userId: string) {
  const subjects = await prisma.subject.findMany({
    where: { userId },
    include: { topics: true },
    orderBy: { name: "asc" },
  });

  return subjects.map((subject) => ({
    subjectId: subject.id,
    subjectName: subject.name,
    topics: subject.topics
      .filter((topic) => topic.name !== CUSTOM_TOPIC_NAME)
      .map((topic) => ({ id: topic.id, name: topic.name })),
  }));
}

export async function addTopicToSubject(userId: string, subjectId: string, name: string) {
  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!subject || subject.userId !== userId) {
    throw new HttpError(403, "Bu derse erişimin yok");
  }

  const topic = await prisma.topic.create({ data: { subjectId, name } });
  return { topicId: topic.id, topicName: topic.name };
}

export async function deleteSubject(userId: string, subjectId: string) {
  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  // Sadece kullanıcının kendi eklediği ders/uğraş silinebilir - genel müfredat/sınav kataloğu dersleri korunur.
  if (!subject || subject.userId !== userId) {
    throw new HttpError(403, "Bu derse erişimin yok");
  }
  await prisma.subject.delete({ where: { id: subjectId } });
}
