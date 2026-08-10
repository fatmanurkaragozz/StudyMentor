import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authLimiter, emailCodeLimiter } from "../middleware/rateLimit.js";
import {
  login,
  register,
  postVerifyEmail,
  postResendVerification,
  postForgotPassword,
  postResetPassword,
} from "../controllers/auth.controller.js";

export const authRouter = Router();

authRouter.post("/auth/register", authLimiter, asyncHandler(register));
authRouter.post("/auth/login", authLimiter, asyncHandler(login));
authRouter.post("/auth/verify-email", authLimiter, asyncHandler(postVerifyEmail));
authRouter.post("/auth/resend-verification", emailCodeLimiter, asyncHandler(postResendVerification));
authRouter.post("/auth/forgot-password", emailCodeLimiter, asyncHandler(postForgotPassword));
authRouter.post("/auth/reset-password", authLimiter, asyncHandler(postResetPassword));
