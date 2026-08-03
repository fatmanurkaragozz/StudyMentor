import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { patchMe } from "../controllers/users.controller.js";

export const usersRouter = Router();

usersRouter.patch("/users/me", requireAuth, asyncHandler(patchMe));
