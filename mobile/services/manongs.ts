import { ROSTER } from '../mocks/account';
import { wait } from '../mocks/flags';
import type { ChatMessage, Draft, RosterEntry } from '../types';

/** Whether this Manong can take the draft's time. */
export const isFree = (r: RosterEntry, d: Pick<Draft, 'bookingType' | 'time'>) =>
  d.bookingType === 'on-demand' ? r.now === true : !r.busy.includes(d.time);

// TODO(backend): the matching service (ICM open item 5); availability should come from the aide side.
export async function getRoster(category: string): Promise<RosterEntry[]> {
  await wait(300);
  return ROSTER[category] ?? ROSTER.plumbing;
}

/** The Manong a booking goes to: the one picked, else the nearest free one (skipping one who declined). */
export function pickFor(roster: RosterEntry[], d: Draft): RosterEntry | undefined {
  const free = roster.filter((r) => isFree(r, d) && r.manong.key !== d.avoidKey);
  return free.find((r) => r.manong.key === d.manongKey) ?? free[0];
}

// TODO(backend): realtime chat (websocket or push). The mock answers with a canned reply.
export async function sendMessage(text: string): Promise<ChatMessage> {
  if (!text.trim()) throw new Error('Type a message first');
  await wait(900);
  return {
    me: false,
    text: ['Sige po, noted!', 'Copy po. See you soon.', 'Salamat po, papunta na ako.'][
      text.length % 3
    ],
  };
}
