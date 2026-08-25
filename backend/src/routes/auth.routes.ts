import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { authLimiter, emailCodeLimiter, refreshLimiter } from "../middleware/rateLimit.js";
import {
  login,
  register,
  postVerifyEmail,
  postResendVerification,
  postForgotPassword,
  postResetPassword,
  postRefresh,
  postLogout,
} from "../controllers/auth.controller.js";

export const authRouter = Router();

authRouter.post("/auth/register", authLimiter, asyncHandler(register));
authRouter.post("/auth/login", authLimiter, asyncHandler(login));
authRouter.post("/auth/verify-email", authLimiter, asyncHandler(postVerifyEmail));
authRouter.post("/auth/resend-verification", emailCodeLimiter, asyncHandler(postResendVerification));
authRouter.post("/auth/forgot-password", emailCodeLimiter, asyncHandler(postForgotPassword));
authRouter.post("/auth/reset-password", authLimiter, asyncHandler(postResetPassword));
authRouter.post("/auth/refresh", refreshLimiter, asyncHandler(postRefresh));
authRouter.post("/auth/logout", asyncHandler(postLogout));
