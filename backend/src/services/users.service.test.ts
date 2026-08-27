import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockDeep, mockReset, type DeepMockProxy } from "vitest-mock-extended";
import type { PrismaClient, User } from "@prisma/client";
import { updateProfile } from "./users.service.js";
import { sendVerificationEmail } from "./mailer.service.js";
import { prisma } from "../config/prisma.js";

// vi.mock cagrilari Vitest tarafindan dosyanin en ustune hoist edilir - factory
// gec (modul ilk import edildiginde) calistigi icin mockDeep'i burada dogrudan
// cagirmak (vi.hoisted'in aksine) guvenli.
vi.mock("../config/prisma.js", () => ({ prisma: mockDeep<PrismaClient>() }));
vi.mock("./mailer.service.js", () => ({
  sendVerificationEmail: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
}));

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

beforeEach(() => {
  vi.clearAllMocks();
  mockReset(prismaMock);
});

const baseUser: User = {
  id: "u1",
  email: "eski@test.com",
  passwordHash: "hash",
  firstName: "Eski",
  lastName: "Isim",
  role: "STUDENT",
  educationLevel: "HIGH_SCHOOL",
  grade: 10,
  examCategory: null,
  createdAt: new Date("2026-01-01"),
  updatedAt: new Date("2026-01-01"),
  emailVerified: true,
  emailVerificationCode: null,
  emailVerificationExpiresAt: null,
  passwordResetCode: null,
  passwordResetExpiresAt: null,
};

describe("updateProfile", () => {
  it("e-posta degisince emailVerified false'a ceker, kod gonderir ve hassas alanlari sizdirmaz", async () => {
    prismaMock.user.findUnique.mockResolvedValue(baseUser);
    prismaMock.user.update.mockImplementation(({ data }) =>
      Promise.resolve({ ...baseUser, ...(data as Partial<User>) } as User),
    );

    const result = await updateProfile("u1", { email: "yeni@test.com" });

    expect(result.email).toBe("yeni@test.com");
    expect(result.emailVerified).toBe(false);
    expect(result).not.toHaveProperty("passwordHash");
    expect(result).not.toHaveProperty("emailVerificationCode");
    expect(sendVerificationEmail).toHaveBeenCalledWith("yeni@test.com", expect.any(String));
  });

  it("ayni e-postaya 'degistirilirse' dogrulama kodu gonderilmez", async () => {
    prismaMock.user.findUnique.mockResolvedValue(baseUser);
    prismaMock.user.update.mockResolvedValue(baseUser);

    await updateProfile("u1", { email: baseUser.email });

    expect(sendVerificationEmail).not.toHaveBeenCalled();
  });

  it("gecersiz egitim seviyesi/sinif kombinasyonunda hata firlatir ve DB'ye yazmaz", async () => {
    prismaMock.user.findUnique.mockResolvedValue(baseUser);

    await expect(updateProfile("u1", { educationLevel: "LIFELONG_LEARNER" })).rejects.toThrow(
      "Geçersiz sınıf/yıl değeri",
    );
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("kullanici bulunamazsa 404 hatasi firlatir", async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(updateProfile("bilinmeyen", { firstName: "X" })).rejects.toThrow("Kullanıcı bulunamadı");
  });
});
