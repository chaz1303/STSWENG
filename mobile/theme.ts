// Design Kit tokens (DESIGN.md) plus the Flow 4 values from prototype/styles.css (.A, .f4*).
export const C = {
  mango: '#ffc72c',
  /** Flow 1/4 auth ground. */
  mangoAuth: '#ffd12e',
  mangoSoft: '#ffdf99',
  mangoPale: '#fff8dc',
  gold: '#775a00',
  goldText: '#5a4300',
  ink: '#1a1c1c',
  slate: '#555555',
  muted: '#777777',
  line: '#e4e4e4',
  grey: '#ececec',
  cloud: '#f3f3f3',
  paper: '#f7f7f7',
  white: '#ffffff',
  success: '#1f7a4d',
  successSoft: '#e3f4ea',
  destructive: '#b3261e',
  destructiveSoft: '#fde8e8',
  unread: '#c62828',
  gcash: '#005bc0',
  star: '#fdbb16',
  scrim: 'rgba(0,0,0,0.4)',
};

// DESIGN.md "rounded".
export const R = { stamp: 8, control: 12, tile: 14, card: 16, sheet: 24, canopy: 28, full: 999 };

export const SHADOW = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
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
// Booking screens use Plus Jakarta Sans; Flow 4's tab pages and sign-in use Inter, like the prototype.
export const F = {
  400: 'PlusJakartaSans_400Regular',
  500: 'PlusJakartaSans_500Medium',
  600: 'PlusJakartaSans_600SemiBold',
  700: 'PlusJakartaSans_700Bold',
  800: 'PlusJakartaSans_800ExtraBold',
} as const;
export const FI: Record<Weight, string> = {
  400: 'Inter_400Regular',
  500: 'Inter_500Medium',
  600: 'Inter_600SemiBold',
  700: 'Inter_700Bold',
  800: 'Inter_800ExtraBold',
};
export type Weight = keyof typeof F;

export const peso = (n: number) => '₱' + n.toLocaleString('en-PH');
