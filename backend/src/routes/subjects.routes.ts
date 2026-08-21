import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import {
  postCustomSubject,
  getMySubjects,
  postSubjectTopic,
  deleteSubjectHandler,
  patchSubjectHandler,
  patchSubjectTopicHandler,
  deleteSubjectTopicHandler,
} from "../controllers/subjects.controller.js";

export const subjectsRouter = Router();

subjectsRouter.post("/subjects/custom", requireAuth, asyncHandler(postCustomSubject));
subjectsRouter.get("/subjects/mine", requireAuth, asyncHandler(getMySubjects));
subjectsRouter.post("/subjects/:subjectId/topics", requireAuth, asyncHandler(postSubjectTopic));
subjectsRouter.patch("/subjects/:subjectId/topics/:topicId", requireAuth, asyncHandler(patchSubjectTopicHandler));
subjectsRouter.delete("/subjects/:subjectId/topics/:topicId", requireAuth, asyncHandler(deleteSubjectTopicHandler));
subjectsRouter.patch("/subjects/:subjectId", requireAuth, asyncHandler(patchSubjectHandler));
subjectsRouter.delete("/subjects/:subjectId", requireAuth, asyncHandler(deleteSubjectHandler));
