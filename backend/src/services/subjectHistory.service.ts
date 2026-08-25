import type { PriorityLevel, UserMode } from "@prisma/client";
import { prisma } from "../config/prisma.js";

export interface SubjectHistoryStats {
  subjectId: string;
  subjectName: string;
  displayMode: "TIME" | "TOPICS";
  time: { totalMinutes: number; sessionCount: number; avgDifficulty: number; avgProductivity: number; lastStudiedAt: string } | null;
  topics: { topicId: string; topicName: string; lastCheckedAt: string; priority: PriorityLevel | null }[] | null;
}

// Bir dersin/ugrasin bu kullanicinin gecmisinde gorunup gorunmeyecegini belirler:
// (a) hic userId'si olmayan (global/mufredat) dersler kavramsal olarak hep ogrenci icerigi -
//     sadece STUDENT modunda gorunur, Gelisim'de hic gorunmez,
// (b) kullaniciya ozel dersler sadece dogru modda (mode) eklenmisse.
export function isVisibleInMode(subject: { userId: string | null; mode: UserMode | null }, mode: UserMode): boolean {
  if (subject.userId === null) return mode === "STUDENT";
  return subject.mode === mode;
}

async function buildStatsForSubjectIds(
  userId: string,
  mode: UserMode | null,
  onlySubjectId?: string,
  knownSubjectName?: string,
): Promise<SubjectHistoryStats[]> {
  const timeStats = await prisma.studySession.groupBy({
    by: ["subjectId"],
    where: { userId, ...(onlySubjectId ? { subjectId: onlySubjectId } : {}) },
    _sum: { durationMinutes: true },
    _count: { _all: true },
    _avg: { difficulty: true, productivity: true },
    _max: { createdAt: true },
  });
  const timeSubjectIds = timeStats.map((row) => row.subjectId);

  // Suresi (StudySession) hic olmayan dersler icin, mini-kontrol (TopicCheck) uzerinden
  // "hangi konular calisildi" yedek gorunumu.
  const checkedTopics = await prisma.topicCheck.findMany({
    where: {
      userId,
      topic: {
        subjectId: onlySubjectId ? onlySubjectId : { notIn: timeSubjectIds },
      },
    },
    include: { topic: { select: { id: true, name: true, subjectId: true } } },
    orderBy: [{ submittedAt: { sort: "desc", nulls: "last" } }, { startedAt: "desc" }],
  });

  const topicsBySubject = new Map<string, { topicId: string; topicName: string; lastCheckedAt: string; priority: PriorityLevel | null }[]>();
  const seenTopicIds = new Set<string>();
  for (const check of checkedTopics) {
    if (seenTopicIds.has(check.topic.id)) continue;
    seenTopicIds.add(check.topic.id);
    const list = topicsBySubject.get(check.topic.subjectId) ?? [];
    list.push({
      topicId: check.topic.id,
      topicName: check.topic.name,
      lastCheckedAt: (check.submittedAt ?? check.startedAt).toISOString(),
      priority: check.priority,
    });
    topicsBySubject.set(check.topic.subjectId, list);
  }

  const allCandidateIds = Array.from(new Set([...timeSubjectIds, ...topicsBySubject.keys()]));
  if (allCandidateIds.length === 0) return [];

  // Tek-ders sorgusunda (getSubjectStatsForOne) cagiran taraf zaten Subject'i kendi
  // sahiplik kontrolu icin cekmis oluyor (bkz. subjectInsight.service.ts) - ismi burada
  // tekrar sorgulamak yerine dogrudan aliyoruz, gereksiz bir DB round-trip'i onluyor.
  let subjectById: Map<string, { name: string; userId: string | null; mode: UserMode | null }>;
  if (onlySubjectId && knownSubjectName !== undefined) {
    subjectById = new Map([[onlySubjectId, { name: knownSubjectName, userId: null, mode: null }]]);
  } else {
    const subjects = await prisma.subject.findMany({ where: { id: { in: allCandidateIds } } });
    subjectById = new Map(subjects.map((s) => [s.id, s]));
  }

  const entries: SubjectHistoryStats[] = [];
  for (const subjectId of allCandidateIds) {
    const subject = subjectById.get(subjectId);
    if (!subject) continue;
    if (mode !== null && !isVisibleInMode(subject, mode)) continue;

    const timeRow = timeStats.find((row) => row.subjectId === subjectId);
    if (timeRow && timeRow._sum.durationMinutes !== null) {
      entries.push({
        subjectId,
        subjectName: subject.name,
        displayMode: "TIME",
        time: {
          totalMinutes: timeRow._sum.durationMinutes,
          sessionCount: timeRow._count._all,
          avgDifficulty: timeRow._avg.difficulty ?? 0,
          avgProductivity: timeRow._avg.productivity ?? 0,
          lastStudiedAt: (timeRow._max.createdAt as Date).toISOString(),
        },
        topics: null,
      });
    } else {
      entries.push({
        subjectId,
        subjectName: subject.name,
        displayMode: "TOPICS",
        time: null,
        topics: topicsBySubject.get(subjectId) ?? [],
      });
    }
  }

  return entries.sort((a, b) => a.subjectName.localeCompare(b.subjectName, "tr"));
}

export async function getSubjectStatsList(userId: string, mode: UserMode): Promise<SubjectHistoryStats[]> {
  return buildStatsForSubjectIds(userId, mode);
}

export async function getSubjectStatsForOne(userId: string, subjectId: string, knownSubjectName?: string): Promise<SubjectHistoryStats | null> {
  const [entry] = await buildStatsForSubjectIds(userId, null, subjectId, knownSubjectName);
  return entry ?? null;
}
