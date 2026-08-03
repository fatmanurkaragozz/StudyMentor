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
} from "../services/auth.service.js";

export async function register(req: Request, res: Response) {
  const input = registerSchema.parse(req.body);
  const result = await registerUser(input);
  res.status(201).json(result);
}

export async function login(req: Request, res: Response) {
  const input = loginSchema.parse(req.body);
  const result = await loginUser(input);
  res.json(result);
}

export async function postVerifyEmail(req: Request, res: Response) {
  const input = verifyEmailSchema.parse(req.body);
  const result = await verifyEmail(input);
  res.json(result);
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
