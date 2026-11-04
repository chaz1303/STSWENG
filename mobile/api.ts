import { BOOKING_STATES, INITIAL_STATE, TRANSITIONS } from '../src/utils/contract.js';

// shortcut: in-memory mock with no server, swap each function for a fetch() once the backend routes exist.
// Catalog, prices and Manongs are copied from prototype/full.js (CAT3, ALF3, JOHN3).

const tier = (name, desc, price, meta, gold = false) => ({ name, desc, price, meta, gold });

// Tier keys are the contract's SERVICE_TYPES keys (CHECKUP / STANDARD / MAJOR).
const CATALOG = {
  plumbing: {
    name: 'Plumbing',
    icon: 'droplet',
    q: 'How big is the job?',
    note: 'Prices are fixed. If parts are needed, Manong will let you know.',
    tiers: {
      CHECKUP: tier('Quick checkup', 'Inspection or a very small fix', 250, 'Base charge'),
      STANDARD: tier('Standard repair', 'Typical repair in one visit', 450, 'Most booked', true),
      MAJOR: tier('Major repair', 'Installation or longer work', 800, 'Starting price'),
    },
    chips: 'Add a symptom',
    symptoms: ['Leak', 'Clogged drain', 'No water', 'Low pressure', 'Running toilet'],
    ph: 'e.g. water dripping under the kitchen sink',
    materials: [
      ['P-trap, PVC 1½ in', 180],
      ["Plumber's tape", 35],
    ],
  },
  electrical: {
    name: 'Electrical',
    icon: 'zap',
    q: 'How big is the job?',
    note: 'Smell burning? Switch off the main breaker first, then book.',
    tiers: {
      CHECKUP: tier('Quick check', 'Breaker or dead outlet', 300, 'Base charge'),
      STANDARD: tier('Standard repair', 'Outlet, switch or light', 550, 'Most booked', true),
      MAJOR: tier('Rewiring', 'New circuit or panel work', 1200, 'Starting price'),
    },
    chips: 'Add a symptom',
    symptoms: [
      'No power',
      'Tripping breaker',
      'Sparking outlet',
      'Flickering lights',
      'Dead switch',
    ],
    ph: 'e.g. the kitchen outlet sparks when I plug in',
    materials: [
      ['Duplex outlet', 160],
      ['Electrical tape', 30],
    ],
  },
  cleaning: {
    name: 'Cleaning',
    icon: 'star',
    q: 'How big is your place?',
    note: 'Cleaners bring their own supplies. You can mention pets in the next step.',
    tiers: {
      CHECKUP: tier('Studio', 'Up to 25 sqm, about 2 hrs', 800, 'Fixed price'),
      STANDARD: tier('1 bedroom', '26 to 45 sqm, about 3 hrs', 1200, 'Most booked', true),
      MAJOR: tier('2 bedrooms', '46 to 70 sqm, about 4 hrs', 1700, 'Fixed price'),
    },
    chips: 'Anything we should know?',
    symptoms: ['Has pets', 'Deep clean', 'Kitchen', 'Bathroom', 'Inside the fridge'],
    ph: 'e.g. focus on the kitchen and bathroom',
    materials: [['Mold remover', 120]],
  },
  repairs: {
    name: 'Repairs',
    icon: 'tool',
    q: 'What needs repairing?',
    note: 'Not sure which one? Pick the closest. Manong confirms the price before starting.',
    tiers: {
      CHECKUP: tier('Small fix', 'Hinge, shelf or curtain rod', 400, 'Base charge'),
      STANDARD: tier('Standard repair', 'Door, cabinet or wall', 700, 'Most booked', true),
      MAJOR: tier('Painting', 'One wall, no paint', 1800, 'Starting price'),
    },
    chips: 'Add a symptom',
    symptoms: ['Door', 'Cabinet', 'Wall patch', 'Furniture', 'Window'],
    ph: 'e.g. the cabinet door hinge came off',
    materials: [['Hinges (pair)', 140]],
  },
  locks: {
    name: 'Locks',
    defaultTier: 'CHECKUP',
    icon: 'key',
    q: 'What do you need?',
    note: 'Have your ID ready. Manong checks that you live here before opening the door.',
    tiers: {
      CHECKUP: tier("I'm locked out", 'A Manong comes now', 650, 'Arrives in ~30 min', true),
      STANDARD: tier('Change a lock', 'New cylinder or deadbolt', 900, 'Fixed price'),
      MAJOR: tier('Fit a smart lock', 'You provide the lock', 1500, 'Starting price'),
    },
    chips: 'What happened?',
    symptoms: ['Lost my keys', 'Key broke inside', 'Door is jammed', 'Lock is old'],
    ph: 'e.g. left my keys inside the unit',
    materials: [['Lock cylinder', 350]],
  },
  moving: {
    name: 'Moving',
    icon: 'truck',
    q: 'How much are you moving?',
    note: 'Prices cover moves within Metro Manila. Longer trips get a quote first.',
    tiers: {
      CHECKUP: tier('A few items', 'Up to 10 boxes, 1 van', 1500, 'Fixed price'),
      STANDARD: tier('Studio', '1 truck, 2 movers', 3500, 'Most booked', true),
      MAJOR: tier('1 to 2 bedrooms', '1 truck, 3 movers', 6000, 'Starting price'),
    },
    chips: 'Anything movers should know?',
    symptoms: [
      'Elevator at pick-up',
      'Elevator at drop-off',
      'Fragile items',
      'Needs packing',
      'Stairs only',
    ],
    ph: 'e.g. pick-up at Unit 12B, drop-off at The Grove, Pasig',
    materials: [['Extra packing boxes', 150]],
  },
};

