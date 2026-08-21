import type { EducationLevel } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { HttpError } from "../utils/httpError.js";
import { isValidGrade } from "../utils/grade.js";
import { toPublicUser } from "./auth.service.js";

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new HttpError(404, "Kullanıcı bulunamadı");
  }
  return toPublicUser(user);
}

interface UpdateProfileInput {
  educationLevel?: EducationLevel;
  grade?: number;
}

export async function updateProfile(userId: string, input: UpdateProfileInput) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new HttpError(404, "Kullanıcı bulunamadı");
  }

  const nextEducationLevel = input.educationLevel ?? user.educationLevel;
  const nextGrade = input.grade !== undefined ? input.grade : user.grade;

  if (!isValidGrade(nextEducationLevel, nextGrade)) {
    throw new HttpError(400, "Geçersiz sınıf/yıl değeri");
  }

  const { passwordHash: _passwordHash, ...updated } = await prisma.user.update({
    where: { id: userId },
    data: {
      educationLevel: nextEducationLevel,
      grade: nextEducationLevel === "LIFELONG_LEARNER" || nextEducationLevel === "EXAM_PREP" ? null : nextGrade,
    },
  });
  return updated;
}
