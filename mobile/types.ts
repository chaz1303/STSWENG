// Shapes shared by the services, mocks and screens. A real API should return the same shapes.
import type { SCREENS } from './App';
import type { IconName } from './ui';
import type { BOOKING_STATES, BOOKING_TYPES, SERVICE_TYPES } from '../src/utils/contract.js';

export type ServiceType = keyof typeof SERVICE_TYPES;
export type BookingType = (typeof BOOKING_TYPES)[keyof typeof BOOKING_TYPES];
/** A state from the contract shared with Team 2. */
export type BookingStatus = (typeof BOOKING_STATES)[keyof typeof BOOKING_STATES];
/**
 * What the resident sees for the active booking (Flow 4). The contract has no "finding", "on the way"
 * or "arrived", so `contractStatus()` in services/bookings maps these onto it (ICM open item 20).
 */
export type Stage = 'finding' | 'pending' | 'confirmed' | 'declined' | 'onway' | 'arrived' | 'done';
export type PaymentMethod = 'gcash' | 'cash';
/** [item name, price in pesos] */
export type Charge = [string, number];

export type Tier = {
  name: string;
  desc: string;
  price: number;
  /** "Fixed base" or "Starting price". */
  unit: string;
  /** Shows a "+" after the price. */
  plus?: boolean;
  badge?: string;
};

export type Category = {
  /** "Plumbing": the pill on booking screens. */
  name: string;
  /** "House Repairs": the label on Home. */
  label: string;
  /** "Leaks, clogs, fixtures and electrical" on Home. */
  blurb: string;
  /** "Plumbing Specialist" under the Manong's name. */
  pro: string;
  icon: IconName;
  tiers: Record<ServiceType, Tier>;
  symptoms: string[];
  /** The part a Manong may ask to add: [name, price]. */
  part: Charge;
};
export type Catalog = Record<string, Category>;

export type Manong = {
  key: string;
  name: string;
  first: string;
  initials: string;
  skills: string;
  rating: string;
  jobs: number;
};

/** A Manong in the "Choose your Manong" list. */
export type RosterEntry = {
  manong: Manong;
  km: number;
  /** Free right now, or the reason he isn't. */
  now: true | string;
  /** Times already booked. */
  busy: string[];
};

export type User = { name: string; initials: string; phone: string; email: string };
export type Address = { title: string; detail: string; short: string };

/** A booking still being filled in. */
export type Draft = {
  category: string;
  serviceType: ServiceType;
  desc: string;
  symptoms: string[];
  photos: number;
  notes: string;
  bookingType: BookingType;
  /** Days from today; 0 is today. */
  day: number;
  time: string;
  /** A Manong picked from the list; null books the nearest. */
  manongKey: string | null;
  /** After a decline, skip the Manong who declined. */
  avoidKey: string | null;
};

export type Booking = {
  id: string;
  category: string;
  serviceType: ServiceType;
  bookingType: BookingType;
  day: number;
  time: string;
  address: Address;
  manong: Manong;
  stage: Stage;
  /** True when the resident approved the extra part. */
  partApproved: boolean;
};

export type PastBooking = {
  id: string;
  category: string;
  serviceType: ServiceType;
  date: string;
  manong: Manong;
  total: number;
  payment: PaymentMethod;
};

export type Notice = {
  group: 'Today' | 'Earlier';
  text: string;
  time: string;
  unread: boolean;
  /** Screen it opens. */
  act: 'home' | 'bookings';
};

export type ChatMessage = { me: boolean; text: string };

export type Account = {
  user: User;
  addresses: Address[];
  payment: PaymentMethod;
  voucher: boolean;
  past: PastBooking[];
  notifications: Notice[];
  chat: ChatMessage[];
  /** Notification settings. */
  alerts: { bookings: boolean; promos: boolean };
};

export type AppState = Account & {
  catalog: Catalog;
  addressIdx: number;
  draft: Draft;
  /** The one active booking (Grab-style: one at a time). */
  booking: Booking | null;
  /** Minutes until the Manong arrives, for live tracking. */
  eta: number;
  /** The Manong asked to add a part; live tracking shows the approval sheet. */
  partAsk: boolean;
  /** What the thank-you screen shows after the booking closes. */
  thanks: { manong: Manong; tierName: string; stars: number; tip: number; total: number } | null;
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
  /** Starts a booking; with `again`, books that Manong and service again and skips to the details step. */
  startBooking: (category: string, again?: { manongKey: string; serviceType: ServiceType }) => void;
  /** Opens the active booking at the screen that fits its status (or `stage`, right after changing it). */
  openBooking: (stage?: Stage) => void;
  signIn: (account: Account, toast?: string) => void;
  logOut: () => void;
};
export type ScreenName = keyof typeof SCREENS;
