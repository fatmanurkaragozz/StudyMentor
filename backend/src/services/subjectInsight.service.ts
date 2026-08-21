import { GoogleGenAI } from "@google/genai";
import { Prisma } from "@prisma/client";
import type { InsightFeedback } from "@prisma/client";
import { prisma } from "../config/prisma.js";
import { config } from "../config/env.js";
import { HttpError } from "../utils/httpError.js";
import { getSubjectStatsForOne, type SubjectHistoryStats } from "./subjectHistory.service.js";

// Model burada tek bir sabit - degisirse tek satirlik bir degisiklik. Hata durumunda
// baska bir modele OTOMATIK gecis YAPILMAZ - sadece basarisizlik raporlanir, frontend
// kendi ucretsiz sablon yedegine duser (kaptan.ts).
const GEMINI_MODEL = "gemini-2.5-flash";

const SYSTEM_PROMPT =
  "Sen StudyMentor uygulamasındaki \"Kaptan\" adlı çalışma koçusun: sıcak, samimi, teşvik edici ama gerçekçi konuşan " +
  "bir mentor. Kullanıcının bir ders/uğraş için topladığı gerçek çalışma verilerini yorumlayacaksın. Türkçe, en fazla " +
  "2 kısa paragraf (toplam ~80-120 kelime), ikinci tekil şahısla (\"sen\") hitap eden, doğal ve günlük konuşma diline " +
  "yakın bir yorum yaz - abartılı benzetmeler veya zorlama metaforlar kullanma, düz ve samimi konuş. Somut sayılara " +
  "(süre, oturum sayısı, öncelik) değin; genel geçer motivasyon cümleleri kurma. Asla suçlayıcı bir dille eleştirme - " +
  "eksiklik varsa yapıcı ve nazik bir öneriyle birlikte söyle. Sadece düz metin döndür, markdown/başlık/liste kullanma.";

export interface SubjectInsightResult {
  aiAvailable: boolean;
  content: string | null;
  updatedAt: string | null;
  feedback: InsightFeedback | null;
  feedbackReason: string | null;
}

// Onceki uretimin kullanici tarafindan begenilip begenilmedigini bir sonraki
// prompt'a duzeltici bir not olarak ekler - LIKE icin uslubu koru, DISLIKE
// icin (sebep varsa onunla birlikte) farkli bir yaklasim dene talimati.
function buildFeedbackNote(feedback: InsightFeedback | null, reason: string | null): string {
  if (feedback === "DISLIKE") {
    return reason
      ? `\n\n(Not: Önceki yorumun kullanıcı tarafından beğenilmedi. Sebep: "${reason}". Bu geri bildirimi dikkate alarak farklı bir yaklaşımla yeni bir yorum yaz.)`
      : "\n\n(Not: Önceki yorumun kullanıcı tarafından beğenilmedi. Farklı bir üslup/yaklaşım dene.)";
  }
  if (feedback === "LIKE") {
    return "\n\n(Not: Önceki yorumun kullanıcı tarafından beğenildi. Benzer bir üslubu sürdürebilirsin.)";
  }
  return "";
}

function buildUserPrompt(entry: SubjectHistoryStats, isStudent: boolean): string {
  const label = isStudent ? "Ders" : "Uğraş";

  if (entry.displayMode === "TIME" && entry.time) {
    const { totalMinutes, sessionCount, avgDifficulty, avgProductivity, lastStudiedAt } = entry.time;
    return (
      `${label}: ${entry.subjectName}\n` +
      `Toplam odaklanma süresi: ${totalMinutes} dakika\n` +
      `Oturum sayısı: ${sessionCount}\n` +
      `Ortalama zorluk algısı: ${avgDifficulty.toFixed(1)}/5\n` +
      `Ortalama verimlilik algısı: ${avgProductivity.toFixed(1)}/5\n` +
      `Son çalışma tarihi: ${new Date(lastStudiedAt).toLocaleDateString("tr-TR")}\n\n` +
      `Bu verilere dayanarak kullanıcıya kısa bir yorum ve öneri yaz.`
    );
  }

  const topicLines = (entry.topics ?? [])
    .map((t) => `- ${t.topicName} (son kontrol: ${new Date(t.lastCheckedAt).toLocaleDateString("tr-TR")}, öncelik: ${t.priority ?? "bilinmiyor"})`)
    .join("\n");
  return (
    `${label}: ${entry.subjectName}\n` +
    `Bu ${label.toLowerCase()}te henüz süreli (Pomodoro) bir oturum kaydı yok, ama şu konularda mini kontrol yaptı:\n` +
    `${topicLines}\n\n` +
    `Bu verilere dayanarak kullanıcıya kısa bir yorum ve öneri yaz.`
  );
}

