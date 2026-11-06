import { FontAwesome, Feather } from '@expo/vector-icons';
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ComponentProps,
  type ReactNode,
} from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextProps,
  type ViewProps,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, F, FI, R, SHADOW, type Weight } from './theme';
import type { Manong, Stage } from './types';

export { Feather as Icon, FontAwesome };
export type IconName = ComponentProps<typeof Feather>['name'];

/** Images by key, so mock data can name a photo without require()ing it. */
export const IMG = {
  clariso: require('./assets/clariso.png'),
  pipe: require('./assets/pipe.png'),
  job2: require('./assets/job2.png'),
  map: require('./assets/map.png'),
  illo: require('./assets/illo-manong.png'),
  badge: require('./assets/badge.png'),
  wordmark: require('./assets/wordmark.png'),
};

// Inter on Flow 4 tab pages and sign-in, Plus Jakarta Sans elsewhere.
const FontCtx = createContext<Record<Weight, string>>(F);
export const InterScope = ({ children }: { children: ReactNode }) => (
  <FontCtx.Provider value={FI}>{children}</FontCtx.Provider>
);

type TProps = TextProps & { w?: Weight };
export function T({ w = 400, style, ...props }: TProps) {
  const fonts = useContext(FontCtx);
  return <Text style={[{ fontFamily: fonts[w], color: C.ink, fontSize: 15 }, style]} {...props} />;
}
export const Sub = ({ style, ...p }: TProps) => (
  <T style={[{ fontSize: 13, color: C.slate, lineHeight: 18 }, style]} {...p} />
);
export const ErrorText = ({ text }: { text?: string | null }) =>
  text ? (
    <T accessibilityRole="alert" style={{ color: C.destructive, fontSize: 13 }}>
      {text}
    </T>
  ) : null;

export function Btn({
  kind = 'primary',
  label,
  amount,
  onPress,
  disabled,
  loading,
  icon,
  style,
}: {
  /** primary: dark pill; grey: light pill; white: white pill; text: plain grey text; link: underlined. */
  kind?: 'primary' | 'grey' | 'white' | 'text' | 'link';
  label: string;
  /** Price shown at the right of a primary button, in mango. */
  amount?: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const off = disabled || loading;
  if (kind === 'text' || kind === 'link')
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        disabled={off}
        style={[
          {
            alignSelf: 'center',
            padding: 8,
            flexDirection: 'row',
            gap: 6,
            alignItems: 'center',
            minHeight: 44,
          },
          style,
        ]}
      >
        {icon}
        <T
          w={kind === 'link' ? 700 : 500}
          style={{
            fontSize: 14,
            color: kind === 'link' ? C.ink : C.slate,
            textDecorationLine: kind === 'link' ? 'underline' : 'none',
          }}
        >
          {label}
        </T>
      </Pressable>
    );
  const dark = kind === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={amount ? `${label}, ${amount}` : label}
      accessibilityState={{ disabled: !!off, busy: !!loading }}
      disabled={off}
      onPress={onPress}
      style={[
        s.btn,
        { backgroundColor: dark ? C.ink : kind === 'grey' ? C.grey : C.white },
        amount ? { justifyContent: 'space-between' } : null,
        disabled && { opacity: 0.45 },
        style,
      ]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        {loading ? <ActivityIndicator color={dark ? C.white : C.ink} /> : icon}
        <T w={700} style={{ fontSize: 16, color: dark ? C.white : C.ink }}>
          {label}
        </T>
      </View>
      {!!amount && (
        <T w={800} style={{ fontSize: 17, color: C.mango }}>
          {amount}
        </T>
      )}
    </Pressable>
  );
}

/** Flow 1/4 yellow header: back arrow, category pill, title and subtitle. */
export function Canopy({
  title,
  sub,
  onBack,
  pill,
  right,
}: {
  title: string;
  sub: string;
  onBack: () => void;
  pill?: string;
  right?: ReactNode;
}) {
  return (
    <SafeAreaView edges={['top']} style={s.canopy}>
      <View style={s.canopyRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={onBack}
          style={s.back}
        >
          <Feather name="arrow-left" size={24} color={C.ink} />
        </Pressable>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          {right}
          {!!pill && (
            <View style={s.catpill}>
              <Feather name="tool" size={13} color={C.ink} />
              <T w={800} style={{ fontSize: 12, letterSpacing: 0.5 }}>
                {pill.toUpperCase()}
              </T>
            </View>
          )}
        </View>
      </View>
      <T w={800} style={{ fontSize: 20, marginTop: 10 }}>
        {title}
      </T>
      <Sub style={{ color: C.goldText }}>{sub}</Sub>
    </SafeAreaView>
  );
}

/** Tab page header: big left title, optional back arrow and right-hand link. */
export function Top({
  title,
  onBack,
  right,
}: {
  title: string;
  onBack?: () => void;
  right?: ReactNode;
}) {
  return (
    <SafeAreaView edges={['top']} style={s.top}>
      {onBack && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={onBack}
          style={s.back}
        >
          <Feather name="arrow-left" size={24} color={C.ink} />
        </Pressable>
      )}
      <T w={800} style={{ fontSize: 26, flex: 1 }}>
        {title}
      </T>
      {right}
    </SafeAreaView>
  );
}

