import { FontAwesome } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { BOOKING_STATES } from '../../src/utils/contract.js';
import { getBooking, payBooking, rateBooking, statusSteps } from '../api';
import { C, peso } from '../theme';
import {
  Avatar,
  Btn,
  Card,
  Chip,
  Chips,
  H,
  Header,
  Icon,
  Label,
  Note,
  Screen,
  Stamp,
  Sub,
  T,
  Tear,
} from '../ui';
import type { App, Booking, Catalog } from '../types';
import { PayPicker, whenOf } from './Book';

const STARS = [
  'Tap a star',
  'Not good',
  'Could be better',
  'Okay lang',
  'Ayos! Great job',
  'Sobrang ayos!',
];
const PRAISE = [
  'On time',
  'Clean work',
  'Explained the fix',
  'Fair price',
  'Friendly',
  'Tidied up',
];
const POLL_MS = 3000;

const svcName = (b: Booking, catalog: Catalog) => {
  return `${catalog[b.category].name}, ${catalog[b.category].tiers[b.serviceType].name.toLowerCase()}`;
};
const totalOf = (b: Booking, catalog: Catalog) => {
  return (
    catalog[b.category].tiers[b.serviceType].price + b.materials.reduce((sum, [, p]) => sum + p, 0)
  );
};

export function Status({ app }: { app: App }) {
  const b = app.state.booking!; // these screens open only after a booking exists
  const done = b.status === BOOKING_STATES.COMPLETED;
  const steps = statusSteps(b.bookingType);
  const cur = steps.indexOf(b.status);

  useEffect(() => {
    if (done) return;
    const t = setTimeout(() => getBooking(b.id).then(app.setBooking), POLL_MS);
    return () => clearTimeout(t);
  }, [b.status]);

  return (
    <Screen
      header={<Header title={`Booking ${b.id}`} onBack={app.home} />}
      footer={done && <Btn label="Review charges" onPress={() => app.go('charges')} />}
    >
      <Card>
        <View style={s.between}>
          <View style={{ flex: 1 }}>
            <T w={700} style={{ fontSize: 18 }}>
              {svcName(b, app.state.catalog)}
            </T>
            <T w={600} style={{ marginTop: 2 }}>
              {whenOf(b)}
            </T>
          </View>
          <Stamp label={b.status} />
        </View>
        <Tear />
        <View accessibilityRole="list">
          {steps.map((st, i) => (
            <View key={st} style={[s.step, i < steps.length - 1 && { paddingBottom: 16 }]}>
              <View
                style={[s.node, i <= cur && { backgroundColor: C.success, borderColor: C.success }]}
              >
                {i <= cur && <Icon name="check" size={12} color={C.white} />}
              </View>
              <View style={{ flex: 1 }}>
                <T w={600} style={{ color: i <= cur ? C.ink : C.slate }}>
                  {st}
                </T>
                {i === cur && (
                  <T w={600} style={{ fontSize: 12, color: C.success }}>
                    Current status
                  </T>
                )}
              </View>
            </View>
          ))}
        </View>
        <Tear />
        <View style={s.row}>
          <Avatar initial={b.manong.initial} />
          <View style={{ flex: 1 }}>
            <T w={600}>{b.manong.name}</T>
            <Sub style={{ fontSize: 13 }}>Your Manong</Sub>
          </View>
        </View>
      </Card>
      <Note text={`Show PIN ${b.id} at the lobby so ${b.manong.first} can go straight up.`} />
      {!done && (
        <Sub style={{ textAlign: 'center' }}>Mock: status moves forward every few seconds.</Sub>
      )}
    </Screen>
  );
}