export async function getCachedInsights(
  userId: string,
  subjectIds: string[],
): Promise<Map<string, { content: string; updatedAt: string; feedback: InsightFeedback | null; feedbackReason: string | null }>> {
  if (subjectIds.length === 0) return new Map();
  const rows = await prisma.subjectInsight.findMany({ where: { userId, subjectId: { in: subjectIds } } });
  return new Map(
    rows.map((row) => [
      row.subjectId,
      { content: row.content, updatedAt: row.updatedAt.toISOString(), feedback: row.feedback, feedbackReason: row.feedbackReason },
    ]),
  );
}

export async function generateSubjectInsight(userId: string, subjectId: string, isStudent: boolean): Promise<SubjectInsightResult> {
  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  if (!subject) {
    throw new HttpError(404, "Ders bulunamadı");
  }
  // Global (userId null) dersler herkese acik kalmali - burada ders tanimina degil,
  // kullanicinin o dersteki kendi aktivitesine erisiliyor.
  if (subject.userId !== null && subject.userId !== userId) {
    throw new HttpError(403, "Bu derse erişimin yok");
  }

  const stats = await getSubjectStatsForOne(userId, subjectId, subject.name);
  if (!stats) {
    throw new HttpError(400, "Bu ders için henüz çalışma verisi yok");
  }

  if (!config.geminiApiKey) {
    return { aiAvailable: false, content: null, updatedAt: null, feedback: null, feedbackReason: null };
  }

  // Onceki uretime kullanici tepki vermisse (begendi/begenmedi), bir sonraki
  // uretimde Gemini'ye bunu hatirlatiyoruz - gercek bir geri bildirim donguisu.
  const previous = await prisma.subjectInsight.findUnique({ where: { userId_subjectId: { userId, subjectId } } });
  const feedbackNote = buildFeedbackNote(previous?.feedback ?? null, previous?.feedbackReason ?? null);

  try {
    const client = new GoogleGenAI({ apiKey: config.geminiApiKey });
    const response = await client.models.generateContent({
      model: GEMINI_MODEL,
      contents: buildUserPrompt(stats, isStudent) + feedbackNote,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        maxOutputTokens: 400,
        // ML cagrisindaki (mlClient.service.ts) 5s AbortController ile ayni ruh - Gemini
        // askida kalirsa "AI Yorumu Al" butonu suresiz donmesin, zaman asiminda da baska
        // bir modele gecilmez, sadece basarisizlik raporlanir.
        abortSignal: AbortSignal.timeout(15000),
      },
    });

    const text = response.text;
    if (!text) {
      // Bos yanit - guvenlik filtresi engellemis olabilir (finishReason: SAFETY) ya da
      // baska bir gecici sorun. Ikisi de ayni sekilde ele alinir.
      return { aiAvailable: false, content: null, updatedAt: null, feedback: null, feedbackReason: null };
    }

    // Yeni icerik henuz degerlendirilmedi - onceki geri bildirim eski icerik
    // hakkindaydi, o yuzden sifirlaniyor.
    const updated = await prisma.subjectInsight.upsert({
      where: { userId_subjectId: { userId, subjectId } },
      update: { content: text, feedback: null, feedbackReason: null },
      create: { userId, subjectId, content: text },
    });

    return {
      aiAvailable: true,
      content: updated.content,
      updatedAt: updated.updatedAt.toISOString(),
      feedback: updated.feedback,
      feedbackReason: updated.feedbackReason,
    };
  } catch {
    // Gecici bir hata (kota bitmesi, rate limit, ag hatasi, vb.) onceden uretilmis iyi bir
    // yorumu silmemeli - onbellege dokunulmadan basarisizlik raporlanir.
    return { aiAvailable: false, content: null, updatedAt: null, feedback: null, feedbackReason: null };
  }
}

export async function submitInsightFeedback(
  userId: string,
  subjectId: string,
  feedback: InsightFeedback,
  reason: string | undefined,
): Promise<SubjectInsightResult> {
  try {
    const updated = await prisma.subjectInsight.update({
      where: { userId_subjectId: { userId, subjectId } },
      data: { feedback, feedbackReason: reason ?? null },
    });
    return {
      aiAvailable: true,
      content: updated.content,
      updatedAt: updated.updatedAt.toISOString(),
      feedback: updated.feedback,
      feedbackReason: updated.feedbackReason,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      throw new HttpError(404, "Bu ders için henüz bir AI yorumu yok");
    }
    throw error;
  }
}
