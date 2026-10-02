import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import { Notebook } from './Notebook';
import { useApp } from '../context/AppContext';
import { apiClient, type DailyTaskRow, type StudySessionRow, type SubjectWithTopics } from '../lib/apiClient';
import { localMonthRange } from '../lib/dateKey';

vi.mock('../context/AppContext', () => ({ useApp: vi.fn() }));
vi.mock('../lib/apiClient', () => ({
  apiClient: {
    getStudySessions: vi.fn(),
    getDailyTasks: vi.fn(),
    createDailyTask: vi.fn(),
    updateDailyTask: vi.fn(),
    deleteDailyTask: vi.fn(),
    getTopics: vi.fn(),
    getMySubjects: vi.fn(),
    createCustomSubject: vi.fn(),
    createStudySession: vi.fn(),
  },
}));

const local = (d: number, h: number, m: number) => new Date(2026, 9, d, h, m).toISOString();

const session = (over: Partial<StudySessionRow>): StudySessionRow => ({
  id: 'x',
  subjectName: 'Matematik',
  topicName: 'Türev',
  durationMinutes: 25,
  difficulty: 3,
  productivity: 4,
  notes: null,
  startedAt: null,
  createdAt: local(1, 12, 0),
  ...over,
});

const task = (over: Partial<DailyTaskRow>): DailyTaskRow => ({
  id: 't',
  subjectId: null,
  subjectName: null,
  topicId: null,
  topicName: null,
  title: 'Tarih tekrar',
  startTime: null,
  endTime: null,
  date: '2026-10-01',
  status: 'PLANNED',
  studySessionId: null,
  ...over,
});

