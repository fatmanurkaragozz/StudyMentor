import type { EducationLevel } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000/api";
const TOKEN_KEY = "studymentor_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(response.status, body.error ?? `İstek başarısız oldu (${response.status})`);
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
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthResponse {
  token: string;
  user: BackendUser;
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
  subjects: string[];
}

export const apiClient = {
  register: (body: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    educationLevel: EducationLevel;
    grade?: number;
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

  updateProfile: (body: { educationLevel?: EducationLevel; grade?: number }) =>
    request<BackendUser>("/users/me", { method: "PATCH", body: JSON.stringify(body) }),

  getTopics: () => request<SubjectWithTopics[]>("/topics"),

  createCustomSubject: (body: { name: string }) =>
    request<{ subjectId: string; topicId: string }>("/subjects/custom", { method: "POST", body: JSON.stringify(body) }),

  getMySubjects: () => request<MySubject[]>("/subjects/mine"),

  addTopic: (subjectId: string, name: string) =>
    request<{ topicId: string; topicName: string }>(`/subjects/${subjectId}/topics`, {
      method: "POST",
      body: JSON.stringify({ name }),
    }),

  getSchedule: () => request<ScheduleSlotDto[]>("/schedule"),

  createScheduleSlot: (body: { subjectId: string; dayOfWeek: number; startTime: string; endTime: string; location?: string }) =>
    request<{ id: string }>("/schedule", { method: "POST", body: JSON.stringify(body) }),

  getExams: () => request<ExamDto[]>("/exams"),

  createExam: (body: { name: string; date: string; targetScore?: number; subjectIds: string[] }) =>
    request<{ id: string }>("/exams", { method: "POST", body: JSON.stringify(body) }),

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
  }) => request<{ studySession: unknown } & RecommendationResult>("/study-sessions", { method: "POST", body: JSON.stringify(body) }),

  getRecommendations: () =>
    request<RecommendationRow[]>("/recommendations"),
};
