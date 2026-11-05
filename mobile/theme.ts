// Design Kit tokens (DESIGN.md, prototype/styles.css :root).
export const C = {
  mango: '#ffc72c',
  mangoSoft: '#ffdf99',
  mangoPale: '#fff4d6',
  gold: '#775a00',
  goldText: '#5a4300',
  ink: '#1a1c1c',
  slate: '#5f5e5e',
  line: '#dadada',
  cloud: '#eeeeee',
  paper: '#f9f9f9',
  white: '#ffffff',
  success: '#1f7a4d',
  successSoft: '#e3f2e9',
  destructive: '#b3261e',
  unread: '#c62828',
  gcash: '#005bc0',
  late: '#b26a00',
  star: '#fdbb16',
  scrim: 'rgba(0,0,0,0.4)',
};

// DESIGN.md "rounded".
export const R = { stamp: 8, control: 12, tile: 14, card: 16, sheet: 24, full: 999 };

// Tickets get a soft drop, primary buttons a stronger one, the map sheet lifts upward.
export const SHADOW = {
  ticket: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  sheet: {
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: -8 },
    elevation: 12,
  },
};

// Custom fonts ignore fontWeight on Android, so each weight is its own family.
export const F = {
  400: 'PlusJakartaSans_400Regular',
  500: 'PlusJakartaSans_500Medium',
  600: 'PlusJakartaSans_600SemiBold',
  700: 'PlusJakartaSans_700Bold',
  800: 'PlusJakartaSans_800ExtraBold',
} as const;
export type Weight = keyof typeof F;

export const peso = (n: number) => '₱' + n.toLocaleString('en-PH');
