import { FontAwesome } from '@expo/vector-icons';
import { useState } from 'react';
import { Image, Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { saveAddress, saveProfile, setDefaultPayment } from '../services/account';
import { dayLabel, serviceName } from '../services/bookings';
import { C, R, SHADOW, peso } from '../theme';
import {
  Avatar,
  Btn,
  Card,
  ErrorText,
  Field,
  H,
  Header,
  Icon,
  Label,
  Option,
  Ring,
  Rows,
  Screen,
  Sub,
  T,
  TabBar,
  Tear,
} from '../ui';
import { useTask } from '../useTask';
import type { Address, App, PaymentMethod } from '../types';
import { AddressFields } from './Onboarding';
import { goTab, openBooking } from './Home';

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
const MONTH = (d: Date) => d.toLocaleDateString('en-PH', { month: 'long', year: 'numeric' });

type Entry = { day: Date; time: string; title: string; sub: string; open: () => void };

export function Bookings({ app }: { app: App }) {
  const { booking: b, upcoming, past, catalog } = app.state;
  const [tab, setTab] = useState<'up' | 'past'>('up');
  const today = new Date();
  const [offset, setOffset] = useState(0);
  const [sel, setSel] = useState<Date>(today);
  const entries: Entry[] = [
    ...(b && b.stage !== 'paid' && b.day
      ? [
          {
            day: b.day,
            time: b.time ?? 'Now',
            title: serviceName(b, catalog),
            sub: `${b.manong.name}, ${b.stage === 'onway' ? 'on the way' : 'confirmed'}`,
            open: () => openBooking(app),
          },
        ]
      : []),
    ...upcoming.map((u) => ({
      ...u,
      sub: `${u.with}, confirmed`,
      open: () => app.toast(`${u.title} on ${dayLabel(u.day)} at ${u.time} with ${u.with}`),
    })),
  ].sort((x, y) => +x.day - +y.day);

  const month = new Date(today.getFullYear(), today.getMonth() + offset, 1);
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = [
    ...Array(month.getDay()).fill(null),
    ...Array.from(
      { length: days },
      (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1),
    ),
  ];
  const dayList = entries.filter((e) => sameDay(e.day, sel));
  const next = entries.find((e) => +e.day > +sel && !sameDay(e.day, sel));

  const Row = ({ e }: { e: Entry }) => (
    <Pressable accessibilityRole="button" onPress={e.open} style={s.entry}>
      <T w={700} style={{ width: 72 }}>
        {e.time}
      </T>
      <View style={{ flex: 1 }}>
        <T w={600}>{e.title}</T>
        <Sub style={{ fontSize: 13 }}>{e.sub}</Sub>
      </View>
      <Icon name="chevron-right" size={18} color={C.ink} />
    </Pressable>
  );

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <SafeAreaView edges={['top']} style={s.tabHead}>
        <T w={700} style={{ fontSize: 24 }}>
          Bookings
        </T>
        <View style={s.seg} accessibilityRole="tablist">
          {(
            [
              ['up', 'Upcoming'],
              ['past', 'Past'],
            ] as const
          ).map(([k, l]) => (
            <Pressable
              key={k}
              accessibilityRole="tab"
              accessibilityState={{ selected: tab === k }}
              onPress={() => setTab(k)}
              style={[s.segBtn, tab === k && s.segOn]}
            >
              <T w={600}>{l}</T>
            </Pressable>
          ))}
        </View>
      </SafeAreaView>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 10 }}>
        {tab === 'past' ? (
          past.length ? (
            past.map((p, i) => (
              <Pressable
                key={p.id}
                accessibilityRole="button"
                onPress={() => {
                  app.update({ receiptIdx: i });
                  app.go('receipt');
                }}
                style={s.entry}
              >
                <View style={s.sq}>
                  <Icon name={catalog[p.category].icon} size={18} color={C.ink} />
                </View>
                <View style={{ flex: 1 }}>
                  <T w={600}>{p.title}</T>
                  <Sub style={{ fontSize: 13 }}>
                    {p.date}, {p.manong ? p.manong.name : 'you cancelled'}
                  </Sub>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <T w={700}>{peso(p.lines.reduce((sum, [, v]) => sum + v, 0))}</T>
                  <T
                    w={600}
                    style={{ fontSize: 12, color: p.status === 'paid' ? C.success : C.destructive }}
                  >
                    {p.status === 'paid' ? 'Paid' : 'Cancelled'}
                  </T>
                </View>
              </Pressable>
            ))
          ) : (
            <Sub>No past bookings yet.</Sub>
          )
        ) : entries.length ? (
          <>
            <Card>
              <View style={s.between}>
                <T w={700}>{MONTH(month)}</T>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {(
                    [
                      [-1, 'chevron-left', 'Previous month'],
                      [1, 'chevron-right', 'Next month'],
                    ] as const
                  ).map(([d, icon, label]) => {
                    const off = offset + d < -1 || offset + d > 1;
                    return (
                      <Pressable
                        key={label}
                        accessibilityRole="button"
                        accessibilityLabel={label}
                        accessibilityState={{ disabled: off }}
                        disabled={off}
                        onPress={() => setOffset(offset + d)}
                        style={[s.monthBtn, off && { opacity: 0.3 }]}
                      >
                        <Icon name={icon} size={18} color={C.ink} />
                      </Pressable>
                    );
                  })}
                </View>
              </View>
              <View style={s.grid}>
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <Sub key={i} style={s.dow}>
                    {d}
                  </Sub>
                ))}
                {cells.map((d, i) =>
                  d ? (
                    <Pressable
                      key={i}
                      accessibilityRole="button"
                      accessibilityLabel={dayLabel(d)}
                      accessibilityState={{ selected: sameDay(d, sel) }}
                      onPress={() => setSel(d)}
                      style={[
                        s.cell,
                        sameDay(d, sel) && { backgroundColor: C.ink },
                        sameDay(d, today) &&
                          !sameDay(d, sel) && { borderWidth: 1.5, borderColor: C.ink },
                      ]}
                    >
                      <T
                        w={600}
                        style={{
                          color: sameDay(d, sel)
                            ? C.white
                            : +d < +today && !sameDay(d, today)
                              ? C.line
                              : C.ink,
                        }}
                      >
                        {d.getDate()}
                      </T>
                      {entries.some((e) => sameDay(e.day, d)) && (
                        <View style={[s.has, sameDay(d, sel) && { backgroundColor: C.mango }]} />
                      )}
                    </Pressable>
                  ) : (
                    <View key={i} style={s.cell} />
                  ),
                )}
              </View>
            </Card>
            <T w={700} style={{ fontSize: 18, marginTop: 8 }}>
              {dayLabel(sel)}
            </T>
            {dayList.length ? (
              dayList.map((e, i) => <Row key={i} e={e} />)
            ) : (
              <Sub>Nothing booked on this day.</Sub>
            )}
            {next && (
              <Pressable
                accessibilityRole="button"
                onPress={() => setSel(next.day)}
                style={s.entry}
              >
                <View style={{ flex: 1 }}>
                  <T w={600} style={{ fontSize: 12, color: C.gold }}>
                    Next: {dayLabel(next.day)}
                  </T>
                  <T w={600}>
                    {next.title} at {next.time}
                  </T>
                </View>
                <Icon name="chevron-right" size={18} color={C.ink} />
              </Pressable>
            )}
          </>
        ) : (
          <View style={{ alignItems: 'center', gap: 10, paddingTop: 30 }}>
            <Image
              source={require('../assets/illo-crew.png')}
              style={{ width: 200, height: 140 }}
              resizeMode="contain"
            />
            <T w={700} style={{ fontSize: 18 }}>
              No upcoming bookings
            </T>
            <Sub style={{ textAlign: 'center' }}>
              When you book a Manong, the day and time show up here.
            </Sub>
            <View style={{ alignSelf: 'stretch' }}>
              <Btn label="Book a Manong" onPress={app.home} />
            </View>
          </View>
        )}
      </ScrollView>
      <TabBar on="bookings" go={goTab(app)} />
    </View>
  );
}

