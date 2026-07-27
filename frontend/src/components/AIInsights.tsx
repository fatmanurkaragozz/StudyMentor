import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, BrainCircuit, Calendar, ExternalLink, ArrowRight } from 'lucide-react';

export const AIInsights: React.FC = () => {
  const { user, recommendations } = useApp();
  const isStudent = user.mode === 'STUDENT';

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border bg-purple-500/10 border-purple-500/30 text-purple-300">
          🤖 Machine Learning Recommendation Engine
        </span>
        <h2 className="text-xl font-bold text-slate-100 mt-1">
          AI Koç Tavsiyeleri & Spaced Repetition Analizi
        </h2>
        <p className="text-xs text-slate-400">
          Random Forest ve Aralıklı Tekrar algoritmalarımızın çalışma oturumlarınızdan elde ettiği tahmin ve yönlendirmeler.
        </p>
      </div>

      {/* AI Recommendations List */}
      <div className="space-y-4">
        {recommendations.map(item => (
          <div key={item.id} className="glass-panel p-6 rounded-2xl border border-purple-500/30 bg-slate-900/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {item.type === 'REVISION' ? 'Aralıklı Tekrar Önerisi (Spaced Repetition)' : 'Derin Odaklanma Tavsiyesi'}
              </span>
              <span className="text-xs text-slate-400">Model Doğruluk Skoru: %94.2</span>
            </div>

            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-purple-400" />
              <span>{item.title}</span>
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              {item.content}
            </p>

            <div className="pt-2 flex items-center justify-between border-t border-slate-800">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>Hesaplanan Bir Sonraki Optimal Tekrar: <b>25 Temmuz 2026</b></span>
              </div>

              <button className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all flex items-center gap-1.5 shadow-md glow-purple">
                <span>{item.actionText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Recommended External Resources Box */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{isStudent ? 'Sizin Seviyenize Özel Önerilen Ders Kaynakları' : 'Seviyenize Özel Önerilen Proje & Eğitim Kaynakları'}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200">{isStudent ? 'BTK Akademi - AYT Matematik Kampı' : 'BTK Akademi - Modern Python Microservices'}</span>
              <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <p className="text-[11px] text-slate-400">Zorlandığınız konular üzerine algoritma tarafından eşleştirilmiş ücretsiz video eğitim seti.</p>
          </div>

          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-200">{isStudent ? 'YouTube - Türev Özel Soru Bankası Çözümleri' : 'FastAPI Official Async Patterns Guide'}</span>
              <ExternalLink className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <p className="text-[11px] text-slate-400">Pratik seviyenizi artırmak için AI tarafından önceliklendirilmiş rehber içerik.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
