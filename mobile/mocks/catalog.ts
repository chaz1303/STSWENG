// Copied from prototype/full.js Flow 4 (OLD_TILES, SVC4, TIER_F) and Flow 3's per-service prices (CAT3),
// since Flow 4's Home shows those "from" prices. Tier keys are the contract's SERVICE_TYPES keys.
import type { Catalog, Tier } from '../types';

const t = (name: string, desc: string, price: number, unit = 'Fixed base', plus = false): Tier => ({
  name,
  desc,
  price,
  unit,
  plus,
});
const badged = (tiers: Record<'CHECKUP' | 'STANDARD' | 'MAJOR', Tier>) => ({
  CHECKUP: { ...tiers.CHECKUP, badge: 'CHEAPEST DEAL' },
  STANDARD: { ...tiers.STANDARD, badge: 'MOST POPULAR' },
  MAJOR: tiers.MAJOR,
});

export const CATALOG: Catalog = {
  cleaning: {
    name: 'Cleaning',
    label: 'Cleaning',
    blurb: 'Home and deep cleaning',
    pro: 'Cleaning Specialist',
    icon: 'star',
    tiers: badged({
      CHECKUP: t('Studio', 'Up to 25 sqm', 800),
      STANDARD: t('1 Bedroom', '26 to 45 sqm', 1200),
      MAJOR: t('2 Bedrooms', '46 to 70 sqm', 1700),
    }),
    symptoms: ['Has pets', 'Deep clean', 'Kitchen', 'Bathroom', 'Inside the fridge'],
    part: ['Cleaning solution', 120],
  },
  plumbing: {
    name: 'Plumbing',
    label: 'House Repairs',
    blurb: 'Leaks, clogs, fixtures and electrical',
    pro: 'Plumbing Specialist',
    icon: 'tool',
    tiers: badged({
      CHECKUP: t('Quick Checkup', 'Inspection, meter test, minor fuse check', 250),
      STANDARD: t('Standard Repair', 'Aircon clean, plumbing clogs, socket rewire', 450),
      MAJOR: t(
        'Major Overhaul',
        'Drain overhaul, toilet reinstall, pump or heater install',
        800,
        'Starting price',
        true,
      ),
    }),
    symptoms: ['Slow Drain', 'Dripping Water', 'Low Pressure', 'Strange Smell', 'Burst Pipe'],
    part: ['P-trap, PVC 1½ in', 180],
  },
  locks: {
    name: 'Locks',
    label: 'Locksmith',
    blurb: 'Lockouts, rekeying, new locks',
    pro: 'Locksmith',
    icon: 'lock',
    tiers: badged({
      CHECKUP: t("I'm Locked Out", 'Lost keys or a jammed lock', 650),
      STANDARD: t('Change a Lock', 'New cylinder or deadbolt', 900),
      MAJOR: t('Fit a Smart Lock', 'A keypad lock you already have', 1500, 'Starting price', true),
    }),
    symptoms: ['Lost my keys', 'Key broke inside', 'Door is jammed', 'Lock is old'],
    part: ['Lock cylinder', 350],
  },
  moving: {
    name: 'Moving',
    label: 'Movers',
    blurb: 'Studio to 2BR, crew and van included',
    pro: 'Moving Crew',
    icon: 'truck',
    tiers: badged({
      CHECKUP: t('A Few Items', 'Up to 10 boxes, 1 van', 1500),
      STANDARD: t('Studio', '1 truck, 2 movers', 3500),
      MAJOR: t('1 to 2 Bedrooms', '1 truck, 3 movers', 6000, 'Starting price', true),
    }),
    symptoms: [
      'Elevator at pick-up',
      'Elevator at drop-off',
      'Fragile items',
      'Needs packing',
      'Stairs only',
    ],
    part: ['Packing boxes (5)', 150],
  },
};

/** The shared contract's durations (userStories.pdf p.2), as Flow 4 shows them. */
export const DURATION = { CHECKUP: '~15 mins', STANDARD: '30–60 mins', MAJOR: '1 hr +' } as const;
