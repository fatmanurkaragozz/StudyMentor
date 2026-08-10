import React, { useEffect, useRef, useState } from 'react';
import { X, RotateCcw, CheckCircle2, XCircle, Loader2, AlertCircle, Sparkles, Compass } from 'lucide-react';
import { apiClient, type RecommendationResult } from '../../lib/apiClient';
import { useApp } from '../../context/AppContext';
import { getKaptanMessage } from '../../lib/kaptan';
import { PRIORITY_LABELS, PRIORITY_COLORS } from './priorityLabels';

interface TopicCheckModalProps {
  topicId: string;
  topicName: string;
  subjectName: string;
  onClose: () => void;
}

type Stage = 'LOADING' | 'ERROR_START' | 'ACTIVE' | 'SELF_GRADE' | 'SUBMITTING' | 'RESULT' | 'ERROR_SUBMIT';

export const TopicCheckModal: React.FC<TopicCheckModalProps> = ({ topicId, topicName, subjectName, onClose }) => {
  const { user } = useApp();
  const [stage, setStage] = useState<Stage>('LOADING');
  const [checkId, setCheckId] = useState<string | null>(null);
  const [attemptCount, setAttemptCount] = useState(1);
  const [msFirstResponse, setMsFirstResponse] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<RecommendationResult | null>(null);

  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    let cancelled = false;
    apiClient
      .startTopicCheck(topicId)
      .then(res => {
        if (cancelled) return;
        setCheckId(res.checkId);
        startTimeRef.current = Date.now();
        setStage('ACTIVE');
      })
      .catch(err => {
        if (cancelled) return;
        setErrorMessage(err instanceof Error ? err.message : 'Kontrol başlatılamadı');
        setStage('ERROR_START');
      });
    return () => {
      cancelled = true;
    };
  }, [topicId]);

  const recordFirstResponse = () => {
    setMsFirstResponse(prev => (prev === null ? Date.now() - startTimeRef.current : prev));
  };

  const handleRetry = () => {
    recordFirstResponse();
    setAttemptCount(c => c + 1);
  };

  const handleFinish = () => {
    recordFirstResponse();
    setStage('SELF_GRADE');
  };

  const handleSelfGrade = async (selfGradedCorrect: boolean) => {
    if (!checkId) return;
    setStage('SUBMITTING');
    const overlapTimeMs = Date.now() - startTimeRef.current;
    try {
      const res = await apiClient.submitTopicCheck(checkId, {
        attemptCount,
        hintCount: 0,
        msFirstResponse: msFirstResponse ?? overlapTimeMs,
        overlapTimeMs,
        selfGradedCorrect,
      });
      setResult(res);
      setStage('RESULT');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Sonuç kaydedilemedi');
      setStage('ERROR_SUBMIT');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[60] flex items-center justify-center p-4">
      <div className="glass-panel max-w-md w-full p-6 rounded-3xl border border-amber-500/20 text-slate-900 dark:text-slate-100 shadow-2xl relative space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-full bg-slate-200/60 dark:bg-slate-800/50 hover:bg-slate-300 dark:hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500 dark:text-amber-400">{subjectName}</span>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{topicName}</h3>
        </div>

        {stage === 'LOADING' && (
          <div className="flex items-center justify-center gap-2 py-10 text-slate-500 dark:text-slate-400 text-sm">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Mini kontrol hazırlanıyor...</span>
          </div>
        )}

        {stage === 'ERROR_START' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs"
            >
              Kapat
            </button>
          </div>
        )}

        {stage === 'ACTIVE' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Bu konuyu şu an ne kadar hatırladığını kendi kendine değerlendir. Gerekirse tekrar dene, hazır olduğunda bitir.
            </p>

            <div className="flex items-center gap-2 text-[10px] text-slate-500">
              <span>Deneme: {attemptCount}</span>
            </div>

            <button
              type="button"
              onClick={handleRetry}
              className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Tekrar Dene</span>
            </button>

            <button
              type="button"
              onClick={handleFinish}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-bold text-xs shadow-lg glow-amber transition-all"
            >
              Bitir
            </button>
          </div>
        )}

        {stage === 'SELF_GRADE' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-700 dark:text-slate-300">Bu konuyu doğru şekilde hatırlayabildin mi?</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSelfGrade(true)}
                className="py-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-emerald-500/25 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Doğru Yaptım</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelfGrade(false)}
                className="py-3 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-700 dark:text-rose-300 font-semibold text-xs flex items-center justify-center gap-2 hover:bg-rose-500/25 transition-all"
              >
                <XCircle className="w-4 h-4" />
                <span>Yanlış Yaptım</span>
              </button>
            </div>
          </div>
        )}

        {stage === 'SUBMITTING' && (
          <div className="flex items-center justify-center gap-2 py-10 text-slate-500 dark:text-slate-400 text-sm">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Sonuç değerlendiriliyor...</span>
          </div>
        )}

        {stage === 'ERROR_SUBMIT' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs"
            >
              Kapat
            </button>
          </div>
        )}

        {stage === 'RESULT' && result && (
          <div className="space-y-4">
            {result.mlAvailable && result.priority ? (
              <div className={`rounded-xl border px-4 py-3 space-y-1 ${PRIORITY_COLORS[result.priority]}`}>
                <div className="flex items-center gap-2 font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>{PRIORITY_LABELS[result.priority]}</span>
                </div>
                {result.correctProbability !== null && (
                  <p className="text-[11px] opacity-80">
                    Tahmini başarı olasılığı: %{Math.round(result.correctProbability * 100)}
                  </p>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-950 px-4 py-3 text-[11px] text-slate-500 dark:text-slate-400">
                ML servisi şu anda ulaşılamıyor durumda, ancak verilerin kaydedildi.
              </div>
            )}

            {result.recommendation && (
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 px-4 py-3 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-purple-500 dark:text-purple-400">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Kaptan</span>
                </div>
                {(() => {
                  const message = result.priority
                    ? getKaptanMessage({
                        id: result.recommendation.id,
                        firstName: user.name.split(' ')[0],
                        priority: result.priority,
                        topicName,
                        subjectName,
                      })
                    : result.recommendation;
                  return (
                    <>
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-200">{message.title}</div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{message.content}</p>
                    </>
                  );
                })()}
              </div>
            )}

            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-all"
            >
              Kapat
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
