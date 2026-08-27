import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Prisma } from "@prisma/client";
import type { EducationLevel, ExamCategory, User } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { config } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";
import { isValidGrade } from "../utils/grade.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "./mailer.service.js";

export const VERIFICATION_CODE_TTL_MS = 24 * 60 * 60 * 1000; // 24 saat
const RESET_CODE_TTL_MS = 15 * 60 * 1000; // 15 dakika
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 gun
const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 dakika

export function toPublicUser(user: User) {
  const { passwordHash: _passwordHash, emailVerificationCode: _c1, passwordResetCode: _c2, ...publicUser } = user;
  return publicUser;
}

function signAccessToken(userId: string): string {
  return jwt.sign({ sub: userId }, config.jwtSecret, { expiresIn: ACCESS_TOKEN_TTL_MS / 1000 });
}

function accessTokenExpiresAt(): string {
  return new Date(Date.now() + ACCESS_TOKEN_TTL_MS).toISOString();
}

export function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// Refresh token bir JWT degil - opak, rastgele bir deger. Yetkisi tamamen DB
// satirinin varligindan/revokedAt durumundan geliyor (her kullanimda zaten DB'ye
// gidiliyor, JWT olmasinin bir faydasi yok). sha256 ile hashleniyor (bcrypt degil -
// 384-bit rastgele deger icin bcrypt'in yavasligi gereksiz).
function generateRawRefreshToken(): string {
  return crypto.randomBytes(48).toString("base64url");
}

function hashToken(raw: string): string {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export async function createRefreshToken(userId: string): Promise<string> {
  const raw = generateRawRefreshToken();
  await prisma.refreshToken.create({
    data: { userId, tokenHash: hashToken(raw), expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS) },
  });
  return raw;
}

type RotateResult =
  | { status: "ok"; accessToken: string; accessTokenExpiresAt: string; refreshToken: string; user: ReturnType<typeof toPublicUser> }
  | { status: "reuse_detected" }
  | { status: "invalid" };

// Rotation-on-use: her refresh cagrisi eski token'i iptal edip yenisini verir. Zaten
// rotate edilmis (revokedAt dolu) bir token tekrar kullanilirsa - calinmis token
// habercisi olabilir - o kullanicinin TUM refresh token'lari iptal edilir (tam zincir
// takibi yerine kaba ama yeterli bir guvenlik onlemi).
export async function rotateRefreshToken(rawToken: string): Promise<RotateResult> {
  const tokenHash = hashToken(rawToken);
  const existing = await prisma.refreshToken.findUnique({ where: { tokenHash }, include: { user: true } });
  if (!existing || existing.expiresAt < new Date()) {
    return { status: "invalid" };
  }
  if (existing.revokedAt) {
    await revokeAllForUser(existing.userId);
    return { status: "reuse_detected" };
  }

  const newRaw = generateRawRefreshToken();
  const newRow = await prisma.refreshToken.create({
    data: { userId: existing.userId, tokenHash: hashToken(newRaw), expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS) },
  });
  await prisma.refreshToken.update({
    where: { id: existing.id },
    data: { revokedAt: new Date(), replacedByTokenId: newRow.id },
  });

  return {
    status: "ok",
    accessToken: signAccessToken(existing.userId),
    accessTokenExpiresAt: accessTokenExpiresAt(),
    refreshToken: newRaw,
    user: toPublicUser(existing.user),
  };
}

export async function revokeRefreshToken(rawToken: string): Promise<void> {
  await prisma.refreshToken.updateMany({ where: { tokenHash: hashToken(rawToken), revokedAt: null }, data: { revokedAt: new Date() } });
}

export async function revokeAllForUser(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
}

interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  educationLevel: EducationLevel;
  grade?: number;
  examCategory?: ExamCategory;
}

export async function registerUser(input: RegisterInput) {
  if (!isValidGrade(input.educationLevel, input.grade ?? null)) {
    throw new HttpError(400, "Geçersiz sınıf/yıl değeri");
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const verificationCode = generateCode();

  let user;
  try {
    user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        educationLevel: input.educationLevel,
        grade: input.educationLevel === "LIFELONG_LEARNER" || input.educationLevel === "EXAM_PREP" ? null : input.grade,
        examCategory: input.educationLevel === "EXAM_PREP" ? input.examCategory : undefined,
        emailVerificationCode: verificationCode,
        emailVerificationExpiresAt: new Date(Date.now() + VERIFICATION_CODE_TTL_MS),
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new HttpError(409, "Bu e-posta adresi zaten kayıtlı");
    }
    throw error;
  }

  await sendVerificationEmail(user.email, verificationCode);
  return {
    accessToken: signAccessToken(user.id),
    accessTokenExpiresAt: accessTokenExpiresAt(),
    refreshToken: await createRefreshToken(user.id),
    user: toPublicUser(user),
  };
}

export async function verifyEmail(input: { email: string; code: string }) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !user.emailVerificationCode || !user.emailVerificationExpiresAt) {
    throw new HttpError(400, "Geçersiz veya süresi dolmuş kod");
  }
  if (user.emailVerificationExpiresAt < new Date() || user.emailVerificationCode !== input.code) {
    throw new HttpError(400, "Geçersiz veya süresi dolmuş kod");
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, emailVerificationCode: null, emailVerificationExpiresAt: null },
  });
  return {
    accessToken: signAccessToken(updated.id),
    accessTokenExpiresAt: accessTokenExpiresAt(),
    refreshToken: await createRefreshToken(updated.id),
    user: toPublicUser(updated),
  };
}

export async function resendVerificationCode(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.emailVerified) return;

  const verificationCode = generateCode();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerificationCode: verificationCode,
      emailVerificationExpiresAt: new Date(Date.now() + VERIFICATION_CODE_TTL_MS),
    },
  });
  await sendVerificationEmail(user.email, verificationCode);
}

export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return;

  const resetCode = generateCode();
  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetCode: resetCode,
      passwordResetExpiresAt: new Date(Date.now() + RESET_CODE_TTL_MS),
    },
  });
  await sendPasswordResetEmail(user.email, resetCode);
}

export async function resetPassword(input: { email: string; code: string; newPassword: string }) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !user.passwordResetCode || !user.passwordResetExpiresAt) {
    throw new HttpError(400, "Geçersiz veya süresi dolmuş kod");
  }
  if (user.passwordResetExpiresAt < new Date() || user.passwordResetCode !== input.code) {
    throw new HttpError(400, "Geçersiz veya süresi dolmuş kod");
  }

  const passwordHash = await bcrypt.hash(input.newPassword, 10);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, passwordResetCode: null, passwordResetExpiresAt: null },
  });
  // Sifre sifirlanmadan once sizmis olabilecek eski refresh token'lar gecerliligini korumasin.
  await revokeAllForUser(user.id);
}

interface LoginInput {
  email: string;
  password: string;
}

export async function loginUser(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    throw new HttpError(401, "Geçersiz e-posta veya şifre");
  }

  const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
  if (!passwordMatches) {
    throw new HttpError(401, "Geçersiz e-posta veya şifre");
  }

  if (!user.emailVerified) {
    throw new HttpError(403, "E-posta adresini doğrulaman gerekiyor");
  }

  return {
    accessToken: signAccessToken(user.id),
    accessTokenExpiresAt: accessTokenExpiresAt(),
    refreshToken: await createRefreshToken(user.id),
    user: toPublicUser(user),
  };
}
