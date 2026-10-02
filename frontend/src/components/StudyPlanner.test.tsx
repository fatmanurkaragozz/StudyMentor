import { Activity } from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react';
import { StudyPlanner } from './StudyPlanner';
import { IntroProvider } from '../context/IntroContext';
import { FocusTimerProvider } from '../context/FocusTimerContext';
import { useApp } from '../context/AppContext';
import { apiClient, type SubjectWithTopics } from '../lib/apiClient';
import type { UserMode } from '../types';

// Sidebar'daki "Platform Modu" degistiricisini taklit edebilmek icin useApp'i mock'luyoruz;
// apiClient de her mod icin farkli veri dondursun diye mock.
vi.mock('../context/AppContext', () => ({ useApp: vi.fn() }));
vi.mock('../lib/apiClient', () => ({
  apiClient: {
    getTopics: vi.fn(),
    getMySubjects: vi.fn(),
    getDailyTasks: vi.fn(),
    updateDailyTask: vi.fn(),
    createStudySession: vi.fn(),
    completeDailyTask: vi.fn(),
  },
}));

const PURSUIT = 'StudyMentor projesi geliştirme';

const setMode = (mode: UserMode) => {
  vi.mocked(useApp).mockReturnValue({
    user: { mode, name: 'Test Kullanıcı' },
    setActiveTab: vi.fn(),
  } as unknown as ReturnType<typeof useApp>);
};

