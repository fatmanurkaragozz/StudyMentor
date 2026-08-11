import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { postStudySession, getStudySessions } from "../controllers/studySessions.controller.js";

export const studySessionsRouter = Router();

studySessionsRouter.post("/study-sessions", requireAuth, asyncHandler(postStudySession));
studySessionsRouter.get("/study-sessions", requireAuth, asyncHandler(getStudySessions));
