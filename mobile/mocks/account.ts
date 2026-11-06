// Copied from prototype/app.js and full.js Flow 4 (CLARISO, ROSTER3, fresh() for 'final').
// The signed-in mock resident is Enzo Santos. Addresses use Green Residences, as in Flow 3.
import type { Account, Manong, RosterEntry } from '../types';

const aide = (key: string, name: string, skills: string, rating: string, jobs: number): Manong => ({
  key,
  name,
  first: name.split(' ')[0],
  initials: name[0],
  skills,
  rating,
  jobs,
});

export const CLARISO: Manong = {
  ...aide('clariso', 'Clariso Perez', 'Plumbing and electrical', '4.9', 342),
  initials: 'CP',
};
const JOHN = aide('john', 'John Stewart', 'Plumbing', '4.8', 128);
const RAMON = aide('ramon', 'Ramon Cruz', 'Plumbing', '4.7', 86);
const GORDON = aide('gordon', 'James Gordon', 'Cleaning', '4.9', 210);
const LIZA = aide('liza', 'Liza Santos', 'Cleaning', '4.8', 176);
const MARIO = aide('mario', 'Mario Tan', 'Locks and security', '4.9', 301);
const EDGAR = aide('edgar', 'Edgar Lim', 'Locks', '4.6', 92);
const REY = aide('rey', 'Rey Santos', 'Moving crew lead', '4.8', 240);
const BENNY = aide('benny', 'Benny Ocampo', 'Moving crew lead', '4.7', 133);

const row = (manong: Manong, km: number, now: true | string, busy: string[] = []): RosterEntry => ({
  manong,
  km,
  now,
  busy,
});

/** Who works each service, nearest first. */
export const ROSTER: Record<string, RosterEntry[]> = {
  plumbing: [
    row(CLARISO, 0.4, true),
    row(JOHN, 1.1, true, ['3:00 PM']),
    row(RAMON, 2.3, true, ['10:30 AM']),
  ],
  cleaning: [row(GORDON, 0.7, true, ['9:00 AM']), row(LIZA, 1.6, true, ['3:00 PM'])],
  locks: [row(MARIO, 1.2, true), row(EDGAR, 2.0, true, ['10:30 AM'])],
  moving: [row(REY, 1.5, true), row(BENNY, 2.4, true, ['9:00 AM'])],
};

/** A fresh copy each call, so logging out really resets the mock account. */
export const seedAccount = (): Account => ({
  user: { name: 'Enzo Santos', initials: 'ES', phone: '0917 555 0142', email: 'enzo@email.com' },
  addresses: [
    {
      title: 'Green Residences, Tower 1',
      detail: 'Unit 6, Tower 1, Taft Ave, Malate',
      short: 'Unit 6, Tower 1',
    },
    {
      title: 'Green Residences, Tower 1',
      detail: 'Unit 12B, Tower 1, Taft Ave, Malate',
      short: 'Unit 12B, Tower 1',
    },
    {
      title: 'Green Residences, Tower 2',
      detail: 'Unit 21C, Tower 2, Taft Ave, Malate',
      short: 'Unit 21C, Tower 2',
    },
  ],
  payment: 'gcash',
  voucher: true,
  past: [
    {
      id: 'MJ-8710',
      category: 'plumbing',
      serviceType: 'STANDARD',
      date: 'Oct 2',
      manong: CLARISO,
      total: 520,
      payment: 'gcash',
    },
  ],
  notifications: [
    {
      group: 'Today',
      text: 'MANONG50 applied: ₱50 off your next booking',
      time: '8:00 AM',
      unread: true,
      act: 'home',
    },
    {
      group: 'Earlier',
      text: 'Your receipt for MJ-8790 is ready',
      time: 'Oct 2',
      unread: false,
      act: 'bookings',
    },
  ],
  chat: [
    { me: false, text: 'Hi po! This is Clariso, your Manong. On my way to Green Residences.' },
  ],
  alerts: { bookings: true, promos: false },
});

/** Recent jobs in the resident's building, shown on Home. `photo` keys into the screen's images. */
export const RECENT_JOBS = [
  {
    photo: 'pipe',
    title: 'Sink trap seal',
    sub: 'Plumbing • ₱450',
    detail: 'Done by Clariso P. · Green Residences, 2 days ago · ₱450',
  },
  {
    photo: 'job2',
    title: 'Faucet and bidet line',
    sub: 'Plumbing • ₱650',
    detail: 'Done by Rommel D. · Green Residences, last week · ₱650',
  },
] as const;