const MANONGS = [
  {
    name: 'Alfred Pennyworth',
    first: 'Alfred',
    initial: 'A',
    skills: 'Plumbing and electrical',
    rating: '4.9',
    jobs: 342,
  },
  {
    name: 'John Stewart',
    first: 'John',
    initial: 'J',
    skills: 'Plumbing',
    rating: '4.8',
    jobs: 128,
  },
];

// Each state's first allowed transition in the contract is the happy path.
export function statusSteps(bookingType) {
  const steps = [INITIAL_STATE[bookingType]];
  let next;
  while ((next = TRANSITIONS[bookingType][steps.at(-1)]?.[0])) steps.push(next);
  return steps;
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let nextId = 8821;
const bookings = {};

export async function getCatalog() {
  return CATALOG;
}

export async function sendCode(phone) {
  if (phone.replace(/\D/g, '').length !== 10) throw new Error('Enter a 10-digit mobile number.');
}

// shortcut: any 6 digits pass except 000000, which simulates a wrong code.
export async function verifyCode(phone, code) {
  if (code === '000000')
    throw new Error("That code didn't match. Check the latest text from Mang Juan and try again.");
  return { phone };
}

export async function findManong(bookingType) {
  await wait(2500);
  return MANONGS[bookingType === 'on-demand' ? 1 : 0];
}

export async function createBooking(draft) {
  const booking = {
    ...draft,
    id: `MJ-${nextId++}`,
    status: INITIAL_STATE[draft.bookingType],
    materials: [],
  };
  bookings[booking.id] = booking;
  return { ...booking };
}

// Each call moves the booking one step along the happy path, standing in for the aide side.
export async function getBooking(id) {
  const b = bookings[id];
  const steps = statusSteps(b.bookingType);
  const i = steps.indexOf(b.status);
  if (i < steps.length - 1) b.status = steps[i + 1];
  if (b.status === BOOKING_STATES.COMPLETED) b.materials = CATALOG[b.category].materials;
  return { ...b };
}

export async function payBooking(id, method) {
  Object.assign(bookings[id], { paid: true, payment: method });
  return { ...bookings[id] };
}

export async function rateBooking(id, rating) {
  bookings[id].rating = rating;
}
