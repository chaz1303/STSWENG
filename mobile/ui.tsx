import { Feather } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type TextProps,
  type ViewProps,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { C, F, R, SHADOW, type Weight } from './theme';
import type { Stage } from './types';

export { Feather as Icon };
export type IconName = ComponentProps<typeof Feather>['name'];

type TProps = TextProps & { w?: Weight };

export function T({ w = 400, style, ...props }: TProps) {
  return <Text style={[{ fontFamily: F[w], color: C.ink }, style]} {...props} />;
}

export const H = ({ style, ...p }: TProps) => <T w={700} style={[s.h, style]} {...p} />;
export const Sub = ({ style, ...p }: TProps) => <T style={[s.sub, style]} {...p} />;
export const Label = ({ style, ...p }: TProps) => <T w={600} style={[s.label, style]} {...p} />;
export const ErrorText = ({ text }: { text?: string | null }) =>
  text ? (
    <T accessibilityRole="alert" style={{ color: C.destructive, fontSize: 13 }}>
      {text}
    </T>
  ) : null;

// Scrolling body with an optional pinned footer, like the prototype's .scroll + .footer.
export function Screen({
  header,
  footer,
  children,
  bg = C.paper,
  pad = true,
  top = true,
}: {
  header?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  bg?: string;
  pad?: boolean;
  /** false when the content draws its own band under the status bar. */
  top?: boolean;
}) {
  return (
    <SafeAreaView
      edges={header || !top ? ['bottom'] : ['top', 'bottom']}
      style={{ flex: 1, backgroundColor: bg }}
    >
      {header}
      <ScrollView contentContainerStyle={[pad && s.pad, { gap: 12, paddingBottom: 24 }]}>
        {children}
      </ScrollView>
      {footer && <View style={s.footer}>{footer}</View>}
    </SafeAreaView>
  );
}

export function Header({
  title,
  step,
  onBack,
  right,
}: {
  title: string;
  step?: number;
  onBack: () => void;
  right?: ReactNode;
}) {
  return (
    <SafeAreaView edges={['top']} style={s.head}>
      <View style={s.headRow}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={onBack}
          style={s.round}
        >
          <Feather name="chevron-left" size={22} color={C.ink} />
        </Pressable>
        <T w={700} numberOfLines={1} style={{ fontSize: 17, flex: 1 }}>
          {title}
        </T>
        {!!step && <T style={{ fontSize: 13, color: C.gold }}>Step {step} of 4</T>}
        {right}
      </View>
      {!!step && (
        <View style={s.progress}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={[s.bar, i <= step && { backgroundColor: C.ink }]} />
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}

export function Btn({
  kind = 'primary',
  label,
  onPress,
  disabled,
  loading,
  icon,
}: {
  kind?: 'primary' | 'secondary' | 'danger' | 'link' | 'white';
  label: string;
  onPress: () => void;
  disabled?: boolean;
  /** Shows a spinner and blocks taps while a request runs. */
  loading?: boolean;
  icon?: ReactNode;
}) {
  if (kind === 'link')
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onPress}
        style={{ alignSelf: 'center', padding: 8 }}
      >
        <T w={600} style={{ textDecorationLine: 'underline', fontSize: 14 }}>
          {label}
        </T>
      </Pressable>
    );
  const primary = kind === 'primary';
  const off = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!off, busy: !!loading }}
      disabled={off}
      onPress={onPress}
      style={[
        s.btn,
        primary ? s.btnPrimary : s.btnSecondary,
        kind === 'white' && { borderColor: C.white },
        disabled && { backgroundColor: '#9a9a9a', borderColor: '#9a9a9a' },
      ]}
    >
      {loading ? <ActivityIndicator color={primary ? C.white : C.ink} /> : icon}
      <T
        w={600}
        style={{
          fontSize: 16,
          color: primary ? C.white : kind === 'danger' ? C.destructive : C.ink,
        }}
      >
        {label}
      </T>
    </Pressable>
  );
}

export function Option({
  title,
  desc,
  right,
  rightSub,
  gold,
  selected,
  onPress,
}: {
  title: string;
  desc?: string;
  right?: string;
  rightSub?: string;
  gold?: boolean;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      onPress={onPress}
      style={[s.card, s.row, selected && { borderColor: C.ink, borderWidth: 2 }]}
    >
      <View style={[s.radio, selected && { borderColor: C.ink }]}>
        {selected && <View style={s.radioDot} />}
      </View>
      <View style={{ flex: 1 }}>
        <T w={600} style={{ fontSize: 16 }}>
          {title}
        </T>
        {!!desc && <Sub style={{ marginTop: 2 }}>{desc}</Sub>}
      </View>
      {!!(right || rightSub) && (
        <View style={{ alignItems: 'flex-end' }}>
          {!!right && (
            <T w={700} style={{ fontSize: 16 }}>
              {right}
            </T>
          )}
          <T w={gold ? 700 : 400} style={{ fontSize: 13, color: gold ? C.gold : C.slate }}>
            {rightSub}
          </T>
        </View>
      )}
    </Pressable>
  );
}

