import type { EducationLevel, UserProfile, UserMode } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";

// Erisim tokeni artik localStorage'da degil, sadece bellekte tutuluyor (XSS'e karsi
// localStorage'dan daha guvenli) - kalicilik httpOnly refresh cookie'sinden geliyor,
// her sayfa yuklemesinde AuthContext bir kez /auth/refresh cagirip bunu yeniden kurar.
let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

interface AuthEventHandlers {
  // Arka planda sessiz refresh denemesi de basarisiz olunca (refresh cookie de
  // gecersiz/eksik) cagrilir - AuthContext bunu "oturum bitti" olarak isler.
  onExpired: () => void;
}
let authEventHandlers: AuthEventHandlers | null = null;

export function setAuthEventHandlers(handlers: AuthEventHandlers): void {
  authEventHandlers = handlers;
}

interface RefreshResult {
  accessToken: string;
  accessTokenExpiresAt: string;
  user: BackendUser;
}

// Ayni anda birden fazla cagiran (Dashboard'un birkac eszamanli GET'i AMA ayrica
// AuthContext'in bootstrap effect'i - React StrictMode dev modunda mount effect'lerini
// bilerek iki kez calistirdigi icin bu da iki kez tetiklenebiliyor) hepsi ayni tek
// refresh cagrisini paylassin - dedup olmadan her biri tek-kullanimlik refresh
// token'i ayri ayri rotate etmeye calisir, bu da backend'deki reuse-detection'i
// yanlislikla tetikleyip oturumu dusurur.
let refreshInFlight: Promise<RefreshResult | null> | null = null;

async function refreshSession(): Promise<RefreshResult | null> {
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const res = await fetch(`${BASE_URL}/auth/refresh`, { method: "POST", credentials: "include" });
        if (!res.ok) return null;
        const body = (await res.json()) as RefreshResult;
        setAccessToken(body.accessToken);
        return body;
      } catch {
        return null;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

async function request<T>(path: string, options: RequestInit = {}, isRetry = false): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...options.headers,
    },
  });

  // /auth/* uclarindan gelen bir 401 "yanlis sifre/kod" gibi normal bir hata - oturum
  // suresi dolmasiyla ilgisi yok, refresh denenmemeli.
  if (response.status === 401 && !isRetry && !path.startsWith("/auth/")) {
    const refreshed = await refreshSession();
    if (refreshed) {
      return request<T>(path, options, true);
    }
    setAccessToken(null);
    authEventHandlers?.onExpired();
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(response.status, body.error ?? `İstek başarısız oldu (${response.status})`, body.code);
  }

  return response.json() as Promise<T>;
}

export interface BackendUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'STUDENT' | 'ADMIN';
  educationLevel: EducationLevel;
  grade: number | null;
  examCategory: ExamCategory | null;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthResponse {
  accessToken: string;
  accessTokenExpiresAt: string;
  user: BackendUser;
}

const TARGET_GOALS: Record<EducationLevel, string> = {
  MIDDLE_SCHOOL: 'LGS Hazırlık',
  HIGH_SCHOOL: 'YKS Hazırlık',
  UNIVERSITY: 'Üniversite Akademik Başarısı',
  LIFELONG_LEARNER: 'Kişisel ve Kariyer Gelişimi',
  EXAM_PREP: 'Bağımsız Sınav Hazırlığı',
};

export function toUserProfile(backendUser: BackendUser): UserProfile {
  const mode: UserMode = backendUser.educationLevel === 'LIFELONG_LEARNER' ? 'LIFELONG_LEARNER' : 'STUDENT';
  return {
    id: backendUser.id,
    name: `${backendUser.firstName} ${backendUser.lastName}`.trim(),
    email: backendUser.email,
    mode,
    educationLevel: backendUser.educationLevel,
    grade: backendUser.grade ?? undefined,
    targetGoal: TARGET_GOALS[backendUser.educationLevel],
  };
}

