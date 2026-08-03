import React, { useEffect, useState } from 'react';
import { Star, Loader2, AlertCircle, ArrowRight, ListChecks, Sparkles, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { apiClient, type SubjectWithTopics, type RecommendationResult } from '../../lib/apiClient';
import { TopicCheckModal } from './TopicCheckModal';
import { PRIORITY_LABELS, PRIORITY_COLORS } from './priorityLabels';

interface DataEntryStepProps {
  onFinish: () => void;
}

export const DataEntryStep: React.FC<DataEntryStepProps> = ({ onFinish }) => {
  const { user } = useApp();
  const isStudent = user.mode === 'STUDENT';

  const [subjects, setSubjects] = useState<SubjectWithTopics[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [pursuitName, setPursuitName] = useState('');
  const [duration, setDuration] = useState(30);
  const [difficulty, setDifficulty] = useState(3);
  const [productivity, setProductivity] = useState(3);
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitResult, setSubmitResult] = useState<RecommendationResult | null>(null);

  const [checkTopic, setCheckTopic] = useState<{ id: string; name: string; subjectName: string } | null>(null);

  useEffect(() => {
    apiClient
      .getTopics()
      .then(data => {
        setSubjects(data);
        if (isStudent && data.length > 0) {
          setSelectedSubjectId(data[0].subjectId);
          if (data[0].topics.length > 0) setSelectedTopicId(data[0].topics[0].id);
        }
      })
      .catch(err => setLoadError(err instanceof Error ? err.message : 'Konular yüklenemedi'))
      .finally(() => setLoading(false));
  }, [isStudent]);

  const selectedSubject = subjects.find(s => s.subjectId === selectedSubjectId) ?? null;

  const handleSubjectChange = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
    const subject = subjects.find(s => s.subjectId === subjectId);
    setSelectedTopicId(subject?.topics[0]?.id ?? '');
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      let subjectId = selectedSubjectId;
      let topicId = selectedTopicId;

      if (!isStudent) {
        const created = await apiClient.createCustomSubject({ name: pursuitName.trim() });
        subjectId = created.subjectId;
        topicId = created.topicId;
      }

      if (!subjectId || !topicId) return;

      const res = await apiClient.createStudySession({
        subjectId,
        topicId,
        durationMinutes: duration,
        difficulty,
        productivity,
        notes: notes.trim() || undefined,
      });
      setSubmitResult(res);
      setNotes('');
      if (!isStudent) setPursuitName('');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Kayıt başarısız oldu');
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = isStudent ? !!selectedTopicId : pursuitName.trim().length > 0;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="glass-panel max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 rounded-3xl border border-amber-500/20 text-slate-900 dark:text-slate-100 shadow-2xl relative space-y-6">
        <button
          onClick={onFinish}
          className="absolute top-4 right-4 p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-full bg-slate-200/60 dark:bg-slate-800/50 hover:bg-slate-300 dark:hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-1">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Dünkü Çalışmanı Ekle</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            İstersen dünkü çalışma verini elle gir, istersen bir konu için hızlı bir mini kontrol yap. İkisi de opsiyonel — hazır olduğunda uygulamaya geçebilirsin.
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-2 py-10 text-slate-500 dark:text-slate-400 text-sm">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Konular yükleniyor...</span>
          </div>
        )}

        {loadError && (
          <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{loadError}</span>
          </div>
        )}

        {!loading && !loadError && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Manual entry form */}
            <form onSubmit={handleManualSubmit} className="space-y-4 text-xs glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Elle Veri Girişi</h3>

              {isStudent ? (
                <>
                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Ders</label>
                    <select
                      value={selectedSubjectId}
                      onChange={e => handleSubjectChange(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-amber-500"
                    >
                      {subjects.map(s => (
                        <option key={s.subjectId} value={s.subjectId}>{s.subjectName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Konu</label>
                    <select
                      value={selectedTopicId}
                      onChange={e => setSelectedTopicId(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-amber-500"
                    >
                      {selectedSubject?.topics.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Neyle uğraşıyorsun?</label>
                  <input
                    type="text"
                    placeholder="Örn: Python Öğreniyorum, Gitar Pratiği"
                    value={pursuitName}
                    onChange={e => setPursuitName(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Süre (dakika)</label>
                <input
                  type="number"
                  min={1}
                  max={480}
                  value={duration}
                  onChange={e => setDuration(Math.max(1, Number(e.target.value)))}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Zorluk Algısı (1-5)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setDifficulty(star)}
                      className={`p-2 rounded-lg border transition-all ${
                        difficulty >= star ? 'bg-amber-500/20 border-amber-500/50 text-amber-500 dark:text-amber-400' : 'bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-slate-400 dark:text-slate-600'
                      }`}
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Verimlilik Algısı (1-5)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setProductivity(star)}
                      className={`p-2 rounded-lg border transition-all ${
                        productivity >= star ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-500 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-slate-400 dark:text-slate-600'
                      }`}
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-700 dark:text-slate-300 mb-1 font-semibold">Notlar (Opsiyonel)</label>
                <textarea
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-slate-900 dark:text-slate-200 focus:outline-none focus:border-amber-500 h-16 resize-none"
                />
              </div>

              {submitError && (
                <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {submitResult && (
                <div className="space-y-2">
                  {submitResult.mlAvailable && submitResult.priority ? (
                    <div className={`rounded-xl border px-3 py-2 flex items-center gap-2 font-semibold ${PRIORITY_COLORS[submitResult.priority]}`}>
                      <Sparkles className="w-4 h-4" />
                      <span>{PRIORITY_LABELS[submitResult.priority]}</span>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 px-3 py-2 text-[11px] text-slate-500 dark:text-slate-400">
                      ML servisi şu anda ulaşılamıyor, verilerin kaydedildi.
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !canSubmit}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold shadow-lg glow-indigo transition-all"
              >
                {submitting ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </form>

            {/* Mini check topic list */}
            {subjects.length > 0 && (
              <div className="space-y-4">
                <div className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <ListChecks className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                    <span>Mini Kontrol Yap</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    Bir konu seç, kısa bir öz-değerlendirme yap; sana o an için özel bir tekrar önceliği hesaplayalım.
                  </p>
                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {subjects.flatMap(s =>
                      s.topics.map(t => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setCheckTopic({ id: t.id, name: t.name, subjectName: s.subjectName })}
                          className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:border-amber-500/40 transition-all"
                        >
                          <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">{t.name}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{s.subjectName}</div>
                        </button>
                      )),
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={onFinish}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg glow-amber flex items-center justify-center gap-2 transition-all"
        >
          <span>Uygulamaya Gir</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {checkTopic && (
        <TopicCheckModal
          topicId={checkTopic.id}
          topicName={checkTopic.name}
          subjectName={checkTopic.subjectName}
          onClose={() => setCheckTopic(null)}
        />
      )}
    </div>
  );
};
