// Shapes shared by the services, mocks and screens. A real API should return the same shapes.
import type { SCREENS } from './App';
import type { IconName } from './ui';
import type { BOOKING_STATES, BOOKING_TYPES, SERVICE_TYPES } from '../src/utils/contract.js';

export type ServiceType = keyof typeof SERVICE_TYPES;
export type BookingType = (typeof BOOKING_TYPES)[keyof typeof BOOKING_TYPES];
/** A state from the contract shared with Team 2. */
export type BookingStatus = (typeof BOOKING_STATES)[keyof typeof BOOKING_STATES];
/**
 * What the resident sees (the status ring). The contract has no "booked", "on the way" or
 * "running late" yet (ICM open item 20), so `contractStatus()` in services/bookings maps these onto it.
 */
export type Stage =
  | 'booked'
  | 'confirmed'
  | 'onway'
  | 'late'
  | 'inprogress'
  | 'completed'
  | 'paid'
  | 'cancelled'
  | 'mcancelled';
export type PaymentMethod = 'gcash' | 'cash';
/** [item name, price in pesos] */
export type Charge = [string, number];

export type Tier = {
  name: string;
  desc: string;
  price: number;
  meta: string;
  gold: boolean;
  short: string;
};

export type Category = {
  name: string;
  /** "plumber", "cleaner"… for copy like "Every plumber near you is booked". */
  who: string;
  icon: IconName;
  q: string;
  /** Step 1 tip; empty means no tip. */
  note: string;
  issueLabel: string;
  crew: string;
  defaultTier: ServiceType;
  tiers: Record<ServiceType, Tier>;
  chips: string;
  symptoms: string[];
  ph: string;
  /** Materials always added to the bill. */
  extra: Charge[];
  /** The extra part a Manong may ask to add: [name, price, why]. */
  part: [string, number, string];
  guardJob: string;
};
export type Catalog = Record<string, Category>;

export type Manong = {
  key: string;
  name: string;
  first: string;
  initial: string;
  skills: string;
  rating: string;
  jobs: number;
  years: string;
  area: string;
  vehicle: string;
  goodAt: string[];
  /** [who, what they said] */
  review: [string, string];
};

export type User = { first: string; last: string; phone: string };
export type Address = { label: string; bldg: string; unit: string; city: string; note: string };

/** A booking still being filled in. */
export type Draft = {
  category: string;
  serviceType: ServiceType;
  desc: string;
  symptoms: string[];
  photos: number;
  dropoff: string;
  bookingType: BookingType;
  day: Date | null;
  time: string | null;
  manong: Manong | null;
  /** A Manong the resident asked for again, by first name. */
  preferred: string | null;
  /** Set once a search has been retried, so the mock doesn't report "none free" twice. */
  retried: boolean;
};

export type Booking = {
  id: string;
  category: string;
  serviceType: ServiceType;
  bookingType: BookingType;
  problem: string;
  day: Date | null;
  time: string | null;
  address: Address;
  manong: Manong;
  stage: Stage;
  payment: PaymentMethod;
  /** Parts the resident approved during the job. */
  parts: Charge[];
};

export type PastBooking = {
  id: string;
  category: string;
  title: string;
  date: string;
  time: string;
  manong: Manong | null;
  lines: Charge[];
  status: 'paid' | 'cancelled';
  stars: number;
  payment: PaymentMethod;
};

export type Upcoming = { day: Date; time: string; title: string; with: string };

export type Notice = {
  group: string;
  icon: IconName;
  text: string;
  time: string;
  unread: boolean;
  /** What tapping it opens. */
  act: 'status' | 'receipt' | 'review' | 'cleaning' | '';
};

export type ChatMessage = { me?: boolean; text?: string; time?: string; sys?: string };

export type Account = {
  user: User;
  addresses: Address[];
  payment: PaymentMethod;
  past: PastBooking[];
  upcoming: Upcoming[];
  notifications: Notice[];
  chat: ChatMessage[];
};

export type AppState = Account & {
  catalog: Catalog;
  /** Which saved address bookings go to. */
  addressIdx: number;
  draft: Draft;
  booking: Booking | null;
  /** A Manong was found while the resident left the Finding screen. */
  pendingReview: boolean;
  cancelled: { booking: Booking; reason: string; fee: number } | null;
  receiptIdx: number;
  viewManong: Manong | null;
  /** Index of the address being edited; -1 adds a new one. */
  addrEdit: number;
  reportFrom: ScreenName;
  /** The time that had no Manong free, for the "No Manong free" screen. */
  noneFrom: string;
  /** Whether the mobile-number flow signs up a new resident or logs in an existing one. */
  regMode: 'new' | 'login';
};

/** The navigation and state helpers App passes to every screen. */
export type App = {
  state: AppState;
  back: () => void;
  go: (screen: ScreenName, opts?: { replace?: boolean; reset?: boolean }) => void;
  home: () => void;
  /** Merge into state; pass a function to build the patch from the latest state. */
  update: (patch: Partial<AppState> | ((s: AppState) => Partial<AppState>)) => void;
  setDraft: (patch: Partial<Draft>) => void;
  toast: (message: string) => void;
  startBooking: (category: string, preferred?: Manong | null) => void;
  /** Swaps in the signed-in resident's account and opens Home. */
  signIn: (account: Account, toast?: string) => void;
  logOut: () => void;
};
export type ScreenName = keyof typeof SCREENS;
