import { describe, it, expect } from 'vitest';
import { addDays, formatPlanTime, localDateKey, localMonthRange, parseDateKey, timeOfDay } from './dateKey';

describe('dateKey', () => {
  it('yerel gunu kullanir (gece yarisindan hemen sonra UTC gibi bir onceki gune kaymaz)', () => {
    expect(localDateKey(new Date(2026, 9, 1, 0, 30))).toBe('2026-10-01');
    expect(localDateKey(new Date(2026, 9, 1, 23, 59))).toBe('2026-10-01');
  });

  it('anahtari yerel gun basina cevirir ve gun ekleyip cikarir (ay/yil sinirinda da)', () => {
    expect(parseDateKey('2026-10-01')).toEqual(new Date(2026, 9, 1));
    expect(addDays('2026-10-01', -1)).toBe('2026-09-30');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
  });

  it('ay araligi yerel ay basindan sonraki ay basina kadar', () => {
    expect(localMonthRange('2026-10-15')).toEqual({
      from: new Date(2026, 9, 1).toISOString(),
      to: new Date(2026, 10, 1).toISOString(),
    });
  });

  it('saat ve plan araligi bicimleri', () => {
    expect(timeOfDay(new Date(2026, 9, 1, 9, 5))).toBe('09:05');
    expect(formatPlanTime('15:00', '16:00')).toBe('15:00–16:00');
    expect(formatPlanTime('20:00', null)).toBe('20:00');
    expect(formatPlanTime(null, null)).toBe('');
  });
});