export function Receipt({ app }: { app: App }) {
  const p = app.state.past[app.state.receiptIdx];
  const paid = p.status === 'paid';
  const total = p.lines.reduce((sum, [, v]) => sum + v, 0);
  // TODO(backend): a PDF receipt from the server. The mock shares a plain-text one.
  const download = async () => {
    const text = [
      'MANG JUAN RECEIPT',
      `Booking ${p.id}`,
      p.title,
      `${p.date}, ${p.time}`,
      `Manong: ${p.manong ? p.manong.name : '-'}`,
      '',
      ...p.lines.map(([n, v]) => `${n}: ${peso(v)}`),
      '',
      `Total: ${peso(total)}`,
      `Paid with ${p.payment === 'cash' ? 'cash' : 'GCash'}`,
    ].join('\n');
    try {
      await Share.share({ message: text, title: `Mang Juan receipt ${p.id}` });
    } catch {
      app.toast("Couldn't open the share sheet");
    }
  };
  return (
    <Screen
      header={<Header title={`Booking ${p.id}`} onBack={app.back} />}
      footer={
        <>
          <Btn
            label={p.manong ? `Book ${p.manong.first} again` : 'Book again'}
            onPress={() => app.startBooking(p.category, p.manong)}
          />
          {paid && <Btn kind="link" label="Download receipt" onPress={download} />}
        </>
      }
    >
      <Card>
        <T w={700} style={{ fontSize: 18 }}>
          {p.title}
        </T>
        <Sub style={{ fontSize: 13 }}>
          {p.date}, {p.time}
        </Sub>
        <View style={{ marginTop: 12 }}>
          <Ring stage={paid ? 'paid' : 'cancelled'} />
        </View>
        {p.manong && (
          <>
            <Tear />
            <View style={s.row}>
              <Avatar initial={p.manong.initial} />
              <View style={{ flex: 1 }}>
                <T w={600}>{p.manong.name}</T>
                <Sub style={{ fontSize: 13 }}>
                  {p.stars ? `You rated him ${p.stars} stars` : 'Not rated yet'}
                </Sub>
              </View>
              <View
                style={{ flexDirection: 'row', gap: 2 }}
                accessibilityLabel={`${p.stars} of 5 stars`}
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <FontAwesome
                    key={n}
                    name="star"
                    size={14}
                    color={n <= p.stars ? C.star : C.line}
                  />
                ))}
              </View>
            </View>
          </>
        )}
        <Tear />
        <Rows rows={p.lines.map(([n, v]) => [n, peso(v)] as [string, string])} />
        <Tear />
        <View style={s.between}>
          <T w={700} style={{ fontSize: 17 }}>
            Total
          </T>
          <T w={700} style={{ fontSize: 22 }}>
            {peso(total)}
          </T>
        </View>
        <View style={{ marginTop: 8 }}>
          <Rows
            rows={[
              [
                paid ? 'Paid with' : 'Charge',
                paid ? `${p.payment === 'cash' ? 'Cash' : 'GCash'}, receipt emailed` : 'No charge',
              ],
            ]}
          />
        </View>
      </Card>
    </Screen>
  );
}

