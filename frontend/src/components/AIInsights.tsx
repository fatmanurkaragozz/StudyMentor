import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { apiClient, type RecommendationRow, type SubjectHistoryEntry } from '../lib/apiClient';
import { PRIORITY_LABELS, PRIORITY_COLORS } from './onboarding/priorityLabels';
import { TopicCheckModal } from './onboarding/TopicCheckModal';
import { getSubjectHistoryFallbackComment } from '../lib/kaptan';
import { Sparkles, BrainCircuit, Calendar, ArrowUpRight, Loader2, Compass, Clock, ListChecks } from 'lucide-react';
import { StarMap } from './StarMap';

const TYPE_LABELS: Record<string, string> = {
  REVISION: 'Aralıklı Tekrar Önerisi (Spaced Repetition)',
  STUDY_PRIORITY: 'Derin Odaklanma Tavsiyesi',
};

export const AIInsights: React.FC = () => {
  const { user } = useApp();
  const isStudent = user.mode === 'STUDENT';

  const [recommendations, setRecommendations] = useState<RecommendationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkTopic, setCheckTopic] = useState<{ id: string; name: string; subjectName: string } | null>(null);

  const [history, setHistory] = useState<SubjectHistoryEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [generatingId, setGeneratingId] = useState<string | null>(null);
  // Gemini'e ulasilamayan (kredi/anahtar yok, hata) ders/uğraşlar - bunlar icin baska bir
  // ucretli modele GECILMEZ, sadece kaptan.ts'in ucretsiz sablon yorumuna dusulur.
  const [fallbackIds, setFallbackIds] = useState<Set<string>>(new Set());

  const loadRecommendations = () => {
    apiClient
      .getRecommendations()
      .then(setRecommendations)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadRecommendations();
  }, []);

  useEffect(() => {
    setLoadingHistory(true);
    apiClient
      .getSubjectHistory(user.mode)
      .then(setHistory)
      .finally(() => setLoadingHistory(false));
  }, [user.mode]);

  const handleGenerateInsight = async (subjectId: string) => {
    setGeneratingId(subjectId);
    try {
      const result = await apiClient.generateSubjectInsight(subjectId, user.mode);
      setHistory(prev =>
        prev.map(entry =>
          entry.subjectId === subjectId
            ? {
                ...entry,
                insight:
                  result.aiAvailable && result.content && result.updatedAt
                    ? { content: result.content, updatedAt: result.updatedAt }
                    : entry.insight,
              }
            : entry,
        ),
      );
      if (!result.aiAvailable) {
        // Gemini'e ulasilamadi (kredi/anahtar yok, hata) - baska bir ucretli modele
        // GECILMEZ, sadece bu bayrak isaretlenir ve render sirasinda kaptan.ts'in
        // ucretsiz sablon yorumuna dusulur.
        setFallbackIds(prev => new Set(prev).add(subjectId));
      }
    } finally {
      setGeneratingId(null);
    }
  };

  return (
    <div className="relative p-6 space-y-6 max-w-6xl mx-auto">
      <StarMap lineColor="#8B7CFF" starColor="#c4b8ff" />

      {/* Header */}
      <div className="relative">
        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border bg-brand-violet/10 border-brand-violet/30 text-brand-violet-hover dark:text-brand-violet">
          🤖 Machine Learning Recommendation Engine
        </span>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">
          AI Koç Tavsiyeleri & Spaced Repetition Analizi
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Random Forest ve Aralıklı Tekrar algoritmalarımızın çalışma oturumlarınızdan elde ettiği tahminler, ve Kaptan'ın ders/uğraş bazlı kişisel yorumları.
        </p>
      </div>

      {/* AI Recommendations List */}
      {loading && (
        <div className="relative flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Öneriler yükleniyor...</span>
        </div>
      )}

      {!loading && recommendations.length === 0 && (
        <div className="relative glass-panel p-6 rounded-2xl border border-brand-violet/30 bg-white dark:bg-slate-900/80 text-center space-y-1">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Kaptan henüz sana dair bir şey bilmiyor</h3>
          <p className="text-xs text-slate-700 dark:text-slate-300">
            Bir konu seç ve ilk mini kontrolünü yap, Kaptan sana özel önerilerini oluşturmaya başlasın.
          </p>
        </div>
      )}

      <div className="relative space-y-4">
        {recommendations.map(item => (
          <div key={item.id} className="glass-panel p-6 rounded-2xl border border-brand-violet/30 bg-white dark:bg-slate-900/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-brand-violet/20 text-brand-violet-hover dark:text-brand-violet border border-brand-violet/30">
                {TYPE_LABELS[item.type] ?? item.type}
              </span>
              {item.priority && (
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${PRIORITY_COLORS[item.priority]}`}>
                  {PRIORITY_LABELS[item.priority]}
                </span>
              )}
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-brand-violet-hover dark:text-brand-violet" />
              <span>{item.title}</span>
            </h3>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {item.content}
            </p>

            <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
              {item.subjectName && (
                <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-brand-pink-dark dark:text-brand-pink-light" />
                  <span>{item.subjectName}{item.topicName ? ` — ${item.topicName}` : ''}</span>
                </div>
              )}

              {item.topicId && (
                <button
                  onClick={() =>
                    setCheckTopic({
                      id: item.topicId as string,
                      name: item.topicName ?? '',
                      subjectName: item.subjectName ?? '',
                    })
                  }
                  className="ml-auto px-4 py-2 rounded-xl bg-brand-violet hover:bg-brand-violet-hover text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow-md glow-violet"
                >
                  <span>Kontrol Et</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Çalışma Geçmişi */}
      <div className="relative space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-violet-hover dark:text-brand-violet" />
            <span>{isStudent ? 'Ders Bazlı Çalışma Geçmişin' : 'Uğraş Bazlı Çalışma Geçmişin'}</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Her {isStudent ? 'ders' : 'uğraş'} için ne kadar odaklandığını (ya da hangi konuları çalıştığını) ve Kaptan'ın buna dair yorumunu burada gör.
          </p>
        </div>

        {loadingHistory && (
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Geçmiş yükleniyor...</span>
          </div>
        )}

        {!loadingHistory && history.length === 0 && (
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
            {isStudent ? 'Henüz kayıtlı bir çalışma geçmişin yok.' : 'Henüz kayıtlı bir uğraş geçmişin yok.'}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {history.map(entry => {
            const showFallback = fallbackIds.has(entry.subjectId) && !entry.insight;
            const fallback = showFallback ? getSubjectHistoryFallbackComment(entry, isStudent) : null;

            return (
              <div key={entry.subjectId} className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{entry.subjectName}</h4>

                {entry.displayMode === 'TIME' && entry.time ? (
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                    <div>
                      <span className="text-slate-400 dark:text-slate-500">Toplam süre</span>
                      <div className="font-bold text-slate-900 dark:text-slate-100">{(entry.time.totalMinutes / 60).toFixed(1)} sa</div>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500">Oturum sayısı</span>
                      <div className="font-bold text-slate-900 dark:text-slate-100">{entry.time.sessionCount}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500">Ort. verimlilik</span>
                      <div className="font-bold text-slate-900 dark:text-slate-100">{'⭐'.repeat(Math.round(entry.time.avgProductivity))}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500">Son çalışma</span>
                      <div className="font-bold text-slate-900 dark:text-slate-100">{new Date(entry.time.lastStudiedAt).toLocaleDateString('tr-TR')}</div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                      <ListChecks className="w-3.5 h-3.5" />
                      <span>Henüz süreli oturum yok, mini kontrol yapılan konular:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(entry.topics ?? []).map(topic => (
                        <span
                          key={topic.topicId}
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${topic.priority ? PRIORITY_COLORS[topic.priority] : 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400'}`}
                        >
                          {topic.topicName}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(entry.insight || fallback) && (
                  <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-4 py-3 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-brand-violet-hover dark:text-brand-violet">
                      <Compass className="w-3.5 h-3.5" />
                      <span>{entry.insight ? "Kaptan'ın Yorumu (Gemini AI)" : fallback?.title}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      {entry.insight?.content ?? fallback?.content}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => handleGenerateInsight(entry.subjectId)}
                  disabled={generatingId === entry.subjectId}
                  className="w-full py-2 rounded-xl bg-brand-violet/10 border border-brand-violet/30 text-brand-violet-hover dark:text-brand-violet font-semibold text-[11px] hover:bg-brand-violet/20 disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
                >
                  {generatingId === entry.subjectId ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  <span>{entry.insight ? 'Yorumu Yenile' : 'AI Yorumu Al'}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {checkTopic && (
        <TopicCheckModal
          topicId={checkTopic.id}
          topicName={checkTopic.name}
          subjectName={checkTopic.subjectName}
          onClose={() => {
            setCheckTopic(null);
            loadRecommendations();
          }}
        />
      )}
    </div>
  );
};
