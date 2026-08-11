import { prisma } from "../config/prisma.js";
import { HttpError } from "../utils/httpError.js";

export async function listTopicsForUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new HttpError(404, "Kullanıcı bulunamadı");
  }

  const subjects = await prisma.subject.findMany({
    where: {
      OR: [
        { educationLevel: user.educationLevel },
        { userId },
        // Kullanıcının eklediği bir sınavın (KPSS/YÖKDİL/ALES) kataloğundan seçtiği dersler
        { exams: { some: { exam: { userId } } } },
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
