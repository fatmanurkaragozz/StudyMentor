import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntroProvider, useIntros } from './IntroContext';

const DISMISSED_KEY = 'studymentor_intros_dismissed';
const WELCOME_KEY = 'studymentor_welcome_pending';

// Hook degerlerini metin olarak sergileyen + eylemleri butona baglayan yardimci
// bilesen (deseni ReminderPrompt.test.tsx ile ayni fikir).
function Harness() {
  const { isDismissed, dismiss, resetAll, dismissedCount, welcomePending, beginWelcome, endWelcome } =
    useIntros();
  return (
    <div>
      <span data-testid="dismissed-x">{String(isDismissed('section:x'))}</span>
      <span data-testid="count">{dismissedCount}</span>
      <span data-testid="welcome">{String(welcomePending)}</span>
      <button onClick={() => dismiss('section:x')}>dismiss-x</button>
      <button onClick={resetAll}>reset</button>
      <button onClick={beginWelcome}>begin-welcome</button>
      <button onClick={endWelcome}>end-welcome</button>
    </div>
  );
}

const renderHarness = () =>
  render(
    <IntroProvider>
      <Harness />
    </IntroProvider>,
  );

beforeEach(() => localStorage.clear());
afterEach(cleanup);

describe('IntroContext', () => {
  it("dismiss bir anahtari kalici isaretler ve localStorage'a yazar", async () => {
    renderHarness();
    expect(screen.getByTestId('dismissed-x')).toHaveTextContent('false');

    await userEvent.click(screen.getByText('dismiss-x'));

    expect(screen.getByTestId('dismissed-x')).toHaveTextContent('true');
    expect(screen.getByTestId('count')).toHaveTextContent('1');
    expect(JSON.parse(localStorage.getItem(DISMISSED_KEY)!)).toContain('section:x');
  });

  it('kapatilan kart provider yeniden mount edilince hala kapali', async () => {
    const first = renderHarness();
    await userEvent.click(screen.getByText('dismiss-x'));
    first.unmount();

    renderHarness();
    expect(screen.getByTestId('dismissed-x')).toHaveTextContent('true');
  });

  it('resetAll tum kapatilmalari temizler', async () => {
    renderHarness();
    await userEvent.click(screen.getByText('dismiss-x'));
    await userEvent.click(screen.getByText('reset'));

    expect(screen.getByTestId('dismissed-x')).toHaveTextContent('false');
    expect(screen.getByTestId('count')).toHaveTextContent('0');
    expect(localStorage.getItem(DISMISSED_KEY)).toBe('[]');
  });

  it('bozuk JSON varsa hata firlatmadan bos baslar', () => {
    localStorage.setItem(DISMISSED_KEY, '{bozuk');
    expect(() => renderHarness()).not.toThrow();
    expect(screen.getByTestId('dismissed-x')).toHaveTextContent('false');
  });

  it("beginWelcome / endWelcome welcomePending ve localStorage'i gunceller", async () => {
    renderHarness();
    expect(screen.getByTestId('welcome')).toHaveTextContent('false');

    await userEvent.click(screen.getByText('begin-welcome'));
    expect(screen.getByTestId('welcome')).toHaveTextContent('true');
    expect(localStorage.getItem(WELCOME_KEY)).toBe('1');

    await userEvent.click(screen.getByText('end-welcome'));
    expect(screen.getByTestId('welcome')).toHaveTextContent('false');
    expect(localStorage.getItem(WELCOME_KEY)).toBeNull();
  });

  it("welcomePending localStorage'daki degeri okuyarak baslar", () => {
    localStorage.setItem(WELCOME_KEY, '1');
    renderHarness();
    expect(screen.getByTestId('welcome')).toHaveTextContent('true');
  });
});
