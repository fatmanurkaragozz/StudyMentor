import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  login,
  register,
  postVerifyEmail,
  postResendVerification,
  postForgotPassword,
  postResetPassword,
} from "../controllers/auth.controller.js";

export const authRouter = Router();

authRouter.post("/auth/register", asyncHandler(register));
authRouter.post("/auth/login", asyncHandler(login));
authRouter.post("/auth/verify-email", asyncHandler(postVerifyEmail));
authRouter.post("/auth/resend-verification", asyncHandler(postResendVerification));
authRouter.post("/auth/forgot-password", asyncHandler(postForgotPassword));
authRouter.post("/auth/reset-password", asyncHandler(postResetPassword));
