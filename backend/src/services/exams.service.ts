import { prisma } from "../config/prisma.js";
import { HttpError } from "../utils/httpError.js";

interface CreateExamInput {
  name: string;
  date: string;
  targetScore?: number;
  subjectIds: string[];
}

export async function createExam(userId: string, input: CreateExamInput) {
  const subjects = await prisma.subject.findMany({ where: { id: { in: input.subjectIds } } });
  const ownsAll = subjects.length === input.subjectIds.length && subjects.every((s) => s.userId === userId);
  if (!ownsAll) {
    throw new HttpError(403, "Seçilen derslerden birine erişimin yok");
  }

  const exam = await prisma.exam.create({
    data: {
      userId,
      name: input.name,
      date: new Date(input.date),
      targetScore: input.targetScore,
      subjects: {
        create: input.subjectIds.map((subjectId) => ({ subjectId })),
      },
    },
  });

  return { id: exam.id };
}

export async function listExams(userId: string) {
  const exams = await prisma.exam.findMany({
    where: { userId },
    include: { subjects: { include: { subject: true } } },
    orderBy: { date: "asc" },
  });

  return exams.map((exam) => ({
    id: exam.id,
    name: exam.name,
    date: exam.date,
    targetScore: exam.targetScore,
    resultScore: exam.resultScore,
    subjects: exam.subjects.map((es) => es.subject.name),
  }));
}
