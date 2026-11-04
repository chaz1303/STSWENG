// Shapes shared by the mock api and the screens. A real API should return the same shapes.
import type { SCREENS } from './App';
import type { IconName } from './ui';
import type { BOOKING_STATES, BOOKING_TYPES, SERVICE_TYPES } from '../src/utils/contract.js';

export type ServiceType = keyof typeof SERVICE_TYPES;
export type BookingType = (typeof BOOKING_TYPES)[keyof typeof BOOKING_TYPES];
export type BookingStatus = (typeof BOOKING_STATES)[keyof typeof BOOKING_STATES];
export type PaymentMethod = 'gcash' | 'cash';
/** [item name, price in pesos] */
export type Charge = [string, number];

export type Tier = { name: string; desc: string; price: number; meta: string; gold: boolean };

export type Category = {
  name: string;
  icon: IconName;
  q: string;
  note: string;
  defaultTier?: ServiceType;
  tiers: Record<ServiceType, Tier>;
  chips: string;
  symptoms: string[];
  ph: string;
  materials: Charge[];
};
export type Catalog = Record<string, Category>;

export type Manong = {
  name: string;
  first: string;
  initial: string;
  skills: string;
  rating: string;
  jobs: number;
};
export type User = { first: string; last: string; phone: string };
export type Address = { bldg: string; unit: string; note: string };

/** A booking still being filled in. */
export type Draft = {
  category: string;
  serviceType: ServiceType;
  desc: string;
  symptoms: string[];
  bookingType: BookingType;
  day: Date | null;
  time: string | null;
  payment: PaymentMethod;
  manong: Manong | null;
};

export type Booking = Omit<Draft, 'manong'> & {
  id: string;
  manong: Manong;
  status: BookingStatus;
  materials: Charge[];
  paid?: boolean;
  rating?: { stars: number; praise: string[]; note: string };
};

/** What every screen can read. Screens open only after the catalog has loaded and, for booking steps, a draft exists. */
export type AppState = {
  catalog: Catalog;
  user: User;
  address: Address | null;
  draft: Draft;
  booking: Booking | null;
};

/** The navigation and state helpers App passes to every screen. */
export type App = {
  state: AppState;
  back: () => void;
  go: (screen: ScreenName, opts?: { replace?: boolean }) => void;
  home: () => void;
  setUser: (patch: Partial<User>) => void;
  setAddress: (address: Address | null) => void;
  setDraft: (patch: Partial<Draft>) => void;
  setBooking: (booking: Booking) => void;
  startBooking: (category: string) => void;
  confirmBooking: () => Promise<void>;
};
export type ScreenName = keyof typeof SCREENS;
