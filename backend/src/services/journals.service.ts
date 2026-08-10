import { prisma } from "../config/prisma.js";

// AppContext.tsx'teki mock addJournalEntry ile ayni basit kelime-sayma mantigi -
// yeni bir NLP/AI servisi eklenmiyor, sadece hesaplama tek dogru yere (backend) tasiniyor.
const POSITIVE_WORDS = ["harika", "iyi", "başarılı", "yüksek", "verimli", "sevindim", "güzel"];

function computeSentimentScore(content: string): number {
  const lower = content.toLowerCase();
  let score = 0.2;
  for (const word of POSITIVE_WORDS) {
    if (lower.includes(word)) score += 0.25;
  }
  return Number(Math.min(1, Math.max(-1, score)).toFixed(2));
}

export async function createJournal(userId: string, input: { content: string; mood: string }) {
  const sentimentScore = computeSentimentScore(input.content);
  return prisma.journal.create({
    data: { userId, content: input.content, mood: input.mood, sentimentScore },
  });
}

export async function listJournals(userId: string) {
  return prisma.journal.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
}
