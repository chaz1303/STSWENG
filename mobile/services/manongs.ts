import { ALFRED, JOHN, MANONGS } from '../mocks/account';
import { wait } from '../mocks/flags';
import type { BookingType, ChatMessage, Manong } from '../types';

// TODO(backend): matching is ICM open item 5 (automatic or resident picks). The mock sends Alfred for
// scheduled jobs, John for "now", or the Manong the resident asked for again.
export function pickManong(bookingType: BookingType, preferred: string | null): Manong {
  return (
    MANONGS.find((m) => m.first === preferred && m.skills) ??
    (bookingType === 'on-demand' ? JOHN : ALFRED)
  );
}

// TODO(backend): realtime chat (websocket or push). The mock answers with a canned reply.
export async function sendMessage(text: string): Promise<ChatMessage> {
  if (!text.trim()) throw new Error('Type a message first');
  await wait(900);
  return {
    me: false,
    text: ['Sige po, noted!', 'Copy po, salamat!', 'Okay po sir.'][text.length % 3],
    time: 'Now',
  };
}
