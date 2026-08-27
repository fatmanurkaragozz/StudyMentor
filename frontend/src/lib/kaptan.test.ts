import { describe, it, expect } from 'vitest';
import { getKaptanMessage } from './kaptan';

describe('getKaptanMessage', () => {
  const baseInput = {
    id: 'topic-1',
    firstName: 'Ada',
    priority: 'YUKSEK' as const,
    topicName: 'Türev',
    subjectName: 'Matematik',
  };

  it('ayni girdi icin her zaman ayni mesaji doner (deterministik)', () => {
    expect(getKaptanMessage(baseInput)).toEqual(getKaptanMessage(baseInput));
  });

  it('dusuk ruh halinde (😔) nazik sablona gecer', () => {
    const normal = getKaptanMessage(baseInput);
    const gentle = getKaptanMessage({ ...baseInput, mood: '😔' });
    expect(gentle).not.toEqual(normal);
  });

  it('firstName bossa varsayilan hitaba duser', () => {
    const result = getKaptanMessage({ ...baseInput, firstName: '' });
    expect(result.content).toContain('arkadaşım');
  });

  it('topicName yoksa subjectName kullanir, o da yoksa genel ifade kullanir', () => {
    const withSubject = getKaptanMessage({ ...baseInput, topicName: null });
    expect(withSubject.content).toContain('Matematik');

    const withNeither = getKaptanMessage({ ...baseInput, topicName: null, subjectName: null });
    expect(withNeither.content).toContain('bu konu');
  });
});
