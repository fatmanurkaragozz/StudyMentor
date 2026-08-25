import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { getRecommendations, postRecommendationFeedback } from "../controllers/recommendations.controller.js";

export const recommendationsRouter = Router();

recommendationsRouter.get("/recommendations", requireAuth, asyncHandler(getRecommendations));
recommendationsRouter.post("/recommendations/:id/feedback", requireAuth, asyncHandler(postRecommendationFeedback));
