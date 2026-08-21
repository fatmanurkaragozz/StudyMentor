import React, { useEffect, useState } from 'react';
import { BookOpen, Plus, Loader2, AlertCircle, Sparkles, Trash2, Pencil, ChevronDown, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import { apiClient, type MySubject, type MyTopic } from '../lib/apiClient';
import { useApp } from '../context/AppContext';
import { TopicCheckModal } from './onboarding/TopicCheckModal';
import { MiniDecorScene } from './hero3d/decor/MiniDecorScene';
import { PottedPlant } from './hero3d/decor/PottedPlant';

const PAGE_SIZE = 8;

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

  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(null);

  const [renamingSubjectId, setRenamingSubjectId] = useState<string | null>(null);
  const [subjectNameDraft, setSubjectNameDraft] = useState('');
  const [savingSubjectId, setSavingSubjectId] = useState<string | null>(null);

  const [renamingTopicId, setRenamingTopicId] = useState<string | null>(null);
  const [topicNameDraft, setTopicNameDraft] = useState('');
  const [savingTopicId, setSavingTopicId] = useState<string | null>(null);
  const [deletingTopicId, setDeletingTopicId] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);

  const loadSubjects = () => {
    setLoading(true);
    apiClient
      .getMySubjects(user.mode)
      .then(setSubjects)
      .catch(err => setError(err instanceof Error ? err.message : 'Yüklenemedi'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSubjects();
  }, [user.mode]);

  const totalPages = Math.max(1, Math.ceil(subjects.length / PAGE_SIZE));
  useEffect(() => {
    setCurrentPage(p => Math.min(p, totalPages));
  }, [totalPages]);
  const pagedSubjects = subjects.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim()) return;
    setAddingCourse(true);
    setError(null);
    try {
      await apiClient.createCustomSubject({ name: newCourseName.trim(), mode: user.mode });
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

  const startRenameSubject = (subject: MySubject) => {
    setRenamingSubjectId(subject.subjectId);
    setSubjectNameDraft(subject.subjectName);
  };

  const cancelRenameSubject = () => {
    setRenamingSubjectId(null);
    setSubjectNameDraft('');
  };

  const handleRenameSubject = async (subjectId: string) => {
    const name = subjectNameDraft.trim();
    if (!name) return;
    setSavingSubjectId(subjectId);
    setError(null);
    try {
      await apiClient.renameSubject(subjectId, name);
      setRenamingSubjectId(null);
      setSubjectNameDraft('');
      loadSubjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Güncellenemedi');
    } finally {
      setSavingSubjectId(null);
    }
  };

  const startRenameTopic = (topic: MyTopic) => {
    setRenamingTopicId(topic.id);
    setTopicNameDraft(topic.name);
  };

  const cancelRenameTopic = () => {
    setRenamingTopicId(null);
    setTopicNameDraft('');
  };

  const handleRenameTopic = async (subjectId: string, topicId: string) => {
    const name = topicNameDraft.trim();
    if (!name) return;
    setSavingTopicId(topicId);
    setError(null);
    try {
      await apiClient.renameTopic(subjectId, topicId, name);
      setRenamingTopicId(null);
      setTopicNameDraft('');
      loadSubjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Güncellenemedi');
    } finally {
      setSavingTopicId(null);
    }
  };

  const handleDeleteTopic = async (subjectId: string, topicId: string, topicName: string) => {
    if (!window.confirm(`"${topicName}" konusunu silmek istediğine emin misin?`)) return;
    setDeletingTopicId(topicId);
    setError(null);
    try {
      await apiClient.deleteTopic(subjectId, topicId);
      loadSubjects();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Silinemedi');
    } finally {
      setDeletingTopicId(null);
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

  const accentFocusClass = isStudent ? 'focus:border-brand-pink-dark' : 'focus:border-brand-mint-dark';
  const accentTextClass = isStudent ? 'text-brand-pink-dark dark:text-brand-pink-light' : 'text-brand-mint-dark dark:text-brand-mint';
  const accentGradientClass = isStudent
    ? 'bg-gradient-to-r from-brand-pink-light to-brand-pink-dark'
    : 'bg-gradient-to-r from-brand-mint to-brand-mint-dark';

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
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
          className={`flex-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-2.5 text-sm text-slate-900 dark:text-slate-200 focus:outline-none ${accentFocusClass}`}
        />
        <button
          type="submit"
          disabled={addingCourse || !newCourseName.trim()}
          className={`w-full sm:w-auto px-4 py-2.5 rounded-xl disabled:opacity-50 text-white font-semibold text-xs shadow-md flex items-center justify-center gap-2 shrink-0 transition-all ${accentGradientClass} ${
            isStudent ? 'hover:opacity-90 glow-pink' : 'hover:opacity-90 glow-mint'
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

      {!loading && subjects.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[480px] glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 text-xs border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="w-10 px-3 py-3"></th>
                <th className="px-3 py-3">{isStudent ? 'Ders' : 'Uğraş'}</th>
                <th className="px-3 py-3">Konu</th>
                <th className="px-3 py-3 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {pagedSubjects.map(subject => {
                const isExpanded = expandedSubjectId === subject.subjectId;
                const isRenaming = renamingSubjectId === subject.subjectId;
                return (
                  <React.Fragment key={subject.subjectId}>
                    <tr className="border-t border-slate-200 dark:border-slate-800">
                      <td className="px-3 py-3">
                        <button
                          type="button"
                          onClick={() => setExpandedSubjectId(isExpanded ? null : subject.subjectId)}
                          className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-all"
                        >
                          <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </button>
                      </td>
                      <td className="px-3 py-3">
                        {isRenaming ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              autoFocus
                              type="text"
                              value={subjectNameDraft}
                              onChange={e => setSubjectNameDraft(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleRenameSubject(subject.subjectId);
                                }
                                if (e.key === 'Escape') cancelRenameSubject();
                              }}
                              className={`flex-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-2 py-1.5 text-xs text-slate-900 dark:text-slate-200 focus:outline-none ${accentFocusClass}`}
                            />
                            <button
                              type="button"
                              onClick={() => handleRenameSubject(subject.subjectId)}
                              disabled={savingSubjectId === subject.subjectId || !subjectNameDraft.trim()}
                              className="p-1.5 rounded-lg text-brand-mint-dark dark:text-brand-mint hover:bg-brand-mint-dark/10 disabled:opacity-40 transition-all"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={cancelRenameSubject}
                              className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 transition-all"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                            <BookOpen className={`w-4 h-4 shrink-0 ${accentTextClass}`} />
                            <span>{subject.subjectName}</span>
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-slate-500 dark:text-slate-400">{subject.topics.length} konu</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => startRenameSubject(subject)}
                            title={isStudent ? 'Dersi Düzenle' : 'Uğraşı Düzenle'}
                            className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 transition-all"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSubject(subject.subjectId, subject.subjectName)}
                            disabled={deletingSubjectId === subject.subjectId}
                            title={isStudent ? 'Dersi Sil' : 'Uğraşı Sil'}
                            className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 disabled:opacity-40 transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
                        <td colSpan={4} className="px-4 py-4">
                          {subject.topics.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {subject.topics.map(topic => {
                                const isTopicRenaming = renamingTopicId === topic.id;
                                return isTopicRenaming ? (
                                  <div
                                    key={topic.id}
                                    className="flex items-center gap-1 px-1.5 py-1 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800"
                                  >
                                    <input
                                      autoFocus
                                      type="text"
                                      value={topicNameDraft}
                                      onChange={e => setTopicNameDraft(e.target.value)}
                                      onKeyDown={e => {
                                        if (e.key === 'Enter') {
                                          e.preventDefault();
                                          handleRenameTopic(subject.subjectId, topic.id);
                                        }
                                        if (e.key === 'Escape') cancelRenameTopic();
                                      }}
                                      className="w-32 bg-transparent text-[11px] text-slate-900 dark:text-slate-200 focus:outline-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleRenameTopic(subject.subjectId, topic.id)}
                                      disabled={savingTopicId === topic.id || !topicNameDraft.trim()}
                                      className="p-0.5 text-brand-mint-dark dark:text-brand-mint hover:opacity-80 disabled:opacity-40 transition-all"
                                    >
                                      <Check className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={cancelRenameTopic}
                                      className="p-0.5 text-slate-400 dark:text-slate-500 hover:text-rose-500 transition-all"
                                    >
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                ) : (
                                  <div
                                    key={topic.id}
                                    className="group flex items-center gap-1 text-[11px] font-medium pl-2.5 pr-1 py-1 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300"
                                  >
                                    <button
                                      type="button"
                                      onClick={() => setCheckTopic({ id: topic.id, name: topic.name, subjectName: subject.subjectName })}
                                      className="flex items-center gap-1.5 hover:text-brand-gold-dark dark:hover:text-brand-gold transition-all"
                                    >
                                      <span>{topic.name}</span>
                                      <Sparkles className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => startRenameTopic(topic)}
                                      className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 transition-all"
                                    >
                                      <Pencil className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteTopic(subject.subjectId, topic.id, topic.name)}
                                      disabled={deletingTopicId === topic.id}
                                      className="p-1 text-slate-400 dark:text-slate-500 hover:text-rose-500 disabled:opacity-40 transition-all"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                );
                              })}
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
                              className={`flex-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-900 dark:text-slate-200 focus:outline-none ${accentFocusClass}`}
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
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {!loading && subjects.length > 0 && totalPages > 1 && (
        <div className="glass-panel rounded-2xl border border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between gap-2 text-xs">
          <span className="text-slate-500 dark:text-slate-400">
            {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, subjects.length)} / {subjects.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-slate-200 transition-all"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`min-w-[28px] px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${
                  page === currentPage
                    ? `${accentGradientClass} text-white`
                    : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 dark:text-slate-200 transition-all"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

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
