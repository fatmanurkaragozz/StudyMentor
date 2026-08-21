import { GoogleGenAI } from "@google/genai";
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

export async function getCachedInsights(userId: string, subjectIds: string[]): Promise<Map<string, { content: string; updatedAt: string }>> {
  if (subjectIds.length === 0) return new Map();
  const rows = await prisma.subjectInsight.findMany({ where: { userId, subjectId: { in: subjectIds } } });
  return new Map(rows.map((row) => [row.subjectId, { content: row.content, updatedAt: row.updatedAt.toISOString() }]));
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
    return { aiAvailable: false, content: null, updatedAt: null };
  }

  try {
    const client = new GoogleGenAI({ apiKey: config.geminiApiKey });
    const response = await client.models.generateContent({
      model: GEMINI_MODEL,
      contents: buildUserPrompt(stats, isStudent),
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
      return { aiAvailable: false, content: null, updatedAt: null };
    }

    const updated = await prisma.subjectInsight.upsert({
      where: { userId_subjectId: { userId, subjectId } },
      update: { content: text },
      create: { userId, subjectId, content: text },
    });

    return { aiAvailable: true, content: updated.content, updatedAt: updated.updatedAt.toISOString() };
  } catch {
    // Gecici bir hata (kota bitmesi, rate limit, ag hatasi, vb.) onceden uretilmis iyi bir
    // yorumu silmemeli - onbellege dokunulmadan basarisizlik raporlanir.
    return { aiAvailable: false, content: null, updatedAt: null };
  }
}
