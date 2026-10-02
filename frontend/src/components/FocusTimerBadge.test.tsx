import { useEffect } from 'react';
import type { FC } from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup, fireEvent, act } from '@testing-library/react';
import { FocusTimerBadge } from './FocusTimerBadge';
import { FocusTimerProvider, useFocusTimer } from '../context/FocusTimerContext';
import { useApp } from '../context/AppContext';
import type { UserMode } from '../types';

vi.mock('../context/AppContext', () => ({ useApp: vi.fn() }));

const setActiveTab = vi.fn();

const setApp = (mode: UserMode, activeTab: string) => {
  vi.mocked(useApp).mockReturnValue({
    user: { mode },
    activeTab,
    setActiveTab,
  } as unknown as ReturnType<typeof useApp>);
};

// Sayac ekraninda "Baslat"a basilmis gibi, verilen modun sayacini calistirir.
const RunningTimer: FC<{ mode: UserMode; seconds: number }> = ({ mode, seconds }) => {
  const { setEndsAt } = useFocusTimer(mode);
  useEffect(() => setEndsAt(Date.now() + seconds * 1000), [setEndsAt, seconds]);
  return null;
};

const renderBadge = (timerMode: UserMode | null, seconds = 90) =>
  render(
    <FocusTimerProvider>
      {timerMode && <RunningTimer mode={timerMode} seconds={seconds} />}
      <FocusTimerBadge />
    </FocusTimerProvider>,
  );

beforeEach(() => {
  vi.useFakeTimers();
  setActiveTab.mockClear();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('FocusTimerBadge', () => {
  it('baska sekmedeyken kalan sureyi gosterir ve her saniye gunceller', () => {
    setApp('STUDENT', 'dashboard');
    renderBadge('STUDENT');
    expect(screen.getByText('01:30')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByText('01:29')).toBeInTheDocument();
  });

  it('tiklayinca sayac ekranina gider', () => {
    setApp('STUDENT', 'dashboard');
    renderBadge('STUDENT');
    fireEvent.click(screen.getByRole('button', { name: /odak sayacı/i }));
    expect(setActiveTab).toHaveBeenCalledWith('planner');
  });

  it('sure dolunca "Süre doldu" der', () => {
    setApp('STUDENT', 'dashboard');
    renderBadge('STUDENT');
    act(() => {
      vi.advanceTimersByTime(90_000);
    });
    expect(screen.getByText('Süre doldu')).toBeInTheDocument();
  });

  it('sayac ekranindayken gorunmez', () => {
    setApp('STUDENT', 'planner');
    const { container } = renderBadge('STUDENT');
    expect(container).toBeEmptyDOMElement();
  });

  it('calisan sayac yokken gorunmez', () => {
    setApp('STUDENT', 'dashboard');
    const { container } = renderBadge(null);
    expect(container).toBeEmptyDOMElement();
  });

  it("diger modun (Gelisim) sayacini Ogrenci modunda gostermez", () => {
    setApp('STUDENT', 'dashboard');
    const { container } = renderBadge('LIFELONG_LEARNER');
    expect(container).toBeEmptyDOMElement();
  });
});
