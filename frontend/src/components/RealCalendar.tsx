import React, { useEffect, useState } from 'react';
import { CalendarDays, Plus, Loader2, AlertCircle, Clock, MapPin, Award, X, Pencil, Trash2 } from 'lucide-react';
import { apiClient, type MySubject, type ScheduleSlotDto, type ExamDto, type ExamCategory, type ExamCatalogSubject } from '../lib/apiClient';
import { useApp } from '../context/AppContext';

const EXAM_TYPE_GROUPS: { group: string; options: { value: ExamCategory; label: string }[] }[] = [
  {
    group: 'YKS',
    options: [
      { value: 'TYT', label: 'TYT' },
      { value: 'AYT', label: 'AYT' },
      { value: 'YDT', label: 'YDT (Yabancı Dil)' },
    ],
  },
  {
    group: 'KPSS',
    options: [
      { value: 'KPSS', label: 'KPSS (Genel Yetenek - Genel Kültür)' },
      { value: 'KPSS_EGITIM_BILIMLERI', label: 'KPSS (Eğitim Bilimleri)' },
    ],
  },
  {
    group: 'YÖKDİL',
    options: [
      { value: 'YOKDIL_FEN', label: 'YÖKDİL (Fen Bilimleri)' },
      { value: 'YOKDIL_SOSYAL', label: 'YÖKDİL (Sosyal Bilimler)' },
      { value: 'YOKDIL_SAGLIK', label: 'YÖKDİL (Sağlık Bilimleri)' },
    ],
  },
  {
    group: 'Diğer Merkezi Sınavlar',
    options: [
      { value: 'LGS', label: 'LGS' },
      { value: 'ALES', label: 'ALES' },
      { value: 'DGS', label: 'DGS' },
      { value: 'AGS', label: 'AGS' },
      { value: 'YDS', label: 'YDS' },
    ],
  },
];

const EXAM_TYPE_LABELS: Record<ExamCategory, string> = EXAM_TYPE_GROUPS.reduce(
  (acc, { options }) => {
    for (const opt of options) acc[opt.value] = opt.label;
    return acc;
  },
  { OTHER: 'Diğer (Manuel)' } as Record<ExamCategory, string>
);

const DAY_LABELS = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