export interface TopicSummary {
  id: string;
  name: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  lastStudied: string | null;
  nextReview: string | null;
}

export interface SubjectWithTopics {
  subjectId: string;
  subjectName: string;
  topics: TopicSummary[];
}

export interface StartCheckResponse {
  checkId: string;
  opportunity: number;
  topicName: string;
  subjectName: string;
  hint: string;
}

export type PriorityLevel = 'YUKSEK' | 'ORTA' | 'DUSUK';

export interface RecommendationResult {
  mlAvailable: boolean;
  correctProbability: number | null;
  priority: PriorityLevel | null;
  recommendation: { id: string; title: string; content: string } | null;
  proposedReminder: { intervalDays: number } | null;
}

export interface DueTopicReminder {
  topicId: string;
  subjectId: string;
  topicName: string;
  subjectName: string;
  intervalDays: number;
  nextReminderAt: string;
}

export interface RecommendationRow {
  id: string;
  title: string;
  content: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  topicId: string | null;
  topicName: string | null;
  subjectName: string | null;
  priority: PriorityLevel | null;
  feedback: InsightFeedback | null;
  feedbackReason: string | null;
}

export interface MyTopic {
  id: string;
  name: string;
}

export interface MySubject {
  subjectId: string;
  subjectName: string;
  topics: MyTopic[];
}

export type InsightFeedback = 'LIKE' | 'DISLIKE';

export interface SubjectHistoryEntry {
  subjectId: string;
  subjectName: string;
  displayMode: 'TIME' | 'TOPICS';
  time: { totalMinutes: number; sessionCount: number; avgDifficulty: number; avgProductivity: number; lastStudiedAt: string } | null;
  topics: { topicId: string; topicName: string; lastCheckedAt: string; priority: PriorityLevel | null }[] | null;
  insight: { content: string; updatedAt: string; feedback: InsightFeedback | null; feedbackReason: string | null } | null;
}

export interface SubjectInsightResult {
  aiAvailable: boolean;
  content: string | null;
  updatedAt: string | null;
  feedback: InsightFeedback | null;
  feedbackReason: string | null;
}

export interface ScheduleSlotDto {
  id: string;
  subjectId: string;
  subjectName: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  location: string | null;
}

export interface ExamDto {
  id: string;
  name: string;
  date: string;
  targetScore: number | null;
  resultScore: number | null;
  examCategory: ExamCategory | null;
  subjects: { id: string; name: string }[];
}

export interface StudySessionRow {
  id: string;
  subjectName: string;
  topicName: string;
  durationMinutes: number;
  difficulty: number;
  productivity: number;
  notes: string | null;
  createdAt: string;
}

export interface HabitRow {
  id: string;
  name: string;
  streakDays: number;
  completedDates: string[];
}

export interface JournalRow {
  id: string;
  content: string;
  mood: string;
  sentimentScore: number | null;
  createdAt: string;
}

export type ExamCategory =
  | 'LGS'
  | 'TYT'
  | 'AYT'
  | 'YDT'
  | 'KPSS'
  | 'KPSS_EGITIM_BILIMLERI'
  | 'ALES'
  | 'DGS'
  | 'YOKDIL'
  | 'YOKDIL_FEN'
  | 'YOKDIL_SOSYAL'
  | 'YOKDIL_SAGLIK'
  | 'AGS'
  | 'YDS'
  | 'OTHER';

export interface ExamCatalogSubject {
  subjectId: string;
  subjectName: string;
  topics: { id: string; name: string }[];
}

export type DailyTaskStatus = 'PLANNED' | 'DONE' | 'SKIPPED';

export interface DailyTaskRow {
  id: string;
  subjectId: string;
  subjectName: string;
  topicId: string;
  topicName: string;
  date: string;
  status: DailyTaskStatus;
  studySessionId: string | null;
}

