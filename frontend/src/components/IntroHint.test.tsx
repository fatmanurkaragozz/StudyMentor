import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IntroHint } from './IntroHint';
import { IntroProvider } from '../context/IntroContext';
import { useApp } from '../context/AppContext';

// IntroHint sadece useApp().user.mode'u kullanir - persona dalini test edebilmek
// icin useApp'i mock'luyoruz. useIntros gercek provider ile kalir.
vi.mock('../context/AppContext', () => ({ useApp: vi.fn() }));

const DISMISSED_KEY = 'studymentor_intros_dismissed';

const setMode = (mode: 'STUDENT' | 'LIFELONG_LEARNER') => {
  vi.mocked(useApp).mockReturnValue({ user: { mode } } as unknown as ReturnType<typeof useApp>);
};

const renderHint = (id = 'insights') =>
  render(
    <IntroProvider>
      <IntroHint kind="section" id={id} />
    </IntroProvider>,
  );

beforeEach(() => {
  localStorage.clear();
  setMode('STUDENT');
});
afterEach(cleanup);

describe('IntroHint (section)', () => {
  it('kapatilmamis bir bolum icin baslik, aciklama ve adimlari gosterir', () => {
    renderHint('insights');
    expect(screen.getByText('AI Analiz & Koç')).toBeInTheDocument();
    expect(screen.getByText(/hangi konuya öncelik/i)).toBeInTheDocument();
    expect(screen.getByText(/"Kontrol Et"/)).toBeInTheDocument();
    expect(screen.getByLabelText(/bir daha gösterme/i)).toBeInTheDocument();
  });

  it('kutu isaretsiz "Kapat" -> kart kuculur, kalici gizlenmez', async () => {
    renderHint('insights');
    await userEvent.click(screen.getByRole('button', { name: 'Kapat' }));

    expect(screen.queryByText(/hangi konuya öncelik/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /bu bölüm nedir/i })).toBeInTheDocument();
    expect(localStorage.getItem(DISMISSED_KEY)).toBe('[]');
  });

  it("kutu isaretli \"Kapat\" -> localStorage'a kaydeder", async () => {
    renderHint('insights');
    await userEvent.click(screen.getByLabelText(/bir daha gösterme/i));
    await userEvent.click(screen.getByRole('button', { name: 'Kapat' }));

    expect(JSON.parse(localStorage.getItem(DISMISSED_KEY)!)).toContain('section:insights');
  });

  it('kuculmus karttan "Bu bölüm nedir?" ile tekrar acilir', async () => {
    renderHint('insights');
    await userEvent.click(screen.getByRole('button', { name: 'Kapat' }));
    await userEvent.click(screen.getByRole('button', { name: /bu bölüm nedir/i }));

    expect(screen.getByText(/hangi konuya öncelik/i)).toBeInTheDocument();
  });

  it("persona metnini user.mode'a gore secer", () => {
    const first = renderHint('courses');
    expect(screen.getByText('Derslerim')).toBeInTheDocument();
    first.unmount();

    setMode('LIFELONG_LEARNER');
    renderHint('courses');
    expect(screen.getByText('Uğraşlarım')).toBeInTheDocument();
  });

  it("bilinmeyen sekme id'sinde hicbir sey render etmez", () => {
    const { container } = renderHint('bilinmeyen-sekme');
    expect(container).toBeEmptyDOMElement();
  });
});

const renderFeature = (id = 'pomodoro') =>
  render(
    <IntroProvider>
      <IntroHint kind="feature" id={id} />
    </IntroProvider>,
  );

describe('IntroHint (feature)', () => {
  it('once sessiz bir "... nedir?" baglantisi olarak durur', () => {
    renderFeature('pomodoro');
    expect(screen.getByRole('button', { name: /pomodoro sayacı nedir/i })).toBeInTheDocument();
    expect(screen.queryByText(/Dashboard metriklerine/)).not.toBeInTheDocument();
  });

  it('baglantiya tiklayinca acilir, "Anladim" ile baglantiya doner', async () => {
    renderFeature('pomodoro');
    await userEvent.click(screen.getByRole('button', { name: /pomodoro sayacı nedir/i }));
    expect(screen.getByText(/Dashboard metriklerine/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Anladım' }));
    expect(screen.getByRole('button', { name: /pomodoro sayacı nedir/i })).toBeInTheDocument();
  });

  it('"bir daha gosterme" isaretli kapatinca tamamen kaybolur', async () => {
    const { container } = renderFeature('pomodoro');
    await userEvent.click(screen.getByRole('button', { name: /pomodoro sayacı nedir/i }));
    await userEvent.click(screen.getByLabelText('Bir daha gösterme'));
    await userEvent.click(screen.getByRole('button', { name: 'Anladım' }));

    expect(container).toBeEmptyDOMElement();
    expect(JSON.parse(localStorage.getItem(DISMISSED_KEY)!)).toContain('feature:pomodoro');
  });

  it('daha once kalici kapatildiysa hic render etmez (baglanti bile yok)', () => {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(['feature:pomodoro']));
    const { container } = renderFeature('pomodoro');
    expect(container).toBeEmptyDOMElement();
  });
});
