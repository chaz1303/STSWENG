import { Feather } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { C, F } from './theme.js';

export { Feather as Icon };

export function T({ w = 400, style, ...props }) {
  return <Text style={[{ fontFamily: F[w], color: C.ink }, style]} {...props} />;
}

export const H = ({ style, ...p }) => <T w={700} style={[s.h, style]} {...p} />;
export const Sub = ({ style, ...p }) => <T style={[s.sub, style]} {...p} />;
export const Label = ({ style, ...p }) => <T w={600} style={[s.label, style]} {...p} />;

// Scrolling body with an optional pinned footer, like the prototype's .scroll + .footer.
export function Screen({ header, footer, children, bg = C.paper, pad = true }) {
  return (
    <SafeAreaView
      edges={header ? ['bottom'] : ['top', 'bottom']}
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

export function Header({ title, step, onBack }) {
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
        <T w={700} style={{ fontSize: 17, flex: 1 }}>
          {title}
        </T>
        {!!step && <T style={{ fontSize: 13, color: C.gold }}>Step {step} of 4</T>}
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

export function Btn({ kind = 'primary', label, onPress, disabled, icon }) {
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
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        s.btn,
        primary ? s.btnPrimary : s.btnSecondary,
        disabled && { backgroundColor: '#9a9a9a' },
      ]}
    >
      {icon && <Feather name={icon} size={18} color={primary ? C.mango : C.ink} />}
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

export function Option({ title, desc, right, rightSub, gold, selected, onPress }) {
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
      {!!right && (
        <View style={{ alignItems: 'flex-end' }}>
          <T w={700} style={{ fontSize: 16 }}>
            {right}
          </T>
          <T w={gold ? 700 : 400} style={{ fontSize: 13, color: gold ? C.gold : C.slate }}>
            {rightSub}
          </T>
        </View>
      )}
    </Pressable>
  );
}

export function Chip({ label, on, onPress }) {
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

export const Chips = ({ children }) => (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{children}</View>
);

export function Note({ text, icon = 'info' }) {
  return (
    <View style={s.note}>
      <Feather name={icon} size={18} color={C.ink} />
      <T style={{ flex: 1, fontSize: 13, lineHeight: 18 }}>{text}</T>
    </View>
  );
}

export const Card = ({ style, ...p }) => <View style={[s.card, style]} {...p} />;
export const Tear = () => <View style={s.tear} />;

// Label/value rows; a missing value shows "Not set yet" like the prototype's val().
export function Rows({ rows, big }) {
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

export function Avatar({ initial, size = 44 }) {
  return (
    <View style={[s.av, { width: size, height: size, borderRadius: size / 2 }]}>
      <T w={700} style={{ fontSize: Math.round(size * 0.4) }}>
        {initial}
      </T>
    </View>
  );
}

export function Stamp({ label, filled }) {
  return (
    <View style={[s.stamp, filled && { backgroundColor: C.ink }]}>
      <T w={700} style={{ fontSize: 12, color: filled ? C.mango : C.success }}>
        {label}
      </T>
    </View>
  );
}

export function Field({ label, optional, ...input }) {
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
    borderRadius: 999,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrimary: { backgroundColor: C.ink },
  btnSecondary: { backgroundColor: C.white, borderWidth: 1, borderColor: C.line },
  card: {
    backgroundColor: C.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.cloud,
    padding: 16,
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
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.white,
  },
  note: {
    flexDirection: 'row',
    gap: 10,
    padding: 14,
    borderRadius: 12,
    backgroundColor: C.mangoSoft,
    alignItems: 'center',
  },
  tear: { height: 1, backgroundColor: C.cloud, marginVertical: 14 },
  kv: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  av: { backgroundColor: C.mangoSoft, alignItems: 'center', justifyContent: 'center' },
  stamp: {
    borderWidth: 1.5,
    borderColor: C.success,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    transform: [{ rotate: '-4deg' }],
  },
  input: {
    backgroundColor: C.cloud,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    fontFamily: F[400],
    fontSize: 15,
    color: C.ink,
  },
});