export const apiClient = {
  register: (body: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    educationLevel: EducationLevel;
    grade?: number;
    examCategory?: ExamCategory;
  }) => request<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(body) }),

  login: (body: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(body) }),

  verifyEmail: (body: { email: string; code: string }) =>
    request<AuthResponse>("/auth/verify-email", { method: "POST", body: JSON.stringify(body) }),

  resendVerification: (body: { email: string }) =>
    request<{ message: string }>("/auth/resend-verification", { method: "POST", body: JSON.stringify(body) }),

  forgotPassword: (body: { email: string }) =>
    request<{ message: string }>("/auth/forgot-password", { method: "POST", body: JSON.stringify(body) }),

  resetPassword: (body: { email: string; code: string; newPassword: string }) =>
    request<{ message: string }>("/auth/reset-password", { method: "POST", body: JSON.stringify(body) }),

  // refreshSession() ile ayni tek-ucuslu cagriyi paylasir (request()'in reaktif 401
  // yolu da ayni fonksiyonu kullaniyor) - StrictMode'un cift-mount'u dahil, ayni anda
  // gelen tum refresh talepleri tek bir gercek ag istegine duser.
  refresh: async () => {
    const result = await refreshSession();
    if (!result) {
      throw new ApiError(401, "Oturum bulunamadı", "TOKEN_MISSING");
    }
    return result;
  },

  logout: () => request<{ message: string }>("/auth/logout", { method: "POST" }),

  getMe: () => request<BackendUser>("/users/me"),

  getTopics: (mode: UserMode) => request<SubjectWithTopics[]>(`/topics?mode=${mode}`),

  createCustomSubject: (body: { name: string; mode: UserMode }) =>
    request<{ subjectId: string; topicId: string }>("/subjects/custom", { method: "POST", body: JSON.stringify(body) }),

  getMySubjects: (mode: UserMode) => request<MySubject[]>(`/subjects/mine?mode=${mode}`),

  addTopic: (subjectId: string, name: string) =>
    request<{ topicId: string; topicName: string }>(`/subjects/${subjectId}/topics`, {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  deleteSubject: (subjectId: string) => request<{ message: string }>(`/subjects/${subjectId}`, { method: "DELETE" }),

  renameSubject: (subjectId: string, name: string) =>
    request<{ subjectId: string; subjectName: string }>(`/subjects/${subjectId}`, {
      method: "PATCH",
      body: JSON.stringify({ name }),
    }),

  renameTopic: (subjectId: string, topicId: string, name: string) =>
    request<{ topicId: string; topicName: string }>(`/subjects/${subjectId}/topics/${topicId}`, {
      method: "PATCH",
      body: JSON.stringify({ name }),
    }),

  deleteTopic: (subjectId: string, topicId: string) =>
    request<{ message: string }>(`/subjects/${subjectId}/topics/${topicId}`, { method: "DELETE" }),

  getSchedule: () => request<ScheduleSlotDto[]>("/schedule"),

  createScheduleSlot: (body: { subjectId: string; dayOfWeek: number; startTime: string; endTime: string; location?: string }) =>
    request<{ id: string }>("/schedule", { method: "POST", body: JSON.stringify(body) }),

  getExams: (mode: UserMode) => request<ExamDto[]>(`/exams?mode=${mode}`),

  createExam: (body: { name: string; date: string; targetScore?: number; subjectIds: string[]; examCategory?: ExamCategory; mode: UserMode }) =>
    request<{ id: string }>("/exams", { method: "POST", body: JSON.stringify(body) }),

  updateExam: (
    id: string,
    body: {
      name?: string;
      date?: string;
      targetScore?: number | null;
      resultScore?: number | null;
      subjectIds?: string[];
      examCategory?: ExamCategory;
    },
  ) => request<{ message: string }>(`/exams/${id}`, { method: "PATCH", body: JSON.stringify(body) }),

  deleteExam: (id: string) => request<{ message: string }>(`/exams/${id}`, { method: "DELETE" }),

  getExamCatalog: (category: Exclude<ExamCategory, "OTHER">) =>
    request<ExamCatalogSubject[]>(`/exams/catalog/${category}`),

  startTopicCheck: (topicId: string) =>
    request<StartCheckResponse>("/topic-checks/start", { method: "POST", body: JSON.stringify({ topicId }) }),

  submitTopicCheck: (
    checkId: string,
    body: { attemptCount: number; hintCount: number; msFirstResponse: number; overlapTimeMs: number; selfGradedCorrect: boolean },
  ) => request<RecommendationResult>(`/topic-checks/${checkId}/submit`, { method: "POST", body: JSON.stringify(body) }),

  createStudySession: (body: {
    subjectId: string;
    topicId: string;
    durationMinutes: number;
    difficulty: number;
    productivity: number;
    notes?: string;
  }) => request<{ studySession: { id: string } } & RecommendationResult>("/study-sessions", { method: "POST", body: JSON.stringify(body) }),

  getStudySessions: (mode: UserMode) => request<StudySessionRow[]>(`/study-sessions?mode=${mode}`),

  getRecommendations: (mode: UserMode) =>
    request<RecommendationRow[]>(`/recommendations?mode=${mode}`),

  submitRecommendationFeedback: (recommendationId: string, feedback: InsightFeedback, reason?: string) =>
    request<{ id: string; feedback: InsightFeedback | null; feedbackReason: string | null }>(
      `/recommendations/${recommendationId}/feedback`,
      { method: "POST", body: JSON.stringify({ feedback, reason }) },
    ),

  getHabits: (mode: UserMode) => request<HabitRow[]>(`/habits?mode=${mode}`),

  createHabit: (name: string, mode: UserMode) =>
    request<HabitRow>("/habits", { method: "POST", body: JSON.stringify({ name, mode }) }),

  toggleHabitLog: (habitId: string, date: string) =>
    request<{ message: string }>(`/habits/${habitId}/toggle`, { method: "POST", body: JSON.stringify({ date }) }),

  getJournals: (mode: UserMode) => request<JournalRow[]>(`/journals?mode=${mode}`),

  createJournal: (body: { content: string; mood: string; mode: UserMode }) =>
    request<JournalRow>("/journals", { method: "POST", body: JSON.stringify(body) }),

  getDailyTasks: (date?: string) => request<DailyTaskRow[]>(`/daily-tasks${date ? `?date=${date}` : ""}`),

  createDailyTask: (body: { subjectId: string; topicId: string; date: string }) =>
    request<DailyTaskRow>("/daily-tasks", { method: "POST", body: JSON.stringify(body) }),

  completeDailyTask: (taskId: string, studySessionId: string) =>
    request<{ message: string }>(`/daily-tasks/${taskId}/complete`, {
      method: "POST",
      body: JSON.stringify({ studySessionId }),
    }),

  deleteDailyTask: (taskId: string) => request<{ message: string }>(`/daily-tasks/${taskId}`, { method: "DELETE" }),

  respondToTopicReminder: (topicId: string, intervalDays: number, accept: boolean) =>
    request<{ message: string }>("/topic-reminders", {
      method: "POST",
      body: JSON.stringify({ topicId, intervalDays, accept }),
    }),

  getDueTopicReminders: () => request<DueTopicReminder[]>("/topic-reminders/due"),

  getSubjectHistory: (mode: UserMode) => request<SubjectHistoryEntry[]>(`/subjects/history?mode=${mode}`),

  generateSubjectInsight: (subjectId: string, mode: UserMode) =>
    request<SubjectInsightResult>(`/subjects/${subjectId}/insight?mode=${mode}`, { method: "POST" }),

  submitInsightFeedback: (subjectId: string, feedback: InsightFeedback, reason?: string) =>
    request<SubjectInsightResult>(`/subjects/${subjectId}/insight/feedback`, {
      method: "POST",
      body: JSON.stringify({ feedback, reason }),
    }),

  submitFeedback: (body: { email: string; message: string }) =>
    request<{ message: string }>("/feedback", { method: "POST", body: JSON.stringify(body) }),
};
