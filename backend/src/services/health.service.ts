import { prisma } from "../config/prisma.js";

export async function checkDatabaseConnection() {
  await prisma.$queryRaw`SELECT 1`;
}
