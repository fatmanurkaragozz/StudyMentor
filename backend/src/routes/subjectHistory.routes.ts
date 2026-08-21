import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { getSubjectHistory, postSubjectInsight, postSubjectInsightFeedback } from "../controllers/subjectHistory.controller.js";

export const subjectHistoryRouter = Router();

subjectHistoryRouter.get("/subjects/history", requireAuth, asyncHandler(getSubjectHistory));
subjectHistoryRouter.post("/subjects/:subjectId/insight", requireAuth, asyncHandler(postSubjectInsight));
subjectHistoryRouter.post("/subjects/:subjectId/insight/feedback", requireAuth, asyncHandler(postSubjectInsightFeedback));
