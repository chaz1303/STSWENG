import { FontAwesome } from '@expo/vector-icons';
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ALFRED } from '../mocks/account';
import { dayLabel } from '../services/bookings';
import { sendMessage } from '../services/manongs';
import { C, F, R } from '../theme';
import { Btn, Card, Chip, ErrorText, Header, Icon, Label, Screen, Sub, T } from '../ui';
import type { App, Manong } from '../types';

export function ManongProfile({ app }: { app: App }) {
  const m = app.state.viewManong ?? ALFRED;
  const [who, quote] = m.review;
  return (
    <Screen
      header={<Header title="Manong profile" onBack={app.back} />}
      footer={
        <Btn label={`Book ${m.first} again`} onPress={() => app.startBooking('plumbing', m)} />
      }
    >
      <View style={{ alignItems: 'center', gap: 6 }}>
        <View style={s.bigAv}>
          <T w={800} style={{ fontSize: 34 }}>
            {m.initial}
          </T>
        </View>
        <T w={700} style={{ fontSize: 24, marginTop: 6 }}>
          {m.name}
        </T>
        <Sub>
          {m.skills}, {m.area}
        </Sub>
        <View style={s.verified}>
          <Icon name="shield" size={14} color={C.success} />
          <T w={600} style={{ fontSize: 13, color: C.success }}>
            ID-verified Manong
          </T>
        </View>
      </View>
      <View style={s.stats}>
        {[
          [m.rating, 'Rating'],
          [String(m.jobs), 'Jobs done'],
          [m.years, 'On Mang Juan'],
        ].map(([v, l]) => (
          <View key={l} style={{ flex: 1, alignItems: 'center' }}>
            <T w={700} style={{ fontSize: 18 }}>
              {v}
            </T>
            <Sub style={{ fontSize: 12 }}>{l}</Sub>
          </View>
        ))}
      </View>
      <Label>Good at</Label>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {m.goodAt.map((g) => (
          <View key={g} style={s.tag}>
            <T w={500}>{g}</T>
          </View>
        ))}
      </ScrollView>
      <Label>What residents say</Label>
      <Card>
        <View
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <View style={{ flexDirection: 'row', gap: 2 }} accessibilityLabel="5 stars">
            {[1, 2, 3, 4, 5].map((n) => (
              <FontAwesome key={n} name="star" size={14} color={C.star} />
            ))}
          </View>
          <Sub style={{ fontSize: 12 }}>{who}</Sub>
        </View>
        <T style={{ marginTop: 10, lineHeight: 22 }}>{quote}</T>
      </Card>
    </Screen>
  );
}

export function Chat({ app }: { app: App }) {
  const b = app.state.booking;
  const m = b?.manong ?? ALFRED;
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const scroll = useRef<ComponentRef<typeof ScrollView>>(null);
  const send = (msg: string) => {
    if (!msg.trim()) return;
    setText('');
    setError(null);
    app.update((st) => ({ chat: [...st.chat, { me: true, text: msg.trim(), time: 'Now' }] }));
    sendMessage(msg)
      .then((reply) => app.update((st) => ({ chat: [...st.chat, reply] })))
      .catch((e: Error) => setError(`Not delivered: ${e.message}`));
  };
  const stageLabel = b
    ? {
        booked: 'Booked',
        confirmed: 'Confirmed',
        onway: 'On the way',
        late: 'Running late',
        inprogress: 'In progress',
        completed: 'Completed',
        paid: 'Paid',
        cancelled: 'Cancelled',
        mcancelled: 'Cancelled',
      }[b.stage]
    : '';
  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: C.paper }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Header title={m.name} onBack={app.back} />
      <ScrollView
        ref={scroll}
        onContentSizeChange={() => scroll.current?.scrollToEnd()}
        contentContainerStyle={{ padding: 20, gap: 10 }}
      >
        <View style={s.chatCard}>
          <T w={500} style={{ fontSize: 13 }}>
            {b
              ? `${app.state.catalog[b.category].name}, ${b.bookingType === 'on-demand' ? 'today' : b.day ? `${dayLabel(b.day)}, ${b.time}` : ''}`
              : 'No active booking'}
          </T>
          {!!b && (
            <T w={600} style={{ fontSize: 13, color: C.success }}>
              {stageLabel}
            </T>
          )}
        </View>
        <Sub style={{ textAlign: 'center', fontSize: 12 }}>Today</Sub>
        {app.state.chat.map((c, i) =>
          c.sys ? (
            <Pressable
              key={i}
              accessibilityRole="button"
              onPress={() => (b ? app.go('status') : undefined)}
              style={s.sys}
            >
              <Icon name="map-pin" size={14} color={C.ink} />
              <T w={500} style={{ fontSize: 13 }}>
                {c.sys.replace('Alfred', m.first)}
              </T>
            </Pressable>
          ) : (
            <View key={i} style={[s.bubble, c.me ? s.me : s.them]}>
              <T>{c.text}</T>
              <Sub style={{ fontSize: 11, alignSelf: 'flex-end' }}>{c.time}</Sub>
            </View>
          ),
        )}
        <ErrorText text={error} />
      </ScrollView>
      <View style={s.quick}>
        {["I'm coming down", 'Door is open'].map((q) => (
          <Chip key={q} label={q} on={false} onPress={() => send(q)} />
        ))}
      </View>
      <SafeAreaView edges={['bottom']} style={s.bar}>
        <TextInput
          accessibilityLabel="Message"
          value={text}
          onChangeText={setText}
          onSubmitEditing={() => send(text)}
          placeholder={`Message ${m.first}`}
          placeholderTextColor={C.slate}
          returnKeyType="send"
          style={s.input}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Send"
          onPress={() => send(text)}
          style={s.send}
        >
          <Icon name="send" size={18} color={C.mango} />
        </Pressable>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