// plannerVisible=false: kullanici baska bir sekmeye gecmis (App.tsx'teki Activity ile ayni).
const tree = (plannerVisible = true) => (
  <FocusTimerProvider>
    <IntroProvider>
      <Activity mode={plannerVisible ? 'visible' : 'hidden'}>
        <StudyPlanner />
      </Activity>
    </IntroProvider>
  </FocusTimerProvider>
);

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  vi.mocked(apiClient.getTopics).mockImplementation(async mode =>
    (mode === 'STUDENT'
      ? [
          { subjectId: 's1', subjectName: 'Matematik', topics: [{ id: 't1', name: 'Türev' }] },
          { subjectId: 's2', subjectName: 'Fizik', topics: [{ id: 't2', name: 'Kuvvet' }] },
        ]
      : [{ subjectId: 'p1', subjectName: PURSUIT, topics: [{ id: 'tp1', name: 'Genel' }] }]) as SubjectWithTopics[],
  );
  vi.mocked(apiClient.getMySubjects).mockResolvedValue([{ subjectId: 'p1', subjectName: PURSUIT, topics: [] }]);
  vi.mocked(apiClient.getDailyTasks).mockImplementation(async mode =>
    mode === 'LIFELONG_LEARNER'
      ? [{ id: 'd1', subjectId: 'p1', subjectName: PURSUIT, topicId: 'tp1', topicName: 'Genel', date: '2026-10-01', status: 'PLANNED', title: null, startTime: null, endTime: null, studySessionId: null }]
      : [],
  );
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('StudyPlanner mod ayrimi', () => {
  it("Gelisim'de baslatilan sayac Ogrenci modunda gorunmez, arka planda saymaya devam eder", async () => {
    setMode('LIFELONG_LEARNER');
    const { rerender } = render(tree());

    const startButton = await screen.findByRole('button', { name: 'Oturum Başlat' });
    vi.useFakeTimers();
    fireEvent.click(startButton);
    expect(screen.getByText(/Derin Odaklanma Süreci Devam Ediyor/)).toBeVisible();

    setMode('STUDENT');
    rerender(tree());
    await act(async () => {});

    // Ogrenci modu kendi (duraklatilmis) sayaciyla acilir, Gelisim'in gorevi/sayaci gorunmez.
    expect(screen.getByText('Zamanlayıcı Duraklatıldı')).toBeVisible();
    expect(screen.getByText(/Derin Odaklanma Süreci Devam Ediyor/)).not.toBeVisible();
    expect(screen.getByText(/Şu an çalışıyorsun/)).not.toBeVisible();
    expect(screen.queryByRole('button', { name: 'Oturum Başlat' })).not.toBeInTheDocument();

    for (let i = 0; i < 3; i++) {
      act(() => {
        vi.advanceTimersByTime(1000);
      });
    }

    setMode('LIFELONG_LEARNER');
    rerender(tree());

    expect(screen.getByText(`Şu an çalışıyorsun: ${PURSUIT}`)).toBeVisible();
    expect(screen.getByText('24:57')).toBeVisible();
  });

  it('baska sekmeye gecip donunce sayac sifirlanmaz, gecen sure dusulur ve secili ders korunur', async () => {
    vi.mocked(apiClient.getDailyTasks).mockResolvedValue([
      { id: 'd2', subjectId: 's2', subjectName: 'Fizik', topicId: 't2', topicName: 'Kuvvet', date: '2026-10-01', status: 'PLANNED', title: null, startTime: null, endTime: null, studySessionId: null },
    ]);
    setMode('STUDENT');
    const { rerender } = render(tree());

    // Listedeki ilk ders (Matematik) degil, gorevin dersi (Fizik) uzerinde calisiliyor.
    const startButton = await screen.findByRole('button', { name: 'Oturum Başlat' });
    vi.useFakeTimers();
    fireEvent.click(startButton);

    rerender(tree(false));
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    rerender(tree(true));
    await act(async () => {});

    expect(screen.getByText('24:00')).toBeVisible();
    expect(screen.getByText('Şu an çalışıyorsun: Fizik — Kuvvet')).toBeVisible();
    // Ekran tekrar gorununce ders listesi tazelendi (Derslerim'de degisiklik olduysa gelsin).
    expect(apiClient.getTopics).toHaveBeenCalledTimes(2);
  });

  it('Defterim\'den gelen serbest metinli plan saatiyle gorunur, oturum yerine "Tamamla" ile isaretlenir', async () => {
    vi.mocked(apiClient.getDailyTasks).mockResolvedValue([
      { id: 'p1', subjectId: null, subjectName: null, topicId: null, topicName: null, title: 'Fizik deneme çöz', startTime: '15:00', endTime: '16:00', date: '2026-10-01', status: 'PLANNED', studySessionId: null },
    ]);
    vi.mocked(apiClient.updateDailyTask).mockResolvedValue({} as never);
    setMode('STUDENT');
    render(tree());

    expect(await screen.findByText('Fizik deneme çöz')).toBeInTheDocument();
    expect(screen.getByText('15:00–16:00')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Oturum Başlat' })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Tamamla' }));
    await act(async () => {});
    expect(apiClient.updateDailyTask).toHaveBeenCalledWith('p1', { status: 'DONE' });
  });

  it('kayitta oturumun baslangic anini (startedAt) gonderir', async () => {
    vi.mocked(apiClient.getDailyTasks).mockResolvedValue([
      { id: 'd2', subjectId: 's2', subjectName: 'Fizik', topicId: 't2', topicName: 'Kuvvet', date: '2026-10-01', status: 'PLANNED', title: null, startTime: null, endTime: null, studySessionId: null },
    ]);
    vi.mocked(apiClient.createStudySession).mockResolvedValue({
      studySession: { id: 'ss1' },
      mlAvailable: false,
      correctProbability: null,
      priority: null,
      recommendation: null,
      proposedReminder: null,
    });
    vi.mocked(apiClient.completeDailyTask).mockResolvedValue({} as never);
    setMode('STUDENT');
    render(tree());

    const startButton = await screen.findByRole('button', { name: 'Oturum Başlat' });
    vi.useFakeTimers();
    const startedAt = new Date().toISOString();
    fireEvent.click(startButton);
    act(() => {
      vi.advanceTimersByTime(25 * 60 * 1000);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Veritabanına Kaydet' }));
    await act(async () => {});

    expect(apiClient.createStudySession).toHaveBeenCalledWith(
      expect.objectContaining({ subjectId: 's2', topicId: 't2', durationMinutes: 25, startedAt }),
    );
  });

  it('gorev listesini aktif modla ister', async () => {
    setMode('STUDENT');
    render(tree());
    await screen.findByText('Bugün için henüz bir çalışma maddesi eklemedin.');
    expect(apiClient.getDailyTasks).toHaveBeenCalledWith('STUDENT', expect.any(String));
  });
});
