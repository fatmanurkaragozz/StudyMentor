import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Play, Pause, RotateCcw, CheckCircle2, Star, Sparkles, SlidersHorizontal } from 'lucide-react';

export const StudyPlanner: React.FC = () => {
  const { user, subjectsOrProjects, addSession } = useApp();
  const isStudent = user.mode === 'STUDENT';

  // Timer states
  const [secondsLeft, setSecondsLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [timerMode, setTimerMode] = useState<'POMODORO' | 'SHORT_BREAK' | 'LONG_BREAK' | 'CUSTOM'>('POMODORO');

  // Form states for log modal
  const [selectedSubject, setSelectedSubject] = useState<string>(subjectsOrProjects[0]?.name || '');
  const [sessionTitle, setSessionTitle] = useState<string>('');
  const [difficulty, setDifficulty] = useState<number>(3);
  const [productivity, setProductivity] = useState<number>(5);
  const [notes, setNotes] = useState<string>('');
  const [showCompleteModal, setShowCompleteModal] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (isRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft(prev => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0 && isRunning) {
      setIsRunning(false);
      setShowCompleteModal(true);
    }
    return () => clearInterval(interval);
  }, [isRunning, secondsLeft]);

  const switchMode = (mode: 'POMODORO' | 'SHORT_BREAK' | 'LONG_BREAK') => {
    setIsRunning(false);
    setTimerMode(mode);
    if (mode === 'POMODORO') setSecondsLeft(25 * 60);
    if (mode === 'SHORT_BREAK') setSecondsLeft(5 * 60);
    if (mode === 'LONG_BREAK') setSecondsLeft(15 * 60);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleSaveSession = (e: React.FormEvent) => {
    e.preventDefault();
    const durationMins = Math.max(1, Math.round((25 * 60 - secondsLeft) / 60)) || 25;
    addSession({
      title: sessionTitle || (isStudent ? 'Ders Çalışma Oturumu' : 'Proje Odaklanma Oturumu'),
      subjectOrProjectName: selectedSubject || subjectsOrProjects[0]?.name,
      durationMinutes: durationMins,
      difficulty,
      productivity,
      notes,
    });
    setShowCompleteModal(false);
    setSessionTitle('');
    setNotes('');
    setSecondsLeft(25 * 60);
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${
            isStudent ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
          }`}>
            {isStudent ? '🎓 Ders & Konu Odaklanması' : '💼 Proje & Beceriler Zamanlayıcısı'}
          </span>
          <h2 className="text-xl font-bold text-slate-100 mt-1">
            {isStudent ? 'Çalışma & Pomodoro Zirvesi' : 'Derin Odaklanma (Deep Work) Zamanlayıcısı'}
          </h2>
          <p className="text-xs text-slate-400">
            Odaklanma sürenizi takip edin, oturum sonunda zorluk ve verimlilik verilerini kaydederek AI modelini eğitin.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Timer Box */}
        <div className="lg:col-span-2 glass-panel p-8 rounded-2xl border border-slate-800 flex flex-col items-center justify-center space-y-6 text-center">
          {/* Mode Tabs */}
          <div className="flex items-center gap-2 p-1.5 bg-slate-900/90 border border-slate-800 rounded-xl">
            <button
              onClick={() => switchMode('POMODORO')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                timerMode === 'POMODORO' ? (isStudent ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white') : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Odak (25dk)
            </button>
            <button
              onClick={() => switchMode('SHORT_BREAK')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                timerMode === 'SHORT_BREAK' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Kısa Mola (5dk)
            </button>
            <button
              onClick={() => switchMode('LONG_BREAK')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                timerMode === 'LONG_BREAK' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Uzun Mola (15dk)
            </button>
          </div>

          {/* Big Time Display */}
          <div className="relative my-4">
            <div className="text-7xl md:text-8xl font-black text-slate-100 tracking-wider font-mono">
              {formatTime(secondsLeft)}
            </div>
            <div className="text-xs text-slate-400 mt-2 font-medium">
              {isRunning ? '🔥 Derin Odaklanma Süreci Devam Ediyor...' : 'Zamanlayıcı Duraklatıldı'}
            </div>
          </div>

          {/* Timer Action Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className={`w-14 h-14 rounded-2xl text-white flex items-center justify-center shadow-xl transition-all transform active:scale-95 ${
                isRunning 
                  ? 'bg-amber-600 hover:bg-amber-500' 
                  : isStudent 
                    ? 'bg-indigo-600 hover:bg-indigo-500 glow-indigo' 
                    : 'bg-emerald-600 hover:bg-emerald-500 glow-emerald'
              }`}
            >
              {isRunning ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white ml-0.5" />}
            </button>

            <button
              onClick={() => {
                setIsRunning(false);
                setSecondsLeft(25 * 60);
              }}
              className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 flex items-center justify-center transition-all"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            <button
              onClick={() => setShowCompleteModal(true)}
              className="px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-semibold text-xs hover:bg-emerald-500/20 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Oturumu Kaydet</span>
            </button>
          </div>
        </div>

        {/* Right Sidebar: Subject Picker & AI Tip */}
        <div className="space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-indigo-400" />
              <span>{isStudent ? 'Ders / Konu Seçimi' : 'Proje / Odak Alanı'}</span>
            </h3>

            <div className="space-y-2">
              {subjectsOrProjects.map(item => (
                <button
                  key={item.id}
                  onClick={() => setSelectedSubject(item.name)}
                  className={`w-full text-left p-3 rounded-xl border text-xs font-medium transition-all ${
                    selectedSubject === item.name
                      ? isStudent 
                        ? 'bg-indigo-600/20 border-indigo-500/50 text-slate-100' 
                        : 'bg-emerald-600/20 border-emerald-500/50 text-slate-100'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="font-semibold text-slate-200">{item.name}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{item.category} • İlerleme %{item.progress}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-amber-500/30 bg-amber-950/10 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
              <Sparkles className="w-4 h-4" />
              <span>ML Algoritma Hatırlatması</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Oturum sonundaki zorluk (1-5) ve verim (1-5) puanlaması, Spaced Repetition (Aralıklı Tekrar) algoritmasının bir sonraki tekrar tarihinizi hesaplaması için kritiktir.
            </p>
          </div>
        </div>
      </div>

      {/* Save Session Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-2xl border border-slate-700 bg-slate-900 space-y-4">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>Çalışma Oturumunu Kaydet</span>
            </h3>

            <form onSubmit={handleSaveSession} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Çalışılan Başlık / Not</label>
                <input
                  type="text"
                  placeholder={isStudent ? "Örn: Türev Alma Kuralları Soru Çözümü" : "Örn: FastAPI Middleware Yapılandırması"}
                  value={sessionTitle}
                  onChange={e => setSessionTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Ders veya Proje</label>
                <select
                  value={selectedSubject}
                  onChange={e => setSelectedSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  {subjectsOrProjects.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Difficulty Rating */}
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Zorluk Algısı (1: Çok Kolay - 5: Çok Zor)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setDifficulty(star)}
                      className={`p-2 rounded-lg border transition-all ${
                        difficulty >= star ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' : 'bg-slate-950 border-slate-800 text-slate-600'
                      }`}
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Productivity Rating */}
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Verimlilik Algısı (1: Düşük - 5: Zirve Odak)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setProductivity(star)}
                      className={`p-2 rounded-lg border transition-all ${
                        productivity >= star ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400' : 'bg-slate-950 border-slate-800 text-slate-600'
                      }`}
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Ek Notlar (Opsiyonel)</label>
                <textarea
                  placeholder="Eksik kalan kısımlar veya sonraki tekrar için notlar..."
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-indigo-500 h-20 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-slate-200 font-semibold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg glow-indigo"
                >
                  Veritabanına Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
