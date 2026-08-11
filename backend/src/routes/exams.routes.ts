import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { postExam, getExams, getExamCatalogHandler, patchExam, deleteExamHandler } from "../controllers/exams.controller.js";

export const examsRouter = Router();

examsRouter.post("/exams", requireAuth, asyncHandler(postExam));
examsRouter.get("/exams", requireAuth, asyncHandler(getExams));
examsRouter.get("/exams/catalog/:category", requireAuth, asyncHandler(getExamCatalogHandler));
examsRouter.patch("/exams/:id", requireAuth, asyncHandler(patchExam));
examsRouter.delete("/exams/:id", requireAuth, asyncHandler(deleteExamHandler));
