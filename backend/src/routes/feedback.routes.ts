import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { feedbackLimiter } from "../middleware/rateLimit.js";
import { postFeedback } from "../controllers/feedback.controller.js";

export const feedbackRouter = Router();

feedbackRouter.post("/feedback", feedbackLimiter, asyncHandler(postFeedback));
