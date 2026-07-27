import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Flame, BookOpen, Plus, Check, Sparkles } from 'lucide-react';
import type { JournalEntry } from '../types';

export const GrowthHub: React.FC = () => {
  const { habits, toggleHabit, addHabit, journals, addJournalEntry } = useApp();

  const [newHabitName, setNewHabitName] = useState<string>('');
  const [showAddHabit, setShowAddHabit] = useState<boolean>(false);

  const [journalContent, setJournalContent] = useState<string>('');
  const [selectedMood, setSelectedMood] = useState<JournalEntry['mood']>('🚀');

  const past5Days = ['2026-07-19', '2026-07-20', '2026-07-21', '2026-07-22', '2026-07-23'];

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName) return;
    addHabit(newHabitName, 'Gelişim');
    setNewHabitName('');
    setShowAddHabit(false);
  };

  const handleCreateJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalContent) return;
    addJournalEntry(journalContent, selectedMood);
    setJournalContent('');
  };

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border bg-pink-500/10 border-pink-500/30 text-pink-300">
          🌱 Growth Hub & Personal Analytics
        </span>
        <h2 className="text-xl font-bold text-slate-100 mt-1">
          Alışkanlık Matrisi & AI Destekli Günlük (Journal)
        </h2>
        <p className="text-xs text-slate-400">
          Disiplinini korumak için zinciri kırma, günlüğünü yazarak AI sentiment (duygu) skorunu ölçümle.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Habit Tracker Section */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Flame className="w-4 h-4 text-pink-500" />
              <span>Günlük Alışkanlık Zinciri (Habits)</span>
            </h3>
            <button
              onClick={() => setShowAddHabit(true)}
              className="text-xs text-pink-400 hover:text-pink-300 flex items-center gap-1 font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Alışkanlık Ekle</span>
            </button>
          </div>

          <div className="space-y-3">
            {habits.map(habit => (
              <div key={habit.id} className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">{habit.name}</span>
                  <div className="flex items-center gap-1 text-pink-400 font-bold text-[11px]">
                    <Flame className="w-3.5 h-3.5 fill-pink-500" />
                    <span>{habit.streakDays} Gün Streak</span>
                  </div>
                </div>

                {/* Day Checkboxes */}
                <div className="flex items-center justify-between pt-1">
                  {past5Days.map(dayStr => {
                    const isDone = habit.completedDates.includes(dayStr);
                    return (
                      <button
                        key={dayStr}
                        onClick={() => toggleHabit(habit.id, dayStr)}
                        className={`w-9 h-9 rounded-lg border flex items-center justify-center transition-all ${
                          isDone
                            ? 'bg-pink-600 border-pink-500 text-white shadow-md glow-purple'
                            : 'bg-slate-950 border-slate-800 text-slate-600 hover:border-slate-700'
                        }`}
                      >
                        {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : <span className="text-[10px]">{dayStr.split('-')[2]}</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Journal & Mood Section */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-400" />
            <span>Günlük Yazma & AI Duygu Analizi</span>
          </h3>

          <form onSubmit={handleCreateJournal} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-300 mb-1.5 font-semibold">Bugünkü Ruh Halini Seç (Mood)</label>
              <div className="flex items-center gap-3">
                {(['🚀', '😊', '😐', '😔', '😴'] as const).map(emoji => (
                  <button
                    type="button"
                    key={emoji}
                    onClick={() => setSelectedMood(emoji)}
                    className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border transition-all ${
                      selectedMood === emoji
                        ? 'bg-purple-600/30 border-purple-500 scale-110 shadow-md'
                        : 'bg-slate-950 border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1.5 font-semibold">Bugünün Değerlendirmesi & Notlar</label>
              <textarea
                placeholder="Bugün seni ne motive etti? Hangi konularda ilerleme kaydettin?.."
                value={journalContent}
                onChange={e => setJournalContent(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-purple-500 h-24 resize-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-lg glow-purple flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Günlüğü Kaydet & AI Sentiment Analizi Yap</span>
            </button>
          </form>

          {/* Past Journal Entries */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-semibold text-slate-300">Geçmiş Günlük Kayıtları</h4>
            {journals.map(entry => (
              <div key={entry.id} className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{entry.mood}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{entry.createdAt}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                    <span>AI Sentiment: {entry.sentimentScore}</span>
                  </div>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">{entry.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Habit Modal */}
      {showAddHabit && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-2xl border border-slate-700 bg-slate-900 space-y-4">
            <h3 className="text-lg font-bold text-slate-100">Yeni Alışkanlık Ekle</h3>
            <form onSubmit={handleCreateHabit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-semibold">Alışkanlık Adı</label>
                <input
                  type="text"
                  placeholder="Örn: 2 Litre Su İçme, 30dk İngilizce"
                  value={newHabitName}
                  onChange={e => setNewHabitName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-pink-500"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddHabit(false)}
                  className="px-4 py-2 text-slate-400 font-semibold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-semibold shadow-lg"
                >
                  Alışkanlığı Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
