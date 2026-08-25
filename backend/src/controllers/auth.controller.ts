import type { Request, Response } from "express";
import {
  loginSchema,
  registerSchema,
  verifyEmailSchema,
  resendVerificationSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../validation/schemas.js";
import {
  loginUser,
  registerUser,
  verifyEmail,
  resendVerificationCode,
  forgotPassword,
  resetPassword,
  rotateRefreshToken,
  revokeRefreshToken,
} from "../services/auth.service.js";
import { config } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";

const REFRESH_COOKIE_NAME = "refresh_token";
const REFRESH_COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 gun

// path: "/api/auth" - bu cookie sadece auth uclarina gonderilsin, her API cagrisina degil.
function setRefreshCookie(res: Response, rawToken: string) {
  res.cookie(REFRESH_COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: "lax",
    path: "/api/auth",
    maxAge: REFRESH_COOKIE_MAX_AGE_MS,
  });
}

function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: "/api/auth" });
}

export async function register(req: Request, res: Response) {
  const input = registerSchema.parse(req.body);
  const { refreshToken, ...body } = await registerUser(input);
  setRefreshCookie(res, refreshToken);
  res.status(201).json(body);
}

export async function login(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);
  const { refreshToken, ...body } = await loginUser(input);
  setRefreshCookie(res, refreshToken);
  res.json(body);
}

export async function postVerifyEmail(req: Request, res: Response) {
  const input = verifyEmailSchema.parse(req.body);
  const { refreshToken, ...body } = await verifyEmail(input);
  setRefreshCookie(res, refreshToken);
  res.json(body);
}

export async function postResendVerification(req: Request, res: Response) {
  const input = resendVerificationSchema.parse(req.body);
  await resendVerificationCode(input.email);
  res.json({ message: "Doğrulama kodu gönderildi (e-postan kayıtlıysa)." });
}

export async function postForgotPassword(req: Request, res: Response) {
  const input = forgotPasswordSchema.parse(req.body);
  await forgotPassword(input.email);
  res.json({ message: "Sıfırlama kodu gönderildi (e-postan kayıtlıysa)." });
}

export async function postResetPassword(req: Request, res: Response) {
  const input = resetPasswordSchema.parse(req.body);
  await resetPassword(input);
  res.json({ message: "Şifren güncellendi." });
}

export async function postRefresh(req: Request, res: Response) {
  const rawToken = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
  if (!rawToken) {
    throw new HttpError(401, "Oturum bulunamadı", "TOKEN_MISSING");
  }

  const result = await rotateRefreshToken(rawToken);
  if (result.status !== "ok") {
    clearRefreshCookie(res);
    throw new HttpError(401, "Oturum geçersiz, tekrar giriş yapmalısın", "TOKEN_INVALID");
  }

  setRefreshCookie(res, result.refreshToken);
  res.json({ accessToken: result.accessToken, accessTokenExpiresAt: result.accessTokenExpiresAt, user: result.user });
}

export async function postLogout(req: Request, res: Response) {
  const rawToken = req.cookies?.[REFRESH_COOKIE_NAME] as string | undefined;
  if (rawToken) {
    await revokeRefreshToken(rawToken);
  }
  clearRefreshCookie(res);
  res.json({ message: "Çıkış yapıldı" });
}
