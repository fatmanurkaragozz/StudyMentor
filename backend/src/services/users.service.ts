import { Prisma } from "@prisma/client";
import type { EducationLevel } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { HttpError } from "../utils/httpError.js";
import { isValidGrade } from "../utils/grade.js";
import { toPublicUser, generateCode, VERIFICATION_CODE_TTL_MS } from "./auth.service.js";
import { sendVerificationEmail } from "./mailer.service.js";

export async function getMe(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new HttpError(404, "Kullanıcı bulunamadı");
  }
  return toPublicUser(user);
}

interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  educationLevel?: EducationLevel;
  grade?: number;
}

// E-posta degisirse register akisiyla simetrik davranir: emailVerified false'a
// cekilip yeni bir dogrulama kodu gonderilir. requireAuth emailVerified'i kontrol
// etmedigi icin kullanici mevcut oturumunda kilitlenmez - sadece bir sonraki
// loginUser cagrisinda yeni e-postasini dogrulamamissa engellenir.
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

  const emailChanged = input.email !== undefined && input.email !== user.email;
  const verificationCode = emailChanged ? generateCode() : undefined;

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(input.firstName !== undefined ? { firstName: input.firstName } : {}),
        ...(input.lastName !== undefined ? { lastName: input.lastName } : {}),
        ...(emailChanged
          ? {
              email: input.email,
              emailVerified: false,
              emailVerificationCode: verificationCode,
              emailVerificationExpiresAt: new Date(Date.now() + VERIFICATION_CODE_TTL_MS),
            }
          : {}),
        educationLevel: nextEducationLevel,
        grade: nextEducationLevel === "LIFELONG_LEARNER" || nextEducationLevel === "EXAM_PREP" ? null : nextGrade,
      },
    });

    if (emailChanged && verificationCode) {
      await sendVerificationEmail(updated.email, verificationCode);
    }

    return toPublicUser(updated);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new HttpError(409, "Bu e-posta adresi zaten kayıtlı");
    }
    throw error;
  }
}
