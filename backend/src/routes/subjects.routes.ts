import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { postCustomSubject, getMySubjects, postSubjectTopic } from "../controllers/subjects.controller.js";

export const subjectsRouter = Router();

subjectsRouter.post("/subjects/custom", requireAuth, asyncHandler(postCustomSubject));
subjectsRouter.get("/subjects/mine", requireAuth, asyncHandler(getMySubjects));
subjectsRouter.post("/subjects/:subjectId/topics", requireAuth, asyncHandler(postSubjectTopic));