export const RealCalendar: React.FC = () => {
  const { user } = useApp();
  const isStudent = user.mode === 'STUDENT';

  const [subjects, setSubjects] = useState<MySubject[]>([]);
  const [schedule, setSchedule] = useState<ScheduleSlotDto[]>([]);
  const [exams, setExams] = useState<ExamDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showSlotModal, setShowSlotModal] = useState(false);
  const [showExamModal, setShowExamModal] = useState(false);
  const [editingExam, setEditingExam] = useState<ExamDto | null>(null);

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

  const handleDeleteExam = async (exam: ExamDto) => {
    const label = isStudent ? 'sınavı' : 'hedefi';
    if (!window.confirm(`"${exam.name}" ${label} silmek istediğine emin misin?`)) {
      return;
    }
    try {
      await apiClient.deleteExam(exam.id);
      loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Silinemedi');
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border bg-indigo-500/10 border-indigo-500/30 text-indigo-300">
            {isStudent ? '🎓 Ders Programı & Sınav Takvimi' : '💼 Uğraş Programı & Hedef Takvimi'}
          </span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">Takvim</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isStudent
              ? 'Haftalık ders programını ve sınav tarihlerini buradan yönet.'
              : 'Haftalık uğraş programını ve hedef tarihlerini buradan yönet.'}
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
            <span>{isStudent ? 'Sınav Ekle' : 'Hedef Ekle'}</span>
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
          {isStudent
            ? 'Önce "Derslerim" sekmesinden bir ders ekle, sonra buraya program ve sınav ekleyebilirsin.'
            : 'Önce "Uğraşlarım" sekmesinden bir uğraş ekle, sonra buraya program ve hedef ekleyebilirsin.'}
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

          {/* Exams / Goals list */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Award className="w-4 h-4 text-rose-500 dark:text-rose-400" />
              <span>{isStudent ? 'Sınav Tarihleri' : 'Hedef Tarihleri'}</span>
            </h3>
            {exams.length === 0 && (
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {isStudent ? 'Henüz sınav eklenmedi.' : 'Henüz hedef eklenmedi.'}
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {exams.map(exam => (
                <div key={exam.id} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{exam.name}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      {exam.targetScore !== null && (
                        <span className="text-[11px] font-semibold text-rose-500 dark:text-rose-400 mr-1">Hedef: {exam.targetScore}</span>
                      )}
                      <button
                        onClick={() => setEditingExam(exam)}
                        className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-indigo-500/10 transition-all"
                        title="Düzenle"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteExam(exam)}
                        className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-500/10 transition-all"
                        title="Sil"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                    <CalendarDays className="w-3.5 h-3.5" />
                    <span>{new Date(exam.date).toLocaleDateString('tr-TR')}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-500">{exam.subjects.map(s => s.name).join(', ')}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {showSlotModal && (
        <AddScheduleSlotModal
          subjects={subjects}
          isStudent={isStudent}
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
          isStudent={isStudent}
          onClose={() => setShowExamModal(false)}
          onSaved={() => {
            setShowExamModal(false);
            loadAll();
          }}
        />
      )}

      {editingExam && (
        <AddExamModal
          subjects={subjects}
          isStudent={isStudent}
          initialExam={editingExam}
          onClose={() => setEditingExam(null)}
          onSaved={() => {
            setEditingExam(null);
            loadAll();
          }}
        />
      )}
    </div>
  );
};

interface AddScheduleSlotModalProps {
  subjects: MySubject[];
  isStudent: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const AddScheduleSlotModal: React.FC<AddScheduleSlotModalProps> = ({ subjects, isStudent, onClose, onCreated }) => {
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

        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {isStudent ? 'Ders Programına Ekle' : 'Uğraş Programına Ekle'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">{isStudent ? 'Ders' : 'Uğraş'}</label>
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
  isStudent: boolean;
  initialExam?: ExamDto | null;
  onClose: () => void;
  onSaved: () => void;
}

const DEFAULT_OSYM_TYPE: ExamCategory = 'TYT';

const AddExamModal: React.FC<AddExamModalProps> = ({ subjects, isStudent, initialExam, onClose, onSaved }) => {
  const isEditing = !!initialExam;
  const initialIsOsym = !!initialExam?.examCategory && initialExam.examCategory !== 'OTHER';

  const [name, setName] = useState(initialExam?.name ?? '');
  const [date, setDate] = useState(initialExam ? initialExam.date.slice(0, 10) : '');
  const [targetScore, setTargetScore] = useState<number | ''>(initialExam?.targetScore ?? '');
  const [sourceMode, setSourceMode] = useState<'OSYM' | 'SCHOOL'>(
    isStudent && (isEditing ? initialIsOsym : true) ? 'OSYM' : 'SCHOOL'
  );
  const [examType, setExamType] = useState<ExamCategory>(
    initialIsOsym ? (initialExam!.examCategory as ExamCategory) : DEFAULT_OSYM_TYPE
  );
  const [catalogSubjects, setCatalogSubjects] = useState<ExamCatalogSubject[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>(
    initialExam ? initialExam.subjects.map(s => s.id) : []
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCatalog = (type: ExamCategory, resetSelection: boolean) => {
    setLoadingCatalog(true);
    apiClient
      .getExamCatalog(type as Exclude<ExamCategory, 'OTHER'>)
      .then(catalog => {
        setCatalogSubjects(catalog);
        if (resetSelection) setSelectedSubjectIds(catalog.map(s => s.subjectId));
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Katalog yüklenemedi'))
      .finally(() => setLoadingCatalog(false));
  };

  useEffect(() => {
    if (isStudent && sourceMode === 'OSYM') {
      fetchCatalog(examType, !isEditing);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSourceModeChange = (mode: 'OSYM' | 'SCHOOL') => {
    setSourceMode(mode);
    setError(null);
    if (mode === 'SCHOOL') {
      setCatalogSubjects([]);
      setSelectedSubjectIds([]);
    } else {
      fetchCatalog(examType, true);
    }
  };

  const handleSelectExamType = (type: ExamCategory) => {
    setExamType(type);
    setError(null);
    fetchCatalog(type, true);
  };

  const toggleSubject = (subjectId: string) => {
    setSelectedSubjectIds(prev => (prev.includes(subjectId) ? prev.filter(id => id !== subjectId) : [...prev, subjectId]));
  };

  const checklistSubjects = sourceMode === 'SCHOOL' ? subjects.map(s => ({ subjectId: s.subjectId, subjectName: s.subjectName })) : catalogSubjects;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSubjectIds.length === 0) {
      setError(isStudent ? 'En az bir ders seçmelisin' : 'En az bir uğraş seçmelisin');
      return;
    }
    setSubmitting(true);
    setError(null);
    const examCategory: ExamCategory = isStudent && sourceMode === 'OSYM' ? examType : 'OTHER';
    try {
      if (isEditing) {
        await apiClient.updateExam(initialExam!.id, {
          name,
          date,
          targetScore: targetScore === '' ? null : targetScore,
          subjectIds: selectedSubjectIds,
          examCategory,
        });
      } else {
        await apiClient.createExam({
          name,
          date,
          targetScore: targetScore === '' ? undefined : targetScore,
          subjectIds: selectedSubjectIds,
          examCategory,
        });
      }
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kaydedilemedi');
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

        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          {isEditing ? (isStudent ? 'Sınavı Düzenle' : 'Hedefi Düzenle') : isStudent ? 'Sınav Ekle' : 'Hedef Ekle'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {isStudent && (
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-semibold">Sınav Türü</label>
              <div className="grid grid-cols-2 gap-1.5 mb-2.5">
                <button
                  type="button"
                  onClick={() => handleSourceModeChange('OSYM')}
                  className={`py-2 rounded-lg border text-[11px] font-bold transition-all ${
                    sourceMode === 'OSYM'
                      ? 'bg-rose-600 border-rose-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  ÖSYM
                </button>
                <button
                  type="button"
                  onClick={() => handleSourceModeChange('SCHOOL')}
                  className={`py-2 rounded-lg border text-[11px] font-bold transition-all ${
                    sourceMode === 'SCHOOL'
                      ? 'bg-rose-600 border-rose-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  Okul Derslerim
                </button>
              </div>

              {sourceMode === 'OSYM' && (
                <>
                  <select
                    value={examType}
                    onChange={e => handleSelectExamType(e.target.value as ExamCategory)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-rose-500"
                  >
                    {EXAM_TYPE_GROUPS.map(({ group, options }) => (
                      <optgroup key={group} label={group}>
                        {options.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-500 dark:text-slate-500 mt-1.5">
                    {EXAM_TYPE_LABELS[examType]} kataloğundaki dersler ve konular aşağıya otomatik eklendi, istersen çıkarabilirsin.
                  </p>
                </>
              )}
              {sourceMode === 'SCHOOL' && (
                <p className="text-[10px] text-slate-500 dark:text-slate-500">
                  Aşağıdan "Derslerim" sekmesine eklediğin derslerden seçebilirsin.
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">{isStudent ? 'Sınav Adı' : 'Hedef Adı'}</label>
            <input
              type="text"
              placeholder={isStudent ? 'Örn: Veri Tabanları Vizesi' : 'Örn: Python Sertifikasını Bitirme'}
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
            <label className="block text-slate-700 dark:text-slate-300 mb-1.5 font-semibold">{isStudent ? 'İlgili Ders(ler)' : 'İlgili Uğraş(lar)'}</label>
            {loadingCatalog ? (
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Katalog yükleniyor...</span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {checklistSubjects.map(s => (
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
            )}
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
            {submitting ? 'Kaydediliyor...' : isEditing ? 'Güncelle' : 'Kaydet'}
          </button>
        </form>
      </div>
    </div>
  );
};
