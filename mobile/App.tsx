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
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_800ExtraBold,
} from '@expo-google-fonts/inter';
import { getCatalog } from './services/bookings';
import { C } from './theme';
import { Btn, ErrorText, Loader, Toast } from './ui';
import type { Account, App as AppApi, AppState, Draft, ScreenName, Stage } from './types';
import { Login, Welcome } from './screens/Onboarding';
import { Account as AccountTab, Bookings, Home, Messages, Notifications } from './screens/Home';
import { Details, Pick, Service } from './screens/Book';
import { Declined, Finding, Found, Pending, Summary, Thanks } from './screens/After';

// Flow 4 "Final" from prototype/full.js.
export const SCREENS = {
  welcome: Welcome,
  login: Login,
  home: Home,
  bookings: Bookings,
  messages: Messages,
  account: AccountTab,
  notifications: Notifications,
  service: Service,
  details: Details,
  pick: Pick,
  finding: Finding,
  found: Found,
  pending: Pending,
  declined: Declined,
  summary: Summary,
  thanks: Thanks,
};

/** Where each status of the active booking lives (prototype ROUTE_F). */
const ROUTE: Record<Stage, ScreenName> = {
  finding: 'finding',
  pending: 'pending',
  confirmed: 'pending',
  declined: 'declined',
  onway: 'found',
  arrived: 'found',
  done: 'summary',
};

const emptyAccount = (): Account => ({
  user: { name: '', initials: '', phone: '', email: '' },
  addresses: [],
  payment: 'gcash',
  voucher: true,
  past: [],
  notifications: [],
  chat: [],
  alerts: { bookings: true, promos: false },
});

const newDraft = (category: string): Draft => ({
  category,
  serviceType: 'CHECKUP',
  desc: '',
  symptoms: [],
  photos: 0,
  notes: '',
  bookingType: 'on-demand',
  day: 1,
  time: '10:30 AM',
  manongKey: null,
  avoidKey: null,
});

const startState = (): AppState => ({
  ...emptyAccount(),
  catalog: {},
  addressIdx: 0,
  draft: newDraft('plumbing'),
  booking: null,
  eta: 10,
  partAsk: false,
  thanks: null,
});

// shortcut: a plain screen stack instead of a navigator; move to Expo Router when deep links land.
export default function App() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_800ExtraBold,
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
    startBooking: (category, again) => {
      // One booking at a time, like the prototype.
      if (state.booking) return app.toast('You have an active booking. Open it from Bookings.');
      setState((s) => ({ ...s, draft: { ...newDraft(category), ...(again ?? {}) } }));
      setStack(again ? ['home', 'service', 'details'] : ['home', 'service']);
    },
    openBooking: (stage = state.booking?.stage) => {
      if (stage) setStack(['home', ROUTE[stage]]);
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
