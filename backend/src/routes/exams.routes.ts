import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { postExam, getExams } from "../controllers/exams.controller.js";

export const examsRouter = Router();

examsRouter.post("/exams", requireAuth, asyncHandler(postExam));
examsRouter.get("/exams", requireAuth, asyncHandler(getExams));