export const Card = ({ style, ...p }: ViewProps) => <View style={[s.card, style]} {...p} />;
export const Grey = ({ style, ...p }: ViewProps) => <View style={[s.grey, style]} {...p} />;

/** A numbered card section title: (1) Problem Description. */
export function SectionTitle({ n, title, tag }: { n: number; title: string; tag?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
      <View style={s.num}>
        <T w={800} style={{ fontSize: 13 }}>
          {n}
        </T>
      </View>
      <T w={700} style={{ fontSize: 17, flex: 1 }}>
        {title}
      </T>
      {!!tag && <Pill text={tag} />}
    </View>
  );
}

export const Pill = ({
  text,
  bg = C.cloud,
  color = C.ink,
}: {
  text: string;
  bg?: string;
  color?: string;
}) => (
  <View
    style={{ backgroundColor: bg, borderRadius: R.full, paddingHorizontal: 10, paddingVertical: 4 }}
  >
    <T w={700} style={{ fontSize: 11, color }}>
      {text}
    </T>
  </View>
);

/** Label/value rows (the prototype's .kv). */
export function Kv({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <View style={{ gap: 10 }}>
      {rows.map(([k, v]) => (
        <View key={k} style={s.kv}>
          <T style={{ fontSize: 14, color: C.slate }}>{k}</T>
          {typeof v === 'string' ? (
            <T
              w={600}
              numberOfLines={1}
              style={{ fontSize: 14, flexShrink: 1, textAlign: 'right' }}
            >
              {v}
            </T>
          ) : (
            v
          )}
        </View>
      ))}
    </View>
  );
}

/** Symptom and praise chips. `tone="mango"` fills yellow when on; otherwise dark. */
export function Chip({
  label,
  on,
  onPress,
  tone,
}: {
  label: string;
  on: boolean;
  onPress: () => void;
  tone?: 'mango';
}) {
  const onBg = tone === 'mango' ? C.mango : C.ink;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      onPress={onPress}
      style={[s.chip, on && { backgroundColor: onBg }]}
    >
      <T w={500} style={{ fontSize: 14, color: on && tone !== 'mango' ? C.white : C.ink }}>
        {label}
      </T>
      {on && tone !== 'mango' && <Feather name="check" size={14} color={C.white} />}
    </Pressable>
  );
}
export const Chips = ({ children }: { children: ReactNode }) => (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{children}</View>
);

export function Avatar({ manong, size = 44 }: { manong: Manong; size?: number }) {
  const photo = IMG[manong.key as keyof typeof IMG];
  if (photo)
    return (
      <Image
        source={photo}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        accessibilityIgnoresInvertColors
      />
    );
  return (
    <View style={[s.av, { width: size, height: size, borderRadius: size / 2 }]}>
      <T w={800} style={{ fontSize: Math.round(size * 0.36), color: '#251a00' }}>
        {manong.initials}
      </T>
    </View>
  );
}

export const Verified = ({ label = 'Verified' }: { label?: string }) => (
  <View style={s.verified}>
    <Feather name="award" size={12} color={C.goldText} />
    <T w={700} style={{ fontSize: 11, color: C.goldText }}>
      {label}
    </T>
  </View>
);

// Status chips on Bookings (prototype .f4chip).
const CHIP: Record<Stage, [string, string, string]> = {
  finding: ['Finding Manong', '#fff3cf', '#7a5a00'],
  pending: ['Pending confirmation', '#fff3cf', '#7a5a00'],
  confirmed: ['Confirmed', C.successSoft, '#1f6f43'],
  declined: ['Declined', C.destructiveSoft, '#a12323'],
  onway: ['On the way', '#fff3cf', '#7a5a00'],
  arrived: ['Arrived', '#fff3cf', '#7a5a00'],
  done: ['Job done', C.grey, '#444'],
};
export const StatusChip = ({ stage }: { stage: Stage }) => (
  <Pill text={CHIP[stage][0]} bg={CHIP[stage][1]} color={CHIP[stage][2]} />
);

export function Field({ label, ...input }: TextInputProps & { label: string }) {
  return (
    <View style={{ gap: 6 }}>
      <T w={600} style={{ fontSize: 13 }}>
        {label}
      </T>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={C.muted}
        style={s.input}
        {...input}
      />
    </View>
  );
}

