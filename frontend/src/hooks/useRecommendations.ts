import { useEffect, useState } from 'react';
import { apiClient, type RecommendationRow } from '../lib/apiClient';
import { useApp } from '../context/AppContext';
import { getKaptanMessage } from '../lib/kaptan';

export interface KaptanRecommendation extends RecommendationRow {
  kaptan: { title: string; content: string };
}

// Dashboard'daki "Kaptan" banner'ı ile AIInsights ekranındaki öneri kartları aynı
// /recommendations verisini gösterir - bu hook ikisinin de aynı fetch'i ve aynı
// persona sarmalını (getKaptanMessage, ruh haline göre ton değişimiyle) kullanmasını
// sağlar, böylece aynı öneri iki ekranda farklı görünmez.
export function useRecommendations() {
  const { user } = useApp();
  const [recommendations, setRecommendations] = useState<RecommendationRow[]>([]);
  const [latestMood, setLatestMood] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = () => {
    setLoading(true);
    Promise.all([apiClient.getRecommendations(user.mode), apiClient.getJournals(user.mode)])
      .then(([recs, journals]) => {
        setRecommendations(recs);
        setLatestMood(journals[0]?.mood ?? null);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
  }, [user.mode]);

  const firstName = user.name.split(' ')[0];
  const withKaptan: KaptanRecommendation[] = recommendations.map(item => ({
    ...item,
    kaptan: item.priority
      ? getKaptanMessage({
          id: item.id,
          firstName,
          priority: item.priority,
          topicName: item.topicName,
          subjectName: item.subjectName,
          mood: latestMood,
        })
      : { title: item.title, content: item.content },
  }));

  return { recommendations: withKaptan, loading, reload };
}