// TODO(backend): real calls go through the phone dialer or a masked-number service, so neither side
// sees the other's number. The mock shows an in-app call screen.
export function CallButton({ manong }: { manong: Manong }) {
  const [open, setOpen] = useState(false);
  const [secs, setSecs] = useState(0);
  const [mute, setMute] = useState(false);
  const [speaker, setSpeaker] = useState(false);
  useEffect(() => {
    if (!open) return;
    setSecs(0);
    const t = setInterval(() => setSecs((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [open]);
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Call ${manong.first}`}
        onPress={() => setOpen(true)}
        style={s.call}
      >
        <Icon name="phone" size={18} color={C.mango} />
      </Pressable>
      <Modal visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <SafeAreaView style={s.callScreen}>
          <View style={{ alignItems: 'center', gap: 8, marginTop: 80 }}>
            <View style={s.bigAv}>
              <T w={800} style={{ fontSize: 36 }}>
                {manong.initial}
              </T>
            </View>
            <T w={700} style={{ fontSize: 24, color: C.white }}>
              {manong.name}
            </T>
            <T
              style={{ color: '#ccc' }}
            >{`${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`}</T>
          </View>
          <View style={s.callRow}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Mute"
              accessibilityState={{ selected: mute }}
              onPress={() => setMute(!mute)}
              style={[s.callBtn, mute && s.callOn]}
            >
              <Icon name={mute ? 'mic-off' : 'mic'} size={24} color={mute ? C.ink : C.white} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="End call"
              onPress={() => setOpen(false)}
              style={[s.callBtn, { backgroundColor: C.destructive }]}
            >
              <Icon name="phone-off" size={24} color={C.white} />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Speaker"
              accessibilityState={{ selected: speaker }}
              onPress={() => setSpeaker(!speaker)}
              style={[s.callBtn, speaker && s.callOn]}
            >
              <Icon name="volume-2" size={24} color={speaker ? C.ink : C.white} />
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  bigAv: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: C.mangoSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verified: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    backgroundColor: C.successSoft,
    borderRadius: R.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  stats: {
    flexDirection: 'row',
    backgroundColor: C.white,
    borderRadius: R.card,
    paddingVertical: 14,
  },
  tag: {
    backgroundColor: C.white,
    borderRadius: R.full,
    borderWidth: 1,
    borderColor: C.line,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  chatCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: C.white,
    borderRadius: R.control,
    padding: 12,
  },
  sys: {
    alignSelf: 'center',
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    backgroundColor: C.mangoPale,
    borderRadius: R.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bubble: { maxWidth: '78%', borderRadius: R.card, padding: 12, gap: 4 },
  me: { alignSelf: 'flex-end', backgroundColor: C.mangoSoft },
  them: { alignSelf: 'flex-start', backgroundColor: C.white },
  quick: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingBottom: 8 },
  bar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: C.white,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 48,
    borderRadius: R.full,
    backgroundColor: C.cloud,
    paddingHorizontal: 16,
    fontFamily: F[400],
    fontSize: 15,
    color: C.ink,
  },
  send: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  call: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callScreen: {
    flex: 1,
    backgroundColor: '#1a1c1c',
    justifyContent: 'space-between',
    paddingBottom: 60,
  },
  callRow: { flexDirection: 'row', justifyContent: 'center', gap: 28 },
  callBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callOn: { backgroundColor: C.white },
});
