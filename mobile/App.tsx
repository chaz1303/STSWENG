import { useEffect, useState } from 'react';
import { BackHandler, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { BOOKING_TYPES } from '../src/utils/contract.js';
import { createBooking, getCatalog } from './api';
import { C } from './theme';
import type { App as AppApi, AppState, Draft, ScreenName, ServiceType } from './types';
import { AllSet, Address, Code, Name, Phone, Welcome } from './screens/Onboarding';
import { Home } from './screens/Home';
import { Finding, Problem, Review, Schedule, Size } from './screens/Book';
import { Charges, Rate, Status, Thanks } from './screens/After';

// Flow 3 "Full overhaul" happy path from prototype/full.js.
export const SCREENS = {
  welcome: Welcome,
  phone: Phone,
  code: Code,
  name: Name,
  address: Address,
  allset: AllSet,
  home: Home,
  size: Size,
  problem: Problem,
  schedule: Schedule,
  finding: Finding,
  review: Review,
  status: Status,
  charges: Charges,
  rate: Rate,
  thanks: Thanks,
};

const newDraft = (category: string, serviceType: ServiceType = 'STANDARD'): Draft => ({
  category,
  serviceType,
  desc: '',
  symptoms: [],
  bookingType: BOOKING_TYPES.SCHEDULED,
  day: null,
  time: null,
  payment: 'gcash',
  manong: null,
});

// shortcut: a plain screen stack instead of a navigator; move to Expo Router when deep links or tabs land.
export default function App() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  const [stack, setStack] = useState<ScreenName[]>(['welcome']);
  // Nullable here; screens only see it once the catalog (and, for booking steps, the draft) exists.
  const [state, setState] = useState<
    Omit<AppState, 'catalog' | 'draft'> & Partial<Pick<AppState, 'catalog' | 'draft'>>
  >({
    catalog: undefined,
    user: { first: '', last: '', phone: '' },
    address: null,
    draft: undefined,
    booking: null,
  });

  useEffect(() => {
    getCatalog().then((catalog) => setState((s) => ({ ...s, catalog })));
  }, []);

  const setUser = (patch: Partial<AppState['user']>) =>
    setState((s) => ({ ...s, user: { ...s.user, ...patch } }));
  const setDraft = (patch: Partial<Draft>) =>
    setState((s) => ({ ...s, draft: s.draft && { ...s.draft, ...patch } }));
  const back = () => setStack((st) => (st.length > 1 ? st.slice(0, -1) : st));

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stack.length === 1) return false;
      back();
      return true;
    });
    return () => sub.remove();
  }, [stack.length]);

  const app: AppApi = {
    state: state as AppState,
    back,
    go: (screen, { replace } = {}) =>
      setStack((st) => [...(replace ? st.slice(0, -1) : st), screen]),
    home: () => setStack(['home']),
    setUser,
    setAddress: (address) => setState((s) => ({ ...s, address })),
    setDraft,
    setBooking: (booking) => setState((s) => ({ ...s, booking })),
    startBooking: (category) => {
      setState((s) => ({ ...s, draft: newDraft(category, s.catalog?.[category].defaultTier) }));
      setStack(['home', 'size']);
    },
    confirmBooking: async () => {
      if (!state.draft) return;
      const booking = await createBooking(state.draft);
      setState((s) => ({ ...s, booking }));
      setStack(['home', 'status']);
    },
  };

  if (!fontsLoaded || !state.catalog) return <View style={{ flex: 1, backgroundColor: C.mango }} />;
  const Current = SCREENS[stack[stack.length - 1]];
  return (
    <SafeAreaProvider>
      <Current app={app} />
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
