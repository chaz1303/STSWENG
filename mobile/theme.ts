// Tokens copied from prototype/styles.css :root.
export const C = {
  mango: '#ffc72c',
  mangoSoft: '#ffdf99',
  mangoPale: '#fff4d6',
  gold: '#775a00',
  ink: '#1a1c1c',
  slate: '#5f5e5e',
  line: '#dadada',
  cloud: '#eeeeee',
  paper: '#f9f9f9',
  white: '#ffffff',
  success: '#1f7a4d',
  destructive: '#b3261e',
  gcash: '#005bc0',
  star: '#fdbb16',
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
