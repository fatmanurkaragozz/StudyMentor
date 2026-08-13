import type { ExamCategory } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { HttpError } from "../utils/httpError.js";
import { getSubjectsByIds } from "./subjects.service.js";

interface CreateExamInput {
  name: string;
  date: string;
  targetScore?: number;
  subjectIds: string[];
  examCategory?: ExamCategory;
}

export async function createExam(userId: string, input: CreateExamInput) {
  const subjects = await getSubjectsByIds(input.subjectIds);
  // Kullanıcının kendi eklediği dersler VEYA merkezi sınav kataloğuna (KPSS/YÖKDİL/ALES) ait genel dersler kullanılabilir.
  const usableByAll =
    subjects.length === input.subjectIds.length && subjects.every((s) => s.userId === userId || s.examCategory != null);
  if (!usableByAll) {
    throw new HttpError(403, "Seçilen derslerden birine erişimin yok");
  }

  const exam = await prisma.exam.create({
    data: {
      userId,
      name: input.name,
      date: new Date(input.date),
      targetScore: input.targetScore,
      examCategory: input.examCategory,
      subjects: {
        create: input.subjectIds.map((subjectId) => ({ subjectId })),
      },
    },
  });

  return { id: exam.id };
}

interface UpdateExamInput {
  name?: string;
  date?: string;
  targetScore?: number | null;
  resultScore?: number | null;
  subjectIds?: string[];
  examCategory?: ExamCategory;
}

export async function updateExam(userId: string, examId: string, input: UpdateExamInput) {
  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam || exam.userId !== userId) {
    throw new HttpError(403, "Bu sınava erişimin yok");
  }

  if (input.subjectIds) {
    const subjects = await getSubjectsByIds(input.subjectIds);
    const usableByAll =
      subjects.length === input.subjectIds.length && subjects.every((s) => s.userId === userId || s.examCategory != null);
    if (!usableByAll) {
      throw new HttpError(403, "Seçilen derslerden birine erişimin yok");
    }
    await prisma.examSubject.deleteMany({ where: { examId } });
  }

  await prisma.exam.update({
    where: { id: examId },
    data: {
      name: input.name,
      date: input.date ? new Date(input.date) : undefined,
      targetScore: input.targetScore,
      resultScore: input.resultScore,
      examCategory: input.examCategory,
      ...(input.subjectIds ? { subjects: { create: input.subjectIds.map((subjectId) => ({ subjectId })) } } : {}),
    },
  });
}

export async function deleteExam(userId: string, examId: string) {
  const exam = await prisma.exam.findUnique({ where: { id: examId } });
  if (!exam || exam.userId !== userId) {
    throw new HttpError(403, "Bu sınava erişimin yok");
  }
  await prisma.exam.delete({ where: { id: examId } });
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
    examCategory: exam.examCategory,
    subjects: exam.subjects.map((es) => ({ id: es.subject.id, name: es.subject.name })),
  }));
}
