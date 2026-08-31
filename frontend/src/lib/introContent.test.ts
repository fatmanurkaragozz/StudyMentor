import { describe, it, expect } from 'vitest';
import {
  getSectionIntro,
  getFeatureHint,
  SECTION_INTRO_IDS,
  FEATURE_HINT_IDS,
  SECTION_MAX_WIDTH,
} from './introContent';
import { getNavItems } from './navItems';

// Navigasyondaki her sekmenin bir rehber metni olmali - ileride navItems.ts'e yeni
// bir sekme eklenip introContent'e eklenmezse bu test kirilsin.
const navIds = [...new Set([...getNavItems(true), ...getNavItems(false)].map((i) => i.id))];

describe('getSectionIntro', () => {
  it('her navigasyon sekmesi icin iki persona da eksiksiz icerik doner', () => {
    for (const id of navIds) {
      for (const isStudent of [true, false]) {
        const intro = getSectionIntro(id, isStudent);
        expect(intro, `${id} (isStudent=${isStudent}) icin icerik yok`).not.toBeNull();
        expect(intro!.title.trim().length).toBeGreaterThan(0);
        expect(intro!.body.trim().length).toBeGreaterThan(0);
        expect(intro!.steps.length).toBeGreaterThanOrEqual(1);
        expect(intro!.steps.every((s) => s.trim().length > 0)).toBe(true);
      }
    }
  });

  it("bilinmeyen sekme id'sinde null doner", () => {
    expect(getSectionIntro('bilinmeyen', true)).toBeNull();
    expect(getSectionIntro('', false)).toBeNull();
  });

  it('courses / planner / calendar personaya gore farkli metin verir', () => {
    for (const id of ['courses', 'planner', 'calendar']) {
      const student = getSectionIntro(id, true)!;
      const learner = getSectionIntro(id, false)!;
      const studentText = `${student.title} ${student.body} ${student.steps.join(' ')}`.toLowerCase();
      const learnerText = `${learner.title} ${learner.body} ${learner.steps.join(' ')}`.toLowerCase();

      expect(studentText, `${id} ogrenci metni "ders" icermeli`).toContain('ders');
      expect(learnerText, `${id} gelisim metni "uğraş" icermeli`).toContain('uğraş');
      expect(studentText).not.toEqual(learnerText);
    }
  });

  it('SECTION_INTRO_IDS tum navigasyon sekmelerini kapsar', () => {
    for (const id of navIds) {
      expect(SECTION_INTRO_IDS).toContain(id);
    }
  });

  it('her SECTION_MAX_WIDTH degeri bir tailwind max-w sinifidir', () => {
    for (const value of Object.values(SECTION_MAX_WIDTH)) {
      expect(value).toMatch(/^max-w-/);
    }
  });
});

describe('getFeatureHint', () => {
  const expectedIds = [
    'kaptan',
    'spaced-repetition',
    'pomodoro',
    'daily-tasks',
    'mini-check',
    'priority-score',
    'habit-matrix',
    'journal-sentiment',
  ];

  it('beklenen 8 ipucunun hepsi iki persona icin de eksiksiz doner', () => {
    for (const id of expectedIds) {
      expect(FEATURE_HINT_IDS).toContain(id);
      for (const isStudent of [true, false]) {
        const hint = getFeatureHint(id, isStudent);
        expect(hint, `${id} (isStudent=${isStudent}) icin ipucu yok`).not.toBeNull();
        expect(hint!.title.trim().length).toBeGreaterThan(0);
        expect(hint!.body.trim().length).toBeGreaterThan(0);
        expect(hint!.steps.length).toBeGreaterThanOrEqual(1);
        expect(hint!.steps.every((s) => s.trim().length > 0)).toBe(true);
      }
    }
  });

  it("mini-check personaya gore konu/alt baslik der", () => {
    expect(getFeatureHint('mini-check', true)!.body).toContain('konu');
    expect(getFeatureHint('mini-check', false)!.body).toContain('alt başlık');
  });

  it("bilinmeyen ipucu id'sinde null doner", () => {
    expect(getFeatureHint('yok', true)).toBeNull();
  });
});
