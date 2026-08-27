import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReminderPrompt } from './ReminderPrompt';
import { apiClient } from '../lib/apiClient';

vi.mock('../lib/apiClient', () => ({
  apiClient: { respondToTopicReminder: vi.fn() },
}));

beforeEach(() => {
  vi.mocked(apiClient.respondToTopicReminder).mockReset().mockResolvedValue({ message: 'ok' });
});

describe('ReminderPrompt', () => {
  it('"Evet, hatırlat" tıklanınca kabul mesajını gösterir ve apiClient\'i doğru argümanlarla çağırır', async () => {
    render(<ReminderPrompt topicId="t1" initialIntervalDays={3} />);

    await userEvent.click(screen.getByText('Evet, hatırlat'));

    expect(await screen.findByText(/3 günde bir bu konuyu tekrar etmeni hatırlatacağım/)).toBeInTheDocument();
    expect(apiClient.respondToTopicReminder).toHaveBeenCalledWith('t1', 3, true);
  });

  it('"Hayır, gerek yok" tıklanınca hiçbir şey render etmez', async () => {
    const { container } = render(<ReminderPrompt topicId="t2" initialIntervalDays={5} />);

    await userEvent.click(screen.getByText('Hayır, gerek yok'));

    expect(apiClient.respondToTopicReminder).toHaveBeenCalledWith('t2', 5, false);
    expect(container).toBeEmptyDOMElement();
  });

  it('+ butonuna basınca gün sayısını artırır', async () => {
    render(<ReminderPrompt topicId="t3" initialIntervalDays={3} />);
    const buttons = screen.getAllByRole('button');

    // Buton sirasi DOM'daki gibi: [-] [Hayır, gerek yok] [Evet, hatırlat] disinda
    // ilk iki buton [-]/[+] - [+] butonu ikinci sirada.
    await userEvent.click(buttons[1]);

    expect(screen.getByText('4 gün')).toBeInTheDocument();
  });
});
