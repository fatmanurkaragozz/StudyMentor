import React, { useEffect, useState } from 'react';
import { CalendarDays, Plus, Loader2, AlertCircle, Clock, MapPin, Award, X } from 'lucide-react';
import { apiClient, type MySubject, type ScheduleSlotDto, type ExamDto } from '../lib/apiClient';

const DAY_LABELS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

export const StudentCalendar: React.FC = () => {
  const [subjects, setSubjects] = useState<MySubject[]>([]);
  const [schedule, setSchedule] = useState<ScheduleSlotDto[]>([]);
  const [exams, setExams] = useState<ExamDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showSlotModal, setShowSlotModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);

  const hasCourses = subjects.length > 0;

  const loadAll = () => {
    setLoading(true);
    Promise.all([apiClient.getMySubjects(), apiClient.getSchedule(), apiClient.getExams()])
      .then(([s, sch, ex]) => {
        setSubjects(s);
        setSchedule(sch);
        setExams(ex);
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Takvim yüklenemedi'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAll();
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border bg-indigo-500/10 border-indigo-500/30 text-indigo-300">
            🎓 Ders Programı & Sınav Takvimi
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">Takvim</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Haftalık ders programını ve sınav tarihlerini buradan yönet.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSlotModal(true)}
            disabled={!hasCourses}
            className="px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg glow-indigo"
          >
            <Plus className="w-4 h-4" />
            <span>Programa Ekle</span>
          </button>
          <button
            onClick={() => setShowExamModal(true)}
            disabled={!hasCourses}
            className="px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-4 h-4" />
            <span>Sınav Ekle</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2 py-10 text-slate-500 dark:text-slate-400 text-sm">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Takvim yükleniyor...</span>
        </div>
      )}

      {!loading && !hasCourses && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
          Önce "Derslerim" sekmesinden bir ders ekle, sonra buraya program ve sınav ekleyebilirsin.
        </div>
      )}

      {!loading && hasCourses && (
        <>
          {/* Weekly schedule grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
            {DAY_LABELS.map((label, idx) => {
              const dayNumber = idx + 1;
              const daySlots = schedule.filter(s => s.dayOfWeek === dayNumber).sort((a, b) => a.startTime.localeCompare(b.startTime));
              return (
                <div key={dayNumber} className="glass-panel p-3 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 min-h-[120px]">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</div>
                  {daySlots.length === 0 && <div className="text-[11px] text-slate-400 dark:text-slate-600">—</div>}
                  {daySlots.map(slot => (
                    <div key={slot.id} className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 space-y-0.5">
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">{slot.subjectName}</div>
                      <div className="flex items-center gap-1 text-[10px] text-indigo-600 dark:text-indigo-300">
                        <Clock className="w-3 h-3" />
                        <span>{slot.startTime} - {slot.endTime}</span>
                      </div>
                      {slot.location && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
                          <MapPin className="w-3 h-3" />
                          <span>{slot.location}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          {/* Exams list */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Award className="w-4 h-4 text-rose-500 dark:text-rose-400" />
              <span>Sınav Tarihleri</span>
            </h3>
            {exams.length === 0 && <div className="text-xs text-slate-500 dark:text-slate-400">Henüz sınav eklenmedi.</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {exams.map(exam => (
                <div key={exam.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{exam.name}</span>
                    {exam.targetScore !== null && (
                      <span className="text-[11px] font-semibold text-rose-500 dark:text-rose-400">Hedef: {exam.targetScore}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span>{new Date(exam.date).toLocaleDateString('tr-TR')}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-500">{exam.subjects.join(', ')}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {showSlotModal && (
        <AddScheduleSlotModal
          subjects={subjects}
          onClose={() => setShowSlotModal(false)}
          onCreated={() => {
            setShowSlotModal(false);
            loadAll();
          }}
        />
      )}

      {showExamModal && (
        <AddExamModal
          subjects={subjects}
          onClose={() => setShowExamModal(false)}
          onCreated={() => {
            setShowExamModal(false);
            loadAll();
          }}
        />
      )}
    </div>
  );
};

interface AddScheduleSlotModalProps {
  subjects: MySubject[];
  onClose: () => void;
  onCreated: () => void;
}

const AddScheduleSlotModal: React.FC<AddScheduleSlotModalProps> = ({ subjects, onClose, onCreated }) => {
  const [subjectId, setSubjectId] = useState(subjects[0]?.subjectId ?? '');
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:30');
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await apiClient.createScheduleSlot({ subjectId, dayOfWeek, startTime, endTime, location: location.trim() || undefined });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eklenemedi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass-panel max-w-md w-full p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-full bg-slate-200/60 dark:bg-slate-800/50 hover:bg-slate-300 dark:hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Ders Programına Ekle</h3>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Ders</label>
            <select
              value={subjectId}
              onChange={e => setSubjectId(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              {subjects.map(s => (
                <option key={s.subjectId} value={s.subjectId}>{s.subjectName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-semibold">Gün</label>
            <div className="grid grid-cols-4 gap-1.5">
              {DAY_LABELS.map((label, idx) => {
                const day = idx + 1;
                return (
                  <button
                    type="button"
                    key={day}
                    onClick={() => setDayOfWeek(day)}
                    className={`py-2 rounded-lg border text-[10px] font-bold transition-all ${
                      dayOfWeek === day
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {label.slice(0, 3)}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Başlangıç</label>
              <input
                type="time"
                value={startTime}
                onChange={e => setStartTime(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Bitiş</label>
              <input
                type="time"
                value={endTime}
                onChange={e => setEndTime(e.target.value)}
                className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Konum (Opsiyonel)</label>
            <input
              type="text"
              placeholder="Örn: B203"
              value={location}
              onChange={e => setLocation(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || !subjectId}
            className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold shadow-lg glow-indigo transition-all"
          >
            {submitting ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </form>
      </div>
    </div>
  );
};

interface AddExamModalProps {
  subjects: MySubject[];
  onClose: () => void;
  onCreated: () => void;
}

const AddExamModal: React.FC<AddExamModalProps> = ({ subjects, onClose, onCreated }) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [targetScore, setTargetScore] = useState<number | ''>('');
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjectIds(prev => (prev.includes(subjectId) ? prev.filter(id => id !== subjectId) : [...prev, subjectId]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSubjectIds.length === 0) {
      setError('En az bir ders seçmelisin');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await apiClient.createExam({
        name,
        date,
        targetScore: targetScore === '' ? undefined : targetScore,
        subjectIds: selectedSubjectIds,
      });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eklenemedi');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass-panel max-w-md w-full p-6 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-full bg-slate-200/60 dark:bg-slate-800/50 hover:bg-slate-300 dark:hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Sınav Ekle</h3>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Sınav Adı</label>
            <input
              type="text"
              placeholder="Örn: Veri Tabanları Vizesi"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-rose-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Tarih</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-rose-500"
              required
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Hedef Puan (Opsiyonel)</label>
            <input
              type="number"
              value={targetScore}
              onChange={e => setTargetScore(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-semibold">İlgili Ders(ler)</label>
            <div className="flex flex-wrap gap-2">
              {subjects.map(s => (
                <button
                  type="button"
                  key={s.subjectId}
                  onClick={() => toggleSubject(s.subjectId)}
                  className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-semibold transition-all ${
                    selectedSubjectIds.includes(s.subjectId)
                      ? 'bg-rose-600 border-rose-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {s.subjectName}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-semibold shadow-lg transition-all"
          >
            {submitting ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </form>
      </div>
    </div>
  );
};
