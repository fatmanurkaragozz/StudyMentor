import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { getTopics } from "../controllers/topics.controller.js";

export const topicsRouter = Router();

topicsRouter.get("/topics", requireAuth, asyncHandler(getTopics));
