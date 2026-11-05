import { useEffect, useRef, useState } from 'react';
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
import { getCatalog } from './services/bookings';
import { C } from './theme';
import { Btn, ErrorText, Loader, Toast } from './ui';
import type { Account, App as AppApi, AppState, Draft, Manong, ScreenName } from './types';
import { AllSet, Address, Code, Login, Name, Phone, Welcome } from './screens/Onboarding';
import { Home, Notifications } from './screens/Home';
import {
  AddressPick,
  Finding,
  NoneFree,
  NoneNearby,
  Problem,
  Review,
  Route,
  Schedule,
  Size,
} from './screens/Book';
import {
  Cancelled,
  Charges,
  Part,
  Rate,
  Report,
  ReportSent,
  Status,
  Thanks,
} from './screens/After';
import {
  AddressForm,
  Addresses,
  Bookings,
  Payments,
  Personal,
  Profile,
  Receipt,
} from './screens/Account';
import { Chat, ManongProfile } from './screens/Manong';

// Flow 3 "Full overhaul" from prototype/full.js.
export const SCREENS = {
  welcome: Welcome,
  login: Login,
  phone: Phone,
  code: Code,
  name: Name,
  address: Address,
  allset: AllSet,
  home: Home,
  notifications: Notifications,
  addrpick: AddressPick,
  addrform: AddressForm,
  size: Size,
  problem: Problem,
  route: Route,
  schedule: Schedule,
  finding: Finding,
  none: NoneFree,
  nonearby: NoneNearby,
  review: Review,
  manong: ManongProfile,
  status: Status,
  part: Part,
  charges: Charges,
  rate: Rate,
  thanks: Thanks,
  cancelled: Cancelled,
  report: Report,
  reportsent: ReportSent,
  chat: Chat,
  bookings: Bookings,
  receipt: Receipt,
  profile: Profile,
  personal: Personal,
  addresses: Addresses,
  payments: Payments,
};

const emptyAccount = (): Account => ({
  user: { first: '', last: '', phone: '' },
  addresses: [],
  payment: 'gcash',
  past: [],
  upcoming: [],
  notifications: [],
  chat: [],
});

const newDraft = (
  category: string,
  catalog: AppState['catalog'],
  preferred: Manong | null = null,
): Draft => ({
  category,
  serviceType: catalog[category]?.defaultTier ?? 'STANDARD',
  desc: '',
  symptoms: [],
  photos: 0,
  dropoff: '',
  // Locked out means someone should come now.
  bookingType: category === 'locks' ? 'on-demand' : 'scheduled',
  day: null,
  time: null,
  manong: null,
  preferred: preferred?.first ?? null,
  retried: false,
});

const startState = (): AppState => ({
  ...emptyAccount(),
  catalog: {},
  addressIdx: 0,
  draft: newDraft('plumbing', {}),
  booking: null,
  pendingReview: false,
  cancelled: null,
  receiptIdx: 0,
  viewManong: null,
  addrEdit: -1,
  reportFrom: 'charges',
  noneFrom: '',
  regMode: 'new',
});

// shortcut: a plain screen stack instead of a navigator; move to Expo Router when deep links land.
export default function App() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });
  const [stack, setStack] = useState<ScreenName[]>(['welcome']);
  const [state, setState] = useState<AppState>(startState);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const loadCatalog = () => {
    setLoadError(null);
    getCatalog()
      .then((catalog) => setState((s) => ({ ...s, catalog })))
      .catch((e: Error) => setLoadError(e.message));
  };
  useEffect(loadCatalog, []);

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
    state,
    back,
    go: (screen, { replace, reset } = {}) =>
      setStack((st) => (reset ? ['home', screen] : [...(replace ? st.slice(0, -1) : st), screen])),
    home: () => setStack(['home']),
    update: (patch) =>
      setState((s) => ({ ...s, ...(typeof patch === 'function' ? patch(s) : patch) })),
    setDraft: (patch) => setState((s) => ({ ...s, draft: { ...s.draft, ...patch } })),
    toast: (message) => {
      clearTimeout(toastTimer.current);
      setToast(message);
      toastTimer.current = setTimeout(() => setToast(null), 2600);
    },
    startBooking: (category, preferred = null) => {
      setState((s) => ({ ...s, draft: newDraft(category, s.catalog, preferred) }));
      setStack(['home', 'size']);
      if (preferred) app.toast(`Requesting ${preferred.first} again`);
    },
    signIn: (account, message) => {
      setState((s) => ({ ...s, ...account, addressIdx: 0, booking: null }));
      setStack(['home']);
      if (message) app.toast(message);
    },
    logOut: () => {
      setState((s) => ({ ...startState(), catalog: s.catalog }));
      setStack(['welcome']);
      app.toast('Logged out');
    },
  };

  if (loadError)
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          padding: 24,
          gap: 12,
          backgroundColor: C.paper,
        }}
      >
        <ErrorText text={`Couldn't load Mang Juan: ${loadError}`} />
        <Btn label="Try again" onPress={loadCatalog} />
      </View>
    );
  if (!fontsLoaded || !Object.keys(state.catalog).length)
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: C.mango }}>
        <Loader />
      </View>
    );
  const Current = SCREENS[stack[stack.length - 1]];
  return (
    <SafeAreaProvider>
      <Current app={app} />
      <Toast message={toast} />
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
