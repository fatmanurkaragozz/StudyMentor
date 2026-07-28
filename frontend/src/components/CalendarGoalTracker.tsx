import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CalendarDays, Plus, Award, Target } from 'lucide-react';

export const CalendarGoalTracker: React.FC = () => {
  const { user, milestones, addMilestone } = useApp();
  const isStudent = user.mode === 'STUDENT';

  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [targetScore, setTargetScore] = useState<number>(500);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    addMilestone({
      title: title || (isStudent ? 'AYT Denemesi' : 'Yeni Proje Sprinti'),
      date: date || '2026-08-30',
      targetScore,
      type: isStudent ? 'EXAM' : 'PROJECT',
      details: [
        { subject: isStudent ? 'Matematik' : 'Backend', score: 35 },
        { subject: isStudent ? 'Fizik' : 'Frontend', score: 12 },
      ],
    });
    setShowAddModal(false);
    setTitle('');
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${
            isStudent ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          }`}>
            {isStudent ? '🎓 Deneme Sınavları & Net Analizi' : '💼 Proje Milestones & Hedef Puanlar'}
          </span>
          <h2 className="text-xl font-bold text-slate-100 mt-1">
            {isStudent ? 'Sınav & Net Takip Takvimi' : 'Kariyer & Proje Hedefleri Takvimi'}
          </h2>
          <p className="text-xs text-slate-400">
            {isStudent 
              ? 'Deneme sınavlarınızı kaydedin, ders bazlı netlerinizi ve puan grafiklerinizi izleyin.'
              : 'Yazılım ve kişisel gelişim projelerinizin dönüm noktalarını ve hedeflerini takip edin.'}
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className={`px-4 py-2.5 rounded-xl font-semibold text-xs text-white transition-all flex items-center gap-2 shadow-lg ${
            isStudent ? 'bg-indigo-600 hover:bg-indigo-500 glow-indigo' : 'bg-emerald-600 hover:bg-emerald-500 glow-emerald'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>{isStudent ? 'Yeni Sınav Ekle' : 'Yeni Proje Milestone Ekle'}</span>
        </button>
      </div>

      {/* Milestones Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {milestones.map(item => (
          <div key={item.id} className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/30 rounded">
                  {item.type === 'EXAM' ? 'Sınav Kaydı' : 'Proje Dönüm Noktası'}
                </span>
                <h3 className="text-base font-bold text-slate-100 mt-1.5">{item.title}</h3>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                  <CalendarDays className="w-3.5 h-3.5 text-slate-500" />
                  <span>{item.date}</span>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-400">Hedef Puan</div>
                <div className="text-xl font-bold text-indigo-400">{item.targetScore}</div>
              </div>
            </div>

            {/* Subject Net Details */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-2">
              <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-indigo-400" />
                <span>{item.type === 'EXAM' ? 'Ders Bazlı Net Dağılımı' : 'Modül İlerleme Detayları'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {item.details.map((d, idx) => (
                  <div key={idx} className="bg-slate-950 p-2 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400">{d.subject}:</span>
                    <span className="font-bold text-slate-200">{d.score} {item.type === 'EXAM' ? 'Net' : '%'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-2xl border border-slate-700 bg-slate-900 space-y-4">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-400" />
              <span>{isStudent ? 'Yeni Deneme Sınavı Ekle' : 'Yeni Proje / Hedef Ekle'}</span>
            </h3>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Başlık / Sınav Adı</label>
                <input
                  type="text"
                  placeholder={isStudent ? "Örn: YKS Türkiye Geneli Deneme #5" : "Örn: Machine Learning Microservice MVP"}
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Tarih</label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Hedef Puan / İlerleme Skoru</label>
                <input
                  type="number"
                  placeholder="500"
                  value={targetScore}
                  onChange={e => setTargetScore(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-slate-200 font-semibold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg glow-indigo"
                >
                  Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