export function Profile({ app }: { app: App }) {
  const { user, addresses, payment } = app.state;
  const row = (
    icon: 'map-pin' | 'credit-card' | 'bell' | 'user' | 'info' | 'shield',
    label: string,
    val: string,
    onPress: () => void,
  ) => (
    <Pressable key={label} accessibilityRole="button" onPress={onPress} style={s.listRow}>
      <View style={s.sq}>
        <Icon name={icon} size={18} color={C.ink} />
      </View>
      <T w={600} style={{ flex: 1 }}>
        {label}
      </T>
      {!!val && <Sub style={{ fontSize: 13 }}>{val}</Sub>}
      <Icon name="chevron-right" size={18} color={C.ink} />
    </Pressable>
  );
  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <SafeAreaView edges={['top']} style={s.profHead}>
        <View style={s.avatar}>
          <T w={800} style={{ fontSize: 22 }}>
            {(user.first[0] ?? '') + (user.last[0] ?? '')}
          </T>
        </View>
        <View style={{ flex: 1 }}>
          <T w={700} style={{ fontSize: 18 }}>
            {`${user.first} ${user.last}`.trim()}
          </T>
          <Sub>{user.phone}</Sub>
        </View>
        <Pressable accessibilityRole="button" onPress={() => app.go('personal')} style={s.edit}>
          <T w={600}>Edit</T>
        </Pressable>
      </SafeAreaView>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 10 }}>
        <View style={s.list}>
          {row(
            'map-pin',
            'Saved addresses',
            `${addresses.length} place${addresses.length === 1 ? '' : 's'}`,
            () => app.go('addresses'),
          )}
          {row('credit-card', 'Payment methods', payment === 'gcash' ? 'GCash' : 'Cash', () =>
            app.go('payments'),
          )}
          {row('bell', 'Notifications', 'On', () => app.go('notifications'))}
          {row('user', 'Personal details', '', () => app.go('personal'))}
        </View>
        <Label>Support</Label>
        <View style={s.list}>
          {row('info', 'Help center', '', () => app.toast('Help center opens in your browser'))}
          {row('shield', 'Safety and privacy', '', () =>
            app.toast('Every Manong is ID-verified. Your number stays hidden until you book.'),
          )}
        </View>
        <Btn kind="danger" label="Log out" onPress={app.logOut} />
        <Sub style={{ textAlign: 'center', fontSize: 12 }}>Mang Juan 1.0</Sub>
      </ScrollView>
      <TabBar on="profile" go={goTab(app)} />
    </View>
  );
}