export function Chip({ label, on, onPress }: { label: string; on: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: on }}
      onPress={onPress}
      style={[s.chip, on && { backgroundColor: C.mango, borderColor: C.mango }]}
    >
      <T w={500} style={{ fontSize: 14 }}>
        {label}
      </T>
    </Pressable>
  );
}

export const Chips = ({ children }: { children: ReactNode }) => (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{children}</View>
);

export function Note({
  text,
  icon = 'info',
  bad,
}: {
  text: string;
  icon?: IconName;
  bad?: boolean;
}) {
  return (
    <View style={[s.note, bad && { backgroundColor: '#fde3e1' }]}>
      <Feather name={icon} size={18} color={bad ? C.destructive : C.ink} />
      <T style={{ flex: 1, fontSize: 13, lineHeight: 18 }}>{text}</T>
    </View>
  );
}

export const Card = ({ style, ...p }: ViewProps) => <View style={[s.card, style]} {...p} />;
export const Tear = () => <View style={s.tear} />;

/** [label, value]; a falsy value shows as "Not set yet", like the prototype's val(). */
export function Rows({
  rows,
  big,
}: {
  rows: [string, string | null | undefined | false][];
  big?: boolean;
}) {
  return (
    <View style={{ gap: big ? 10 : 6 }}>
      {rows.map(([k, v]) => (
        <View key={k} style={s.kv}>
          <T style={{ fontSize: big ? 14 : 13, color: C.slate }}>{k}</T>
          <T
            w={v ? 600 : 400}
            numberOfLines={1}
            style={{
              fontSize: big ? 14 : 13,
              color: v ? C.ink : C.slate,
              flexShrink: 1,
              textAlign: 'right',
            }}
          >
            {v || 'Not set yet'}
          </T>
        </View>
      ))}
    </View>
  );
}

export function Avatar({ initial, size = 44 }: { initial: string; size?: number }) {
  return (
    <View style={[s.av, { width: size, height: size, borderRadius: size / 2 }]}>
      <T w={700} style={{ fontSize: Math.round(size * 0.4) }}>
        {initial}
      </T>
    </View>
  );
}

// Design Kit "Status / Ring": [label, filled fifths, colour, icon].
const RING: Record<
  'booked' | 'confirmed' | 'onway' | 'late' | 'inprogress' | 'completed' | 'cancelled',
  [string, number, string, IconName]
> = {
  booked: ['Booked', 1, '#5F5E5E', 'calendar'],
  confirmed: ['Confirmed', 2, '#1F7A4D', 'check'],
  onway: ['On the way', 3, '#005BC0', 'navigation'],
  late: ['Running late', 3, '#B26A00', 'clock'],
  inprogress: ['In progress', 4, '#FFC72C', 'tool'],
  completed: ['Completed', 5, '#1F7A4D', 'check'],
  cancelled: ['Cancelled', 5, '#C62828', 'x'],
};
const RING_C = 2 * Math.PI * 20;

/** Status ring with label and caption. `accepted` shows the Confirmed ring labelled "Accepted". */
export function Ring({
  stage,
  accepted,
  label,
  caption,
}: {
  stage: Stage;
  accepted?: boolean;
  label?: string;
  caption?: string;
}) {
  const key = stage === 'paid' ? 'completed' : stage === 'mcancelled' ? 'cancelled' : stage;
  const [name, n, color, icon] = RING[key];
  const done = key === 'completed';
  const defaults: Partial<Record<Stage, [string, string]>> = {
    paid: ['Paid', 'Booking closed'],
    mcancelled: ['Manong cancelled', 'Choose what to do next'],
  };
  const text =
    label ?? defaults[stage]?.[0] ?? (accepted && key === 'confirmed' ? 'Accepted' : name);
  const sub =
    caption ?? defaults[stage]?.[1] ?? (key === 'cancelled' ? 'Booking closed' : `Step ${n} of 5`);
  return (
    <View style={s.ringRow} accessibilityLabel={`${text}, ${sub}`}>
      <View style={{ width: 44, height: 44 }}>
        <Svg width={44} height={44} viewBox="0 0 44 44">
          <Circle
            cx={22}
            cy={22}
            r={20}
            fill="none"
            stroke={color}
            strokeOpacity={0.18}
            strokeWidth={4}
          />
          <Circle
            cx={22}
            cy={22}
            r={20}
            fill="none"
            stroke={color}
            strokeWidth={4}
            strokeDasharray={`${(RING_C * n) / 5} ${RING_C}`}
            transform="rotate(-90 22 22)"
          />
          {done && <Circle cx={22} cy={22} r={16} fill={color} />}
        </Svg>
        <View style={s.ringIcon}>
          <Feather
            name={icon}
            size={18}
            color={done ? C.white : key === 'inprogress' ? C.goldText : color}
          />
        </View>
      </View>
      <View style={{ gap: 1 }}>
        <T w={600} style={{ fontSize: 14 }}>
          {text}
        </T>
        <T w={500} style={{ fontSize: 11, color: C.slate }}>
          {sub}
        </T>
      </View>
    </View>
  );
}

