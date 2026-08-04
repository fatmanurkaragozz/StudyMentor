import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { postStartCheck, postSubmitCheck } from "../controllers/topicChecks.controller.js";

export const topicChecksRouter = Router();

topicChecksRouter.post("/topic-checks/start", requireAuth, asyncHandler(postStartCheck));
topicChecksRouter.post("/topic-checks/:id/submit", requireAuth, asyncHandler(postSubmitCheck));
