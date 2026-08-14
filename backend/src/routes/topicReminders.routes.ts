import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { postTopicReminder, getDueTopicReminders } from "../controllers/topicReminders.controller.js";

export const topicRemindersRouter = Router();

topicRemindersRouter.post("/topic-reminders", requireAuth, asyncHandler(postTopicReminder));
topicRemindersRouter.get("/topic-reminders/due", requireAuth, asyncHandler(getDueTopicReminders));