export function Field({
  label,
  optional,
  ...input
}: TextInputProps & { label: string; optional?: boolean }) {
  return (
    <View style={{ gap: 6 }}>
      <View style={s.kv}>
        <Label style={{ marginTop: 0 }}>{label}</Label>
        {optional && <Sub>Optional</Sub>}
      </View>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={C.slate}
        style={s.input}
        {...input}
      />
    </View>
  );
}

/** Bottom sheet over a scrim, like the prototype's .sheet. Tapping the scrim closes it. */
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
        {children}
      </SafeAreaView>
    </Modal>
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

export type Tab = 'home' | 'bookings' | 'profile';
export function TabBar({ on, go }: { on: Tab; go: (tab: Tab) => void }) {
  const tabs: [Tab, IconName, string][] = [
    ['home', 'home', 'Home'],
    ['bookings', 'calendar', 'Bookings'],
    ['profile', 'user', 'Profile'],
  ];
  return (
    <SafeAreaView edges={['bottom']} style={s.tabbar}>
      {tabs.map(([k, icon, label]) => (
        <Pressable
          key={k}
          accessibilityRole="tab"
          accessibilityState={{ selected: on === k }}
          onPress={() => go(k)}
          style={s.tab}
        >
          <Feather name={icon} size={22} color={on === k ? C.ink : C.slate} />
          <T w={on === k ? 700 : 500} style={{ fontSize: 12, color: on === k ? C.ink : C.slate }}>
            {label}
          </T>
        </Pressable>
      ))}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  pad: { paddingHorizontal: 20, paddingTop: 20 },
  h: { fontSize: 26, lineHeight: 32, letterSpacing: -0.3 },
  sub: { fontSize: 14, color: C.slate, lineHeight: 20 },
  label: { fontSize: 14, marginTop: 8 },
  footer: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 8, gap: 4 },
  head: {
    backgroundColor: C.mango,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 14,
  },
  headRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingTop: 8 },
  round: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progress: { flexDirection: 'row', gap: 6, marginTop: 14 },
  bar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: C.white },
  btn: {
    height: 56,
    borderRadius: R.full,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  btnPrimary: { backgroundColor: C.ink },
  btnSecondary: { backgroundColor: C.white, borderWidth: 1, borderColor: C.line },
  card: {
    backgroundColor: C.white,
    borderRadius: R.card,
    borderWidth: 1,
    borderColor: C.cloud,
    padding: 16,
    ...SHADOW.ticket,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: C.slate,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: C.mango },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: R.full,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.white,
  },
  note: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    borderRadius: R.control,
    backgroundColor: C.mangoSoft,
    alignItems: 'center',
  },
  tear: { height: 1, backgroundColor: C.cloud, marginVertical: 14 },
  kv: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  av: { backgroundColor: C.mangoSoft, alignItems: 'center', justifyContent: 'center' },
  ringRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  ringIcon: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
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
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: R.sheet,
    borderTopRightRadius: R.sheet,
    padding: 24,
    paddingTop: 10,
    gap: 12,
    ...SHADOW.sheet,
  },
  grab: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignSelf: 'center',
    marginBottom: 6,
  },
  toastWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 110,
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
  tabbar: {
    flexDirection: 'row',
    backgroundColor: C.white,
    borderTopWidth: 1,
    borderTopColor: C.cloud,
    paddingTop: 8,
  },
  tab: { flex: 1, alignItems: 'center', gap: 2, paddingBottom: 8, minHeight: 44 },
});
