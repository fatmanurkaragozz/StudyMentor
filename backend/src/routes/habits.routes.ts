import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { postHabit, getHabits, postToggleHabitLog } from "../controllers/habits.controller.js";

export const habitsRouter = Router();

habitsRouter.post("/habits", requireAuth, asyncHandler(postHabit));
habitsRouter.get("/habits", requireAuth, asyncHandler(getHabits));
habitsRouter.post("/habits/:id/toggle", requireAuth, asyncHandler(postToggleHabitLog));
