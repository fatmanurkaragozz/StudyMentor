import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import {
  postDailyTask,
  getDailyTasks,
  postCompleteDailyTask,
  deleteDailyTaskHandler,
} from "../controllers/dailyTasks.controller.js";

export const dailyTasksRouter = Router();

dailyTasksRouter.post("/daily-tasks", requireAuth, asyncHandler(postDailyTask));
dailyTasksRouter.get("/daily-tasks", requireAuth, asyncHandler(getDailyTasks));
dailyTasksRouter.post("/daily-tasks/:id/complete", requireAuth, asyncHandler(postCompleteDailyTask));
dailyTasksRouter.delete("/daily-tasks/:id", requireAuth, asyncHandler(deleteDailyTaskHandler));
