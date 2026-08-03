import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { prisma } from "../config/prisma.js";

export const recommendationsRouter = Router();

recommendationsRouter.get(
  "/recommendations",
  requireAuth,
  asyncHandler(async (req, res) => {
    const recommendations = await prisma.aIRecommendation.findMany({
      where: { userId: req.userId as string },
      include: { topic: { include: { subject: true } } },
      orderBy: { createdAt: "desc" },
    });

    res.json(
      recommendations.map(({ topic, ...rec }) => ({
        ...rec,
        topicName: topic?.name ?? null,
        subjectName: topic?.subject.name ?? null,
      })),
    );
  }),
);