export function Personal({ app }: { app: App }) {
  const [first, setFirst] = useState(app.state.user.first);
  const [last, setLast] = useState(app.state.user.last);
  const task = useTask();
  return (
    <Screen
      header={<Header title="Personal details" onBack={app.back} />}
      footer={
        <>
          <ErrorText text={task.error} />
          <Btn
            label="Save"
            loading={task.busy}
            onPress={() =>
              task.run(async () => {
                const user = await saveProfile({ ...app.state.user, first, last });
                app.update({ user });
                app.back();
                app.toast('Saved');
              })
            }
          />
        </>
      }
    >
      <H>What should Manong call you?</H>
      <Field
        label="First name"
        value={first}
        onChangeText={setFirst}
        placeholder="First name"
        autoComplete="given-name"
      />
      <Field
        label="Last name"
        value={last}
        onChangeText={setLast}
        placeholder="Last name"
        autoComplete="family-name"
      />
      <Label>Mobile number</Label>
      <View style={s.readonly}>
        <T style={{ color: C.slate }}>{app.state.user.phone}</T>
      </View>
    </Screen>
  );
}

export function Addresses({ app }: { app: App }) {
  const { addresses } = app.state;
  const edit = (i: number) => {
    app.update({ addrEdit: i });
    app.go('addrform');
  };
  return (
    <Screen
      header={<Header title="Saved addresses" onBack={app.back} />}
      footer={<Btn label="Add an address" onPress={() => edit(-1)} />}
    >
      {!addresses.length && <Sub>No saved addresses yet.</Sub>}
      {addresses.map((a, i) => (
        <View key={i} style={s.entry}>
          <View style={s.sq}>
            <Icon name="map-pin" size={18} color={C.ink} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <View style={s.row}>
              <T w={600}>{a.label}</T>
              {i === 0 && (
                <View style={s.tag}>
                  <T w={600} style={{ fontSize: 11 }}>
                    Default
                  </T>
                </View>
              )}
            </View>
            <Sub style={{ fontSize: 13 }}>
              {[a.unit, a.bldg, a.city].filter(Boolean).join(', ')}
            </Sub>
            {!!a.note && <Sub style={{ fontSize: 12 }}>Note: {a.note}</Sub>}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Edit ${a.label}`}
            onPress={() => edit(i)}
          >
            <T w={600} style={{ textDecorationLine: 'underline' }}>
              Edit
            </T>
          </Pressable>
        </View>
      ))}
    </Screen>
  );
}

export function AddressForm({ app }: { app: App }) {
  const { addresses, addrEdit, addressIdx } = app.state;
  const [a, setA] = useState<Address>(
    addresses[addrEdit] ?? { label: '', bldg: '', unit: '', city: '', note: '' },
  );
  const set = (k: keyof Address) => (v: string) => setA({ ...a, [k]: v });
  const task = useTask();
  const save = () =>
    task.run(async () => {
      const saved = await saveAddress(a);
      if (addrEdit >= 0)
        app.update({ addresses: addresses.map((x, i) => (i === addrEdit ? saved : x)) });
      else app.update({ addresses: [...addresses, saved], addressIdx: addresses.length });
      app.back();
      app.toast('Address saved');
    });
  return (
    <Screen
      header={<Header title={addrEdit < 0 ? 'Add an address' : 'Edit address'} onBack={app.back} />}
      footer={
        <>
          <ErrorText text={task.error} />
          <Btn label="Save address" loading={task.busy} onPress={save} />
        </>
      }
    >
      <H>Where should Manong go?</H>
      <AddressFields a={a} set={set} withLabel />
      {addrEdit > 0 && (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            app.update({
              addresses: addresses.filter((_, i) => i !== addrEdit),
              addressIdx: addressIdx >= addresses.length - 1 ? 0 : addressIdx,
            });
            app.back();
            app.toast('Address removed');
          }}
          style={{ alignSelf: 'center', padding: 8 }}
        >
          <T w={600} style={{ color: C.destructive, textDecorationLine: 'underline' }}>
            Remove this address
          </T>
        </Pressable>
      )}
    </Screen>
  );
}

export function Payments({ app }: { app: App }) {
  const { payment, user } = app.state;
  const [pick, setPick] = useState<PaymentMethod>(payment);
  const task = useTask();
  return (
    <Screen
      header={<Header title="Payment methods" onBack={app.back} />}
      footer={
        <>
          <ErrorText text={task.error} />
          <Btn
            label="Save"
            loading={task.busy}
            onPress={() =>
              task.run(async () => {
                const method = await setDefaultPayment(pick);
                app.update({ payment: method });
                app.back();
                app.toast(`Saved. ${method === 'gcash' ? 'GCash' : 'Cash'} is your default.`);
              })
            }
          />
        </>
      }
    >
      <H>Payment method</H>
      <Option
        title="GCash"
        desc={`Linked to ${user.phone}`}
        rightSub={payment === 'gcash' ? 'Default' : undefined}
        gold
        selected={pick === 'gcash'}
        onPress={() => setPick('gcash')}
      />
      <Option
        title="Cash"
        desc="Pay your Manong directly"
        rightSub={payment === 'cash' ? 'Default' : undefined}
        gold
        selected={pick === 'cash'}
        onPress={() => setPick('cash')}
      />
      <Pressable
        accessibilityRole="button"
        onPress={() => app.toast("Card payments aren't available yet")}
        style={s.dashed}
      >
        <T w={600}>+ Add a debit or credit card</T>
      </Pressable>
    </Screen>
  );
}

const s = StyleSheet.create({
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  row: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  tabHead: {
    backgroundColor: C.mango,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    gap: 12,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  seg: { flexDirection: 'row', backgroundColor: C.mangoSoft, borderRadius: R.full, padding: 4 },
  segBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: R.full },
  segOn: { backgroundColor: C.white },
  entry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.white,
    borderRadius: R.card,
    padding: 14,
    ...SHADOW.ticket,
  },
  sq: {
    width: 40,
    height: 40,
    borderRadius: R.control,
    backgroundColor: C.mangoSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 },
  dow: { width: `${100 / 7}%`, textAlign: 'center', fontSize: 12, paddingBottom: 6 },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
  },
  has: {
    position: 'absolute',
    bottom: 4,
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: C.gold,
  },
  profHead: {
    backgroundColor: C.mango,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  edit: {
    borderWidth: 1.5,
    borderColor: C.ink,
    borderRadius: R.full,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 40,
    justifyContent: 'center',
  },
  list: { backgroundColor: C.white, borderRadius: R.card, overflow: 'hidden' },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.cloud,
    minHeight: 56,
  },
  readonly: {
    backgroundColor: C.cloud,
    borderRadius: R.control,
    paddingHorizontal: 14,
    height: 52,
    justifyContent: 'center',
  },
  tag: {
    backgroundColor: C.mangoSoft,
    borderRadius: R.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  dashed: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: C.line,
    borderRadius: R.card,
    padding: 16,
    alignItems: 'center',
  },
});