export function Charges({ app }: { app: App }) {
  const b = app.state.booking!; // these screens open only after a booking exists
  const [pay, setPay] = useState(b.payment);
  const total = totalOf(b, app.state.catalog);
  const base = app.state.catalog[b.category].tiers[b.serviceType];

  async function payNow() {
    app.setBooking(await payBooking(b.id, pay));
    app.go('rate', { replace: true });
  }

  return (
    <Screen
      header={<Header title={`Booking ${b.id}`} onBack={app.home} />}
      footer={
        <Btn
          label={
            pay === 'gcash' ? `Pay ${peso(total)} with GCash` : `I paid ${peso(total)} in cash`
          }
          onPress={payNow}
        />
      }
    >
      <H>{b.manong.first} finished the job</H>
      <Sub>Check the charges before you pay.</Sub>
      <Card>
        <View style={s.between}>
          <T w={600} style={{ fontSize: 16 }}>
            {base.name}
          </T>
          <Stamp label="Completed" />
        </View>
        <View style={[s.between, { marginTop: 10 }]}>
          <Sub>Base charge</Sub>
          <T w={600}>{peso(base.price)}</T>
        </View>
        {b.materials.length > 0 && (
          <>
            <Tear />
            <T w={600} style={{ fontSize: 14, marginBottom: 6 }}>
              Materials added <Sub>{b.materials.length} items</Sub>
            </T>
            {b.materials.map(([n, p]) => (
              <View key={n} style={[s.between, { marginTop: 4 }]}>
                <Sub>{n}</Sub>
                <T w={600}>{peso(p)}</T>
              </View>
            ))}
          </>
        )}
        <Tear />
        <View style={s.between}>
          <T w={700} style={{ fontSize: 16 }}>
            Total
          </T>
          <T w={800} style={{ fontSize: 26 }}>
            {peso(total)}
          </T>
        </View>
      </Card>
      <Label>Pay with</Label>
      <PayPicker value={pay} onChange={setPay} />
      <Note
        text={`Ask ${b.manong.first} about any charge you don't recognize. Paying closes ticket ${b.id}.`}
      />
    </Screen>
  );
}

export function Rate({ app }: { app: App }) {
  const b = app.state.booking!; // these screens open only after a booking exists
  const [stars, setStars] = useState(0);
  const [praise, setPraise] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const toggle = (p: string) =>
    setPraise(praise.includes(p) ? praise.filter((x) => x !== p) : [...praise, p]);

  async function submit() {
    await rateBooking(b.id, { stars, praise, note });
    app.go('thanks', { replace: true });
  }

  return (
    <Screen
      footer={
        <>
          <Btn label="Submit rating" disabled={!stars} onPress={submit} />
          <Btn kind="link" label="Skip for now" onPress={app.home} />
        </>
      }
    >
      <View style={s.rateBand}>
        <Card>
          <View style={s.between}>
            <T w={600}>{svcName(b, app.state.catalog)}</T>
            <Stamp label="Paid" filled />
          </View>
          <Tear />
          <Sub style={{ fontSize: 13 }}>
            {peso(totalOf(b, app.state.catalog))} with {b.payment === 'gcash' ? 'GCash' : 'cash'},
            receipt emailed
          </Sub>
        </Card>
      </View>
      <Avatar initial={b.manong.initial} size={56} />
      <H>How did {b.manong.first} do?</H>
      <Sub>Your rating helps other residents in {app.state.address?.bldg || 'your building'}.</Sub>
      <View style={s.row} accessibilityRole="radiogroup">
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable
            key={n}
            accessibilityRole="radio"
            accessibilityLabel={`${n} stars`}
            accessibilityState={{ checked: stars === n }}
            onPress={() => setStars(n)}
          >
            <FontAwesome name="star" size={36} color={n <= stars ? C.star : C.line} />
          </Pressable>
        ))}
      </View>
      <T w={700} style={{ color: C.gold }}>
        {STARS[stars]}
      </T>
      <Label>{stars && stars < 4 ? 'What could be better?' : 'What went well?'}</Label>
      <Chips>
        {PRAISE.map((p) => (
          <Chip key={p} label={p} on={praise.includes(p)} onPress={() => toggle(p)} />
        ))}
      </Chips>
      <TextInput
        accessibilityLabel="Note"
        multiline
        value={note}
        onChangeText={setNote}
        placeholder={`Add a note for ${b.manong.first} (optional)`}
        placeholderTextColor={C.slate}
        style={s.textarea}
      />
    </Screen>
  );
}

export function Thanks({ app }: { app: App }) {
  return (
    <Screen
      footer={
        <>
          <Btn label="Back to home" onPress={app.home} />
          <Btn kind="link" label="Book another job" onPress={() => app.startBooking('plumbing')} />
        </>
      }
    >
      <View style={{ alignItems: 'center', gap: 12, paddingTop: 160 }}>
        <View style={s.mark}>
          <Image source={require('../assets/mark.png')} style={{ width: 46, height: 42 }} />
        </View>
        <H style={{ textAlign: 'center' }}>Salamat, {app.state.user.first}!</H>
        <Sub style={{ textAlign: 'center' }}>
          Your rating was sent. Ticket closed and receipt emailed.
        </Sub>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  row: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  step: { flexDirection: 'row', gap: 12 },
  node: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: C.line,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  // Bleeds past the Screen padding to reach the edges, like the prototype's .f3-rateband.
  rateBand: {
    backgroundColor: C.mango,
    margin: -20,
    marginBottom: 0,
    padding: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  textarea: {
    minHeight: 80,
    backgroundColor: C.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.line,
    padding: 14,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  mark: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: C.mango,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