export function Box(props: TextInputProps & { label: string; count?: boolean }) {
  const { label, count, value, ...rest } = props;
  return (
    <View style={{ gap: 4 }}>
      <TextInput
        accessibilityLabel={label}
        multiline
        placeholderTextColor={C.muted}
        value={value}
        style={s.box}
        {...rest}
      />
      {count && (
        <Sub style={{ alignSelf: 'flex-end', fontSize: 12 }}>
          {(value ?? '').length} / 300 characters
        </Sub>
      )}
    </View>
  );
}

/** Bottom sheet over a scrim. Tapping the scrim closes it. */
export function Sheet({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Close"
        style={{ flex: 1, backgroundColor: C.scrim }}
        onPress={onClose}
      />
      <SafeAreaView edges={['bottom']} style={s.sheet}>
        <View style={s.grab} />
        <ScrollView
          style={{ maxHeight: 620 }}
          contentContainerStyle={{ gap: 12 }}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
export const SheetTitle = ({ title, sub }: { title: string; sub?: string }) => (
  <View style={{ gap: 4 }}>
    <T w={800} style={{ fontSize: 20 }}>
      {title}
    </T>
    {!!sub && <Sub style={{ fontSize: 14 }}>{sub}</Sub>}
  </View>
);

/** A tappable option row in a sheet, with a check when selected. */
export function Opt({
  title,
  sub,
  on,
  onPress,
  icon,
}: {
  title: string;
  sub?: string;
  on?: boolean;
  onPress: () => void;
  icon?: ReactNode;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!on }}
      onPress={onPress}
      style={[s.opt, on && { borderColor: C.ink }]}
    >
      {icon}
      <View style={{ flex: 1 }}>
        <T w={700}>{title}</T>
        {!!sub && <Sub>{sub}</Sub>}
      </View>
      {on && <Feather name="check" size={18} color={C.ink} />}
    </Pressable>
  );
}

export function Loader({ label }: { label?: string }) {
  return (
    <View style={{ padding: 32, alignItems: 'center', gap: 10 }}>
      <ActivityIndicator color={C.ink} />
      {!!label && <Sub>{label}</Sub>}
    </View>
  );
}

export function Toast({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <View pointerEvents="none" style={s.toastWrap}>
      <View style={s.toast} accessibilityLiveRegion="polite">
        <T w={500} style={{ color: C.white, fontSize: 14, textAlign: 'center' }}>
          {message}
        </T>
      </View>
    </View>
  );
}

/** A progress bar that eases to `value` (0 to 1). */
export function Progress({ value }: { value: number }) {
  const w = useRef(new Animated.Value(value)).current;
  useEffect(() => {
    Animated.timing(w, { toValue: value, duration: 350, useNativeDriver: false }).start();
  }, [value]);
  return (
    <View
      style={s.bar}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }}
    >
      <Animated.View
        style={[
          s.barFill,
          { width: w.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
        ]}
      />
    </View>
  );
}

/** The static map with the Manong's pins and the building. TODO(backend): a live location feed. */
export function MapView({
  building,
  finding,
  height = 330,
}: {
  building: string;
  finding?: boolean;
  height?: number;
}) {
  const pins: [IconName, number, number][] = finding
    ? [
        ['navigation', 17, 26],
        ['briefcase', 68, 34],
        ['tool', 25, 72],
      ]
    : [
        ['navigation', 19, 30],
        ['briefcase', 68, 38],
      ];
  return (
    <View
      style={{ height, overflow: 'hidden' }}
      accessible
      accessibilityLabel={`Map around ${building}`}
    >
      <Image source={IMG.map} style={StyleSheet.absoluteFill} resizeMode="cover" />
      <View style={[s.pulse, { top: height * 0.58 - 70 }]} />
      {pins.map(([icon, x, y]) => (
        <View key={icon} style={[s.pin, { left: `${x}%`, top: `${y}%` }]}>
          <Feather name={icon} size={16} color={C.ink} />
        </View>
      ))}
      <View style={[s.mapLabel, { top: height * 0.58 - 46 }]}>
        <Feather name="home" size={13} color={C.mango} />
        <T w={700} style={{ fontSize: 13, color: C.white }}>
          {building}
        </T>
      </View>
      <View style={[s.homePin, { top: height * 0.58 - 12 }]} />
    </View>
  );
}

