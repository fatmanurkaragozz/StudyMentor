import React, { useEffect, useState } from 'react';
import { BookOpen, Plus, Loader2, AlertCircle, Sparkles, Trash2 } from 'lucide-react';
import { apiClient, type MySubject } from '../lib/apiClient';
import { useApp } from '../context/AppContext';
import { TopicCheckModal } from './onboarding/TopicCheckModal';
import { MiniDecorScene } from './hero3d/decor/MiniDecorScene';
import { PottedPlant } from './hero3d/decor/PottedPlant';

export const MyCourses: React.FC = () => {
  const { user } = useApp();
  const isStudent = user.mode === 'STUDENT';

  const [subjects, setSubjects] = useState<MySubject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newCourseName, setNewCourseName] = useState('');
  const [addingCourse, setAddingCourse] = useState(false);

  const [topicDrafts, setTopicDrafts] = useState<Record<string, string>>({});
  const [addingTopicFor, setAddingTopicFor] = useState<string | null>(null);

  const [checkTopic, setCheckTopic] = useState<{ id: string; name: string; subjectName: string } | null>(null);
  const [deletingSubjectId, setDeletingSubjectId] = useState<string | null>(null);

  const loadSubjects = () => {
    setLoading(true);
    apiClient
      .getMySubjects()
      .then(setSubjects)
      .catch(err => setError(err instanceof Error ? err.message : 'Yüklenemedi'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSubjects();
  }, []);

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim()) return;
    setAddingCourse(true);
    setError(null);
    try {
      await apiClient.createCustomSubject({ name: newCourseName.trim() });
      setNewCourseName('');
      loadSubjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Eklenemedi');
    } finally {
      setAddingCourse(false);
    }
  };

  const handleDeleteSubject = async (subjectId: string, subjectName: string) => {
    const label = isStudent ? 'dersi' : 'uğraşı';
    if (!window.confirm(`"${subjectName}" ${label} silmek istediğine emin misin? Bu derse ait tüm konular ve çalışma kayıtları da silinecek.`)) {
      return;
    }
    setDeletingSubjectId(subjectId);
    setError(null);
    try {
      await apiClient.deleteSubject(subjectId);
      loadSubjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Silinemedi');
    } finally {
      setDeletingSubjectId(null);
    }
  };

  const handleAddTopic = async (subjectId: string) => {
    const name = (topicDrafts[subjectId] ?? '').trim();
    if (!name) return;
    setAddingTopicFor(subjectId);
    setError(null);
    try {
      await apiClient.addTopic(subjectId, name);
      setTopicDrafts(prev => ({ ...prev, [subjectId]: '' }));
      loadSubjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Konu eklenemedi');
    } finally {
      setAddingTopicFor(null);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${
          isStudent ? 'bg-brand-pink-dark/10 border-brand-pink-dark/30 text-brand-pink-dark dark:text-brand-pink-light' : 'bg-brand-mint-dark/10 border-brand-mint-dark/30 text-brand-mint-dark dark:text-brand-mint'
        }`}>
          {isStudent ? '🎓 Kendi Ders Listem' : '💼 Kendi Uğraş Listem'}
        </span>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-1">{isStudent ? 'Derslerim' : 'Uğraşlarım'}</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          {isStudent
            ? 'Bu dönem aldığın dersleri ekle, her dersin altına çalıştığın konuları işle. Takvim sekmesinde ders programı ve sınav eklerken buradaki derslerden seçeceksin.'
            : 'Üzerinde çalıştığın uğraşları/projeleri ekle, her birinin altına alt başlıkları işle. Takvim sekmesinde program ve hedef eklerken buradaki uğraşlardan seçeceksin.'}
        </p>
      </div>

      <form onSubmit={handleAddCourse} className="glass-panel p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center gap-3">
        <input
          type="text"
          placeholder={isStudent ? 'Örn: Veri Tabanları Yönetimi' : 'Örn: Gitar Öğrenme, Kişisel Blog Projesi'}
          value={newCourseName}
          onChange={e => setNewCourseName(e.target.value)}
          className={`flex-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-sm text-slate-900 dark:text-slate-200 focus:outline-none ${isStudent ? 'focus:border-brand-pink-dark' : 'focus:border-brand-mint-dark'}`}
        />
        <button
          type="submit"
          disabled={addingCourse || !newCourseName.trim()}
          className={`w-full sm:w-auto px-4 py-2.5 rounded-xl disabled:opacity-50 text-white font-semibold text-xs shadow-md flex items-center justify-center gap-2 shrink-0 transition-all ${
            isStudent
              ? 'bg-gradient-to-r from-brand-pink-light to-brand-pink-dark hover:opacity-90 glow-pink'
              : 'bg-gradient-to-r from-brand-mint to-brand-mint-dark hover:opacity-90 glow-mint'
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>{isStudent ? 'Ders Ekle' : 'Uğraş Ekle'}</span>
        </button>
      </form>

      {error && (
        <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs bg-rose-500/10 border border-rose-500/30 rounded-xl px-3 py-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center gap-2 py-10 text-slate-500 dark:text-slate-400 text-sm">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Dersler yükleniyor...</span>
        </div>
      )}

      {!loading && subjects.length === 0 && !error && (
        <div className="relative glass-panel p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
          <MiniDecorScene className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-20" cameraPosition={[0, 0.4, 2.4]}>
            <PottedPlant position={[0, -0.1, 0]} scale={1.3} />
          </MiniDecorScene>
          {isStudent
            ? 'Henüz ders eklemedin. Yukarıdaki formdan ilk dersini ekleyerek başla.'
            : 'Henüz uğraş eklemedin. Yukarıdaki formdan ilk uğraşını ekleyerek başla.'}
        </div>
      )}

      <div className="space-y-4">
        {subjects.map(subject => (
          <div key={subject.subjectId} className="glass-panel p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <BookOpen className={`w-4 h-4 ${isStudent ? 'text-brand-pink-dark dark:text-brand-pink-light' : 'text-brand-mint-dark dark:text-brand-mint'}`} />
                <span>{subject.subjectName}</span>
              </h3>
              <button
                type="button"
                onClick={() => handleDeleteSubject(subject.subjectId, subject.subjectName)}
                disabled={deletingSubjectId === subject.subjectId}
                title={isStudent ? 'Dersi Sil' : 'Uğraşı Sil'}
                className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 disabled:opacity-40 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {subject.topics.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {subject.topics.map(topic => (
                  <button
                    key={topic.id}
                    type="button"
                    onClick={() => setCheckTopic({ id: topic.id, name: topic.name, subjectName: subject.subjectName })}
                    className="group flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-brand-gold-dark/50 hover:text-brand-gold-dark dark:hover:text-brand-gold transition-all"
                  >
                    <span>{topic.name}</span>
                    <Sparkles className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Yeni konu ekle (örn: Normalizasyon)"
                value={topicDrafts[subject.subjectId] ?? ''}
                onChange={e => setTopicDrafts(prev => ({ ...prev, [subject.subjectId]: e.target.value }))}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTopic(subject.subjectId);
                  }
                }}
                className={`flex-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none ${isStudent ? 'focus:border-brand-pink-dark' : 'focus:border-brand-mint-dark'}`}
              />
              <button
                type="button"
                onClick={() => handleAddTopic(subject.subjectId)}
                disabled={addingTopicFor === subject.subjectId || !(topicDrafts[subject.subjectId] ?? '').trim()}
                className="px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-50 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all"
              >
                Ekle
              </button>
            </div>
          </div>
        ))}
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
