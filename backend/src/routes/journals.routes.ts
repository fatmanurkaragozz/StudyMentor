import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { postJournal, getJournals } from "../controllers/journals.controller.js";

export const journalsRouter = Router();

journalsRouter.post("/journals", requireAuth, asyncHandler(postJournal));
journalsRouter.get("/journals", requireAuth, asyncHandler(getJournals));