export type Tab = 'home' | 'bookings' | 'messages' | 'account';
export function TabBar({ on, go, dot }: { on: Tab; go: (tab: Tab) => void; dot?: boolean }) {
  const tabs: [Tab, IconName, string][] = [
    ['home', 'home', 'Home'],
    ['bookings', 'calendar', 'Bookings'],
    ['messages', 'message-circle', 'Messages'],
    ['account', 'user', 'Account'],
  ];
  return (
    <SafeAreaView edges={['bottom']} style={s.tabbar}>
      {tabs.map(([k, icon, label]) => (
        <Pressable
          key={k}
          accessibilityRole="tab"
          accessibilityLabel={label}
          accessibilityState={{ selected: on === k }}
          onPress={() => go(k)}
          style={s.tab}
        >
          {on === k && <View style={s.tabMark} />}
          <View>
            <Feather name={icon} size={22} color={on === k ? C.ink : '#8a8a8a'} />
            {dot && k === 'bookings' && <View style={s.tabDot} />}
          </View>
          <T w={on === k ? 700 : 500} style={{ fontSize: 12, color: on === k ? C.ink : '#8a8a8a' }}>
            {label}
          </T>
        </Pressable>
      ))}
    </SafeAreaView>
  );
}

/** The dark strip above the tab bar that follows the resident while a booking is active. */
export function Strip({
  manong,
  title,
  sub,
  onPress,
}: {
  manong: Manong;
  title: string;
  sub: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open your active booking: ${title}`}
      onPress={onPress}
      style={s.strip}
    >
      <Avatar manong={manong} size={40} />
      <View style={{ flex: 1 }}>
        <T w={700} numberOfLines={1} style={{ color: C.white, fontSize: 14 }}>
          {title}
        </T>
        <T numberOfLines={1} style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>
          {sub}
        </T>
      </View>
      <Feather name="chevron-right" size={20} color={C.mango} />
    </Pressable>
  );
}

const s = StyleSheet.create({
  btn: {
    height: 56,
    borderRadius: R.full,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 22,
  },
  canopy: {
    backgroundColor: C.mango,
    borderBottomLeftRadius: R.canopy,
    borderBottomRightRadius: R.canopy,
    paddingHorizontal: 22,
    paddingBottom: 18,
    zIndex: 3,
    ...SHADOW.card,
  },
  canopyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: -10,
    paddingTop: 6,
  },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  catpill: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    backgroundColor: C.mangoPale,
    borderRadius: R.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: C.paper,
  },
  card: { backgroundColor: C.white, borderRadius: R.card, padding: 16, ...SHADOW.card },
  grey: { backgroundColor: C.cloud, borderRadius: R.card, padding: 14, gap: 12 },
  num: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: C.mango,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kv: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  chip: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: R.full,
    backgroundColor: C.grey,
    minHeight: 40,
  },
  av: { backgroundColor: C.mangoSoft, alignItems: 'center', justifyContent: 'center' },
  verified: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    backgroundColor: '#fff3cf',
    borderRadius: R.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  input: {
    backgroundColor: C.cloud,
    borderRadius: R.control,
    paddingHorizontal: 14,
    height: 52,
    fontFamily: F[400],
    fontSize: 15,
    color: C.ink,
  },
  box: {
    backgroundColor: C.cloud,
    borderRadius: R.control,
    padding: 14,
    minHeight: 76,
    fontFamily: F[400],
    fontSize: 15,
    color: C.ink,
    textAlignVertical: 'top',
  },
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: R.sheet,
    borderTopRightRadius: R.sheet,
    padding: 22,
    paddingTop: 10,
    ...SHADOW.sheet,
  },
  grab: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignSelf: 'center',
    marginBottom: 12,
  },
  opt: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: C.line,
    borderRadius: R.card,
    padding: 14,
    minHeight: 56,
  },
  toastWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 150,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  toast: {
    backgroundColor: C.ink,
    borderRadius: R.full,
    paddingHorizontal: 18,
    paddingVertical: 12,
    maxWidth: 360,
  },
  bar: { height: 6, borderRadius: 3, backgroundColor: C.grey, overflow: 'hidden' },
  barFill: { height: 6, backgroundColor: C.mango },
  pulse: {
    position: 'absolute',
    alignSelf: 'center',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,199,44,0.28)',
  },
  pin: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.card,
  },
  mapLabel: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: R.control,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  homePin: {
    position: 'absolute',
    alignSelf: 'center',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: C.mango,
    borderWidth: 4,
    borderColor: C.white,
  },
  tabbar: {
    flexDirection: 'row',
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.grey,
  },
  tab: { flex: 1, alignItems: 'center', gap: 2, paddingTop: 8, paddingBottom: 6, minHeight: 52 },
  tabMark: {
    position: 'absolute',
    top: 0,
    width: 28,
    height: 3,
    borderRadius: 2,
    backgroundColor: C.ink,
  },
  tabDot: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.unread,
  },
  strip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 12,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: C.ink,
    borderRadius: R.card,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
});
