// Copied from prototype/full.js (ALF3, JOHN3, full3State). The signed-in mock user is Bruce Wayne.
import type { Account, Charge, Manong, PastBooking } from '../types';

const person = (key: string, name: string): Manong => ({
  key,
  name,
  first: name.split(' ')[0],
  initial: name[0],
  skills: '',
  rating: '',
  jobs: 0,
  years: '',
  area: '',
  vehicle: '',
  goodAt: [],
  review: ['', ''],
});

export const ALFRED: Manong = {
  ...person('alfred', 'Alfred Pennyworth'),
  skills: 'Plumbing and electrical',
  rating: '4.9',
  jobs: 342,
  years: '6 yrs',
  area: 'Pasay and Taft',
  vehicle: 'White motorcycle, ABC 1234',
  goodAt: ['Leak repair', 'Water heaters', 'Outlets', 'Toilets'],
  review: [
    'Maria L., Tower 2',
    'Explained what was wrong before fixing it, and cleaned up after. Would book again.',
  ],
};
export const JOHN: Manong = {
  ...person('john', 'John Stewart'),
  skills: 'Plumbing',
  rating: '4.8',
  jobs: 128,
  years: '3 yrs',
  area: 'Taft and Malate',
  vehicle: 'Red scooter, NBC 5521',
  goodAt: ['Clogged drains', 'Faucets', 'Pipes'],
  review: ['Ken T., Tower 1', 'Fast and careful. Came on time even in the rain.'],
};
const GORDON = person('gordon', 'James Gordon');
const JONES = person('jones', 'John Jones');
export const MANONGS = [ALFRED, JOHN, GORDON, JONES];

const past = (
  id: string,
  category: string,
  title: string,
  date: string,
  time: string,
  manong: Manong | null,
  lines: Charge[],
  status: PastBooking['status'],
  stars = 0,
): PastBooking => ({
  id,
  category,
  title,
  date,
  time,
  manong,
  lines,
  status,
  stars,
  payment: 'gcash',
});

const inDays = (n: number) => new Date(Date.now() + n * 86400000);

/** A fresh copy each call, so sign-out really resets the mock account. */
export const seedAccount = (): Account => ({
  user: { first: 'Bruce', last: 'Wayne', phone: '+63 917 123 4567' },
  addresses: [
    {
      label: 'Home',
      bldg: 'Green Residences',
      unit: 'Unit 12B, Tower 1',
      city: 'Malate',
      note: 'Guard has the lobby PIN',
    },
    { label: "Parents' house", bldg: '24 Mabini St', unit: '', city: 'Cabanatuan City', note: '' },
    {
      label: 'Office',
      bldg: 'One Ayala, Ayala Ave',
      unit: '18F',
      city: 'Makati',
      note: 'Ask for the admin desk',
    },
  ],
  payment: 'gcash',
  past: [
    past(
      'MJ-8790',
      'plumbing',
      'Plumbing, leak repair',
      'Fri, Oct 2',
      '2:00 PM',
      ALFRED,
      [
        ['Base charge', 450],
        ['P-trap, PVC 1½ in', 180],
        ["Plumber's tape", 35],
      ],
      'paid',
      4,
    ),
    past(
      'MJ-8655',
      'cleaning',
      'Cleaning, 1 bedroom',
      'Mon, Sep 14',
      '9:00 AM',
      GORDON,
      [['1 bedroom clean', 1200]],
      'paid',
      5,
    ),
    past(
      'MJ-8571',
      'electrical',
      'Electrical, outlet repair',
      'Sun, Aug 30',
      '3:00 PM',
      ALFRED,
      [['Base charge', 550]],
      'paid',
      5,
    ),
    past(
      'MJ-8490',
      'locks',
      'Locks, locked out',
      'Mon, Aug 3',
      '11:20 PM',
      null,
      [['Cancelled before dispatch', 0]],
      'cancelled',
    ),
    past(
      'MJ-8402',
      'repairs',
      'Repairs, small fix',
      'Sun, Jul 19',
      '10:00 AM',
      JONES,
      [['Base charge', 400]],
      'paid',
      4,
    ),
  ],
  upcoming: [
    { day: inDays(8), time: '9:00 AM', title: 'Cleaning, 1 bedroom', with: 'James Gordon' },
  ],
  notifications: [
    {
      group: 'Earlier',
      icon: 'credit-card',
      text: 'Your ₱665 payment to Alfred went through.',
      time: 'Oct 2',
      unread: false,
      act: 'receipt',
    },
    {
      group: 'Earlier',
      icon: 'star',
      text: 'Deep cleaning is ₱200 off until Sunday.',
      time: 'Oct 15',
      unread: false,
      act: 'cleaning',
    },
  ],
  chat: [
    { me: false, text: 'Good morning sir, malapit na po.', time: '10:24 AM' },
    { sys: 'Alfred shared his location' },
    { me: true, text: 'Sabihin niyo nalang po sa guard unit number', time: '10:25 AM' },
    { me: false, text: 'Sige po sir paakyat na po.', time: '10:25 AM' },
    { me: true, text: 'Salamat po!', time: '10:26 AM' },
  ],
});
