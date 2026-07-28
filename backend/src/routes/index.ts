import { Router } from "express";
import { healthRouter } from "./health.routes.js";

export const router = Router();

router.use(healthRouter);
