import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { postScheduleSlot, getSchedule } from "../controllers/schedule.controller.js";

export const scheduleRouter = Router();

scheduleRouter.post("/schedule", requireAuth, asyncHandler(postScheduleSlot));
scheduleRouter.get("/schedule", requireAuth, asyncHandler(getSchedule));