beforeEach(() => {
  vi.clearAllMocks();
  // Sadece Date sahte: "bugun" 1 Ekim 2026 12:00 (yerel), promise/waitFor gercek zamanlayicilarla calisir.
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date(2026, 9, 1, 12, 0));
  vi.mocked(useApp).mockReturnValue({
    user: { mode: 'STUDENT', name: 'Test' },
    setActiveTab: vi.fn(),
  } as unknown as ReturnType<typeof useApp>);
  vi.mocked(apiClient.getStudySessions).mockResolvedValue([]);
  vi.mocked(apiClient.getDailyTasks).mockResolvedValue([]);
  vi.mocked(apiClient.createDailyTask).mockResolvedValue(task({}));
  vi.mocked(apiClient.updateDailyTask).mockResolvedValue(task({}));
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('Notebook', () => {
  it('secili gunun calismalarini saat araligiyla, eski kaydi "≈" ile ve toplam sureyle gosterir', async () => {
    // 3 Ekim'deki kayit bugunun listesinde olmamali, ama mini takvimde isaretli olmali.
    vi.mocked(apiClient.getStudySessions).mockResolvedValue([
      session({ id: 'eski', subjectName: 'Fizik', topicName: 'Kuvvet', durationMinutes: 40, createdAt: local(1, 14, 30) }),
      session({ id: 'yeni', startedAt: local(1, 9, 10), notes: 'türevde zincir kuralı zorladı' }),
      session({ id: 'baska-gun', subjectName: 'Kimya', startedAt: new Date(2026, 9, 3, 10, 0).toISOString() }),
    ]);
    render(<Notebook />);

    expect(await screen.findByText('09:10–09:35')).toBeInTheDocument();
    expect(screen.getByText('≈13:50–14:30')).toBeInTheDocument();
    expect(screen.getByText(/türevde zincir kuralı zorladı/)).toBeInTheDocument();
    expect(screen.queryByText(/Kimya/)).not.toBeInTheDocument();
    expect(screen.getByText('toplam 1 sa 5 dk')).toBeInTheDocument();
    // Ayin tamami tek istekle; mini takvimde kayitli gunler isaretli.
    expect(apiClient.getStudySessions).toHaveBeenCalledWith('STUDENT', localMonthRange('2026-10-01'));
    expect(screen.getByRole('button', { name: '3, çalışma var' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
  });

  it('onceki gune gecince o gunun planlarini, ay degisince o ayin kayitlarini ister', async () => {
    render(<Notebook />);
    expect(await screen.findByText(/1 Ekim 2026/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Önceki gün' }));

    expect(await screen.findByText(/30 Eylül 2026/)).toBeInTheDocument();
    await waitFor(() => expect(apiClient.getDailyTasks).toHaveBeenLastCalledWith('STUDENT', '2026-09-30'));
    expect(apiClient.getStudySessions).toHaveBeenLastCalledWith('STUDENT', localMonthRange('2026-09-30'));
  });

  it('saatli plan ekler; bitis baslangictan onceyse istek atmadan uyarir', async () => {
    render(<Notebook />);
    await screen.findByText('Bu gün için plan ya da not yok.');

    fireEvent.change(screen.getByPlaceholderText(/Fizik deneme çöz/), { target: { value: 'Fizik deneme çöz' } });
    fireEvent.change(screen.getByLabelText('Başlangıç saati (isteğe bağlı)'), { target: { value: '16:00' } });
    fireEvent.change(screen.getByLabelText('Bitiş saati (isteğe bağlı)'), { target: { value: '15:00' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ekle' }));

    expect(await screen.findByText('Bitiş saati başlangıçtan sonra olmalı.')).toBeInTheDocument();
    expect(apiClient.createDailyTask).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText('Bitiş saati (isteğe bağlı)'), { target: { value: '17:00' } });
    fireEvent.click(screen.getByRole('button', { name: 'Ekle' }));

    await waitFor(() =>
      expect(apiClient.createDailyTask).toHaveBeenCalledWith({
        title: 'Fizik deneme çöz',
        startTime: '16:00',
        endTime: '17:00',
        date: '2026-10-01',
        mode: 'STUDENT',
      }),
    );
  });

  it('plani isaretler; gecmis gunun yapilmamis planini bugune tasir', async () => {
    vi.mocked(apiClient.getDailyTasks).mockImplementation(async (_mode, date) =>
      date === '2026-09-30' ? [task({ id: 'dun', title: 'Kitap oku', date: '2026-09-30' })] : [],
    );
    render(<Notebook />);
    await screen.findByText(/1 Ekim 2026/);
    fireEvent.click(screen.getByRole('button', { name: 'Önceki gün' }));

    fireEvent.click(await screen.findByRole('checkbox', { name: 'Yapıldı olarak işaretle' }));
    await waitFor(() => expect(apiClient.updateDailyTask).toHaveBeenCalledWith('dun', { status: 'DONE' }));

    fireEvent.click(screen.getByRole('button', { name: 'Bugüne taşı' }));
    await waitFor(() => expect(apiClient.updateDailyTask).toHaveBeenCalledWith('dun', { date: '2026-10-01' }));
  });

  it('gelecek gunde calisma listesi yerine bos durum gosterir, gecmise ekleme sunmaz', async () => {
    render(<Notebook />);
    await screen.findByText(/1 Ekim 2026/);
    fireEvent.click(screen.getByRole('button', { name: 'Sonraki gün' }));

    expect(await screen.findByText(/Bu gün henüz gelmedi/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Geçmişe ekle' })).not.toBeInTheDocument();
  });

  it('sayacsiz yapilan calismayi baslangic saati ve sureyle kaydeder', async () => {
    vi.mocked(apiClient.getTopics).mockResolvedValue([
      { subjectId: 's1', subjectName: 'Matematik', topics: [{ id: 't1', name: 'Türev' }] },
    ] as SubjectWithTopics[]);
    vi.mocked(apiClient.createStudySession).mockResolvedValue({} as never);
    render(<Notebook />);

    fireEvent.click(await screen.findByRole('button', { name: 'Geçmişe ekle' }));
    await screen.findByRole('option', { name: 'Türev' });
    fireEvent.change(screen.getByLabelText('Başlangıç'), { target: { value: '09:00' } });
    fireEvent.change(screen.getByLabelText('Bitiş'), { target: { value: '10:30' } });
    fireEvent.click(screen.getByRole('button', { name: 'Kaydet' }));

    await waitFor(() =>
      expect(apiClient.createStudySession).toHaveBeenCalledWith(
        expect.objectContaining({
          subjectId: 's1',
          topicId: 't1',
          durationMinutes: 90,
          startedAt: new Date(2026, 9, 1, 9, 0).toISOString(),
        }),
      ),
    );
    // Kayittan sonra ayin listesi yenilenir.
    await waitFor(() => expect(apiClient.getStudySessions).toHaveBeenCalledTimes(2));
  });

  it('henuz bitmemis bir calismayi eklemez', async () => {
    vi.mocked(apiClient.getTopics).mockResolvedValue([
      { subjectId: 's1', subjectName: 'Matematik', topics: [{ id: 't1', name: 'Türev' }] },
    ] as SubjectWithTopics[]);
    render(<Notebook />);

    fireEvent.click(await screen.findByRole('button', { name: 'Geçmişe ekle' }));
    await screen.findByRole('option', { name: 'Türev' });
    fireEvent.change(screen.getByLabelText('Başlangıç'), { target: { value: '11:00' } });
    fireEvent.change(screen.getByLabelText('Bitiş'), { target: { value: '13:00' } });
    fireEvent.click(screen.getByRole('button', { name: 'Kaydet' }));

    expect(await screen.findByText('Henüz bitmemiş bir çalışma eklenemez.')).toBeInTheDocument();
    expect(apiClient.createStudySession).not.toHaveBeenCalled();
  });
});
