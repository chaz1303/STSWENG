import { FontAwesome } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Image, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { BOOKING_TYPES } from '../../src/utils/contract.js';
import { findManong } from '../api';
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
  Option,
  Rows,
  Screen,
  Sub,
  T,
  Tear,
} from '../ui';
import type { App, Category, Draft, PaymentMethod, ServiceType, Tier } from '../types';

const TIMES = ['9:00 AM', '10:30 AM', '1:00 PM', '3:00 PM', '4:30 PM', '6:00 PM'];
const FULL_TIME = '1:00 PM'; // shortcut: one slot always shows as fully booked, until slots come from the API.

// Next five days starting today, as Date objects.
const nextDays = () => [0, 1, 2, 3, 4].map((i) => new Date(Date.now() + i * 86400000));
const dayLabel = (d: Date) =>
  d.toLocaleDateString('en-PH', { weekday: 'short', month: 'short', day: 'numeric' });

export const issueOf = (d: Pick<Draft, 'symptoms' | 'desc'>) => {
  if (d.symptoms.length) return d.symptoms.join(', ');
  const t = d.desc.trim();
  return t.length > 26 ? t.slice(0, 26) + '…' : t;
};
export const whenOf = (d: Pick<Draft, 'bookingType' | 'day' | 'time'>) =>
  d.bookingType === BOOKING_TYPES.ON_DEMAND
    ? 'Now, in about 30 min'
    : d.day && d.time
      ? `${dayLabel(d.day)}, ${d.time}`
      : '';

const titleOf = (cat: Category) => `Book ${cat.name.toLowerCase()}`;

function Summary({
  cat,
  d,
  showWhen = true,
  manong,
}: {
  cat: Category;
  d: Draft;
  showWhen?: boolean;
  manong?: string;
}) {
  const t = cat.tiers[d.serviceType];
  return (
    <Card>
      <View style={s.between}>
        <T w={600} style={{ fontSize: 15 }}>
          {cat.name}, {t.name.toLowerCase()}
        </T>
        <T w={700} style={{ fontSize: 17 }}>
          {peso(t.price)}
        </T>
      </View>
      <Tear />
      <Rows
        rows={[
          ['Issue', issueOf(d)],
          ['When', showWhen && whenOf(d)],
          ['Manong', manong ?? d.manong?.name],
        ]}
      />
    </Card>
  );
}

export function Size({ app }: { app: App }) {
  const { draft: d, catalog } = app.state;
  const cat = catalog[d.category];
  return (
    <Screen
      header={<Header title={titleOf(cat)} step={1} onBack={app.back} />}
      footer={<Btn label="Continue" onPress={() => app.go('problem')} />}
    >
      <H>{cat.q}</H>
      {(Object.entries(cat.tiers) as [ServiceType, Tier][]).map(([k, t]) => (
        <Option
          key={k}
          title={t.name}
          desc={t.desc}
          right={peso(t.price)}
          rightSub={t.meta}
          gold={t.gold}
          selected={d.serviceType === k}
          onPress={() => app.setDraft({ serviceType: k })}
        />
      ))}
      <Note text={cat.note} />
      <Summary cat={cat} d={d} showWhen={false} />
    </Screen>
  );
}

export function Problem({ app }: { app: App }) {
  const { draft: d, catalog } = app.state;
  const cat = catalog[d.category];
  const toggle = (x: string) =>
    app.setDraft({
      symptoms: d.symptoms.includes(x) ? d.symptoms.filter((y) => y !== x) : [...d.symptoms, x],
    });
  return (
    <Screen
      header={<Header title={titleOf(cat)} step={2} onBack={app.back} />}
      footer={<Btn label="Continue" disabled={!issueOf(d)} onPress={() => app.go('schedule')} />}
    >
      <H>What's happening?</H>
      <View style={s.box}>
        <TextInput
          accessibilityLabel="What's happening"
          multiline
          maxLength={300}
          value={d.desc}
          onChangeText={(desc) => app.setDraft({ desc })}
          placeholder={cat.ph}
          placeholderTextColor={C.slate}
          style={s.textarea}
        />
        <Sub style={{ alignSelf: 'flex-end', fontSize: 12 }}>{d.desc.length} / 300</Sub>
      </View>
      <Label>{cat.chips}</Label>
      <Chips>
        {cat.symptoms.map((x) => (
          <Chip key={x} label={x} on={d.symptoms.includes(x)} onPress={() => toggle(x)} />
        ))}
      </Chips>
      <Summary cat={cat} d={d} showWhen={false} />
    </Screen>
  );
}

export function Schedule({ app }: { app: App }) {
  const { draft: d, catalog } = app.state;
  const cat = catalog[d.category];
  const now = d.bookingType === BOOKING_TYPES.ON_DEMAND;
  const ready = now || (d.day && d.time);
  return (
    <Screen
      header={<Header title={titleOf(cat)} step={3} onBack={app.back} />}
      footer={<Btn label="Find my Manong" disabled={!ready} onPress={() => app.go('finding')} />}
    >
      <H>When do you need {d.category === 'moving' ? 'the movers' : 'Manong'}?</H>
      <View style={s.segm} accessibilityRole="tablist">
        {(
          [
            [BOOKING_TYPES.ON_DEMAND, 'Now', 'As soon as possible'],
            [BOOKING_TYPES.SCHEDULED, 'Schedule', 'Pick a day and time'],
          ] as const
        ).map(([type, t, sub]) => (
          <Pressable
            key={type}
            accessibilityRole="tab"
            accessibilityState={{ selected: d.bookingType === type }}
            onPress={() => app.setDraft({ bookingType: type })}
            style={[s.seg, d.bookingType === type && s.segOn]}
          >
            <T w={600}>{t}</T>
            <Sub style={{ fontSize: 12 }}>{sub}</Sub>
          </Pressable>
        ))}
      </View>
      {now ? (
        <Note
          icon="zap"
          text="We'll send the nearest free Manong. Free to cancel until Manong starts the job."
        />
      ) : (
        <>
          <Label>Day</Label>
          <View style={s.row}>
            {nextDays().map((day, i) => {
              const on = d.day?.toDateString() === day.toDateString();
              return (
                <Pressable
                  key={i}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  accessibilityLabel={dayLabel(day)}
                  onPress={() => app.setDraft({ day })}
                  style={[s.day, on && s.on]}
                >
                  <Sub style={{ fontSize: 12, color: C.ink }}>
                    {i ? day.toLocaleDateString('en-PH', { weekday: 'short' }) : 'Today'}
                  </Sub>
                  <T w={700} style={{ fontSize: 18 }}>
                    {day.getDate()}
                  </T>
                </Pressable>
              );
            })}
          </View>
          <Label>Time</Label>
          <View style={[s.row, { flexWrap: 'wrap' }]}>
            {TIMES.map((t) => {
              const off = t === FULL_TIME;
              return (
                <Pressable
                  key={t}
                  accessibilityRole="button"
                  accessibilityState={{ selected: d.time === t, disabled: off }}
                  disabled={off}
                  onPress={() => app.setDraft({ time: t })}
                  style={[
                    s.slot,
                    d.time === t && s.on,
                    off && { backgroundColor: C.cloud, borderColor: C.cloud },
                  ]}
                >
                  <T style={off && { color: C.slate, textDecorationLine: 'line-through' }}>{t}</T>
                </Pressable>
              );
            })}
          </View>
        </>
      )}
      <Summary cat={cat} d={d} />
    </Screen>
  );
}

export function Finding({ app }: { app: App }) {
  const { draft: d, catalog } = app.state;
  const cat = catalog[d.category];
  useEffect(() => {
    let live = true;
    findManong(d.bookingType).then((manong) => {
      if (!live) return;
      app.setDraft({ manong });
      app.go('review', { replace: true });
    });
    return () => {
      live = false;
    };
  }, []);
  return (
    <Screen
      header={<Header title={titleOf(cat)} onBack={app.back} />}
      footer={<Btn kind="secondary" label="Cancel request" onPress={app.back} />}
    >
      <H>Finding your Manong</H>
      <Sub>This usually takes under a minute. You can leave this screen, we'll notify you.</Sub>
      <View style={s.radar}>
        <View style={s.radarIn}>
          <Image
            source={require('../assets/mark.png')}
            style={{ width: 46, height: 42 }}
            accessibilityIgnoresInvertColors
          />
        </View>
      </View>
      <Summary cat={cat} d={d} manong="Looking now" />
      <Note text="Tip: let your lobby guard know a Manong is coming." />
    </Screen>
  );
}

export function Review({ app }: { app: App }) {
  const { draft: d, catalog, address } = app.state;
  const cat = catalog[d.category];
  const m = d.manong!; // Review opens only after Finding picked a Manong
  const t = cat.tiers[d.serviceType];
  return (
    <Screen
      header={<Header title={titleOf(cat)} step={4} onBack={app.back} />}
      footer={<Btn label="Confirm booking" onPress={app.confirmBooking} />}
    >
      <H>Review and confirm</H>
      <Card style={[s.row, { alignItems: 'center' }]}>
        <Avatar initial={m.initial} size={56} />
        <View style={{ flex: 1, gap: 2 }}>
          <View style={[s.row, { gap: 6 }]}>
            <T w={600} style={{ fontSize: 16 }}>
              {m.name}
            </T>
            <Icon name="shield" size={16} color={C.gcash} accessibilityLabel="ID-verified" />
          </View>
          <Sub style={{ fontSize: 13 }}>{m.skills}</Sub>
          <View style={[s.row, { gap: 4 }]}>
            <FontAwesome name="star" size={14} color={C.star} />
            <T w={700} style={{ fontSize: 13 }}>
              {m.rating}
            </T>
            <Sub style={{ fontSize: 13 }}>from {m.jobs} jobs</Sub>
          </View>
        </View>
      </Card>
      <Card>
        <Rows
          big
          rows={[
            ['Service', `${cat.name}, ${t.name.toLowerCase()}`],
            ['Problem', issueOf(d)],
            ['When', whenOf(d)],
            ['Where', address && `${address.unit}, ${address.bldg}`],
          ]}
        />
        <Tear />
        <Rows
          big
          rows={[
            ['Base charge', peso(t.price)],
            ['Materials', 'Added after, if needed'],
          ]}
        />
        <View style={[s.between, { marginTop: 10 }]}>
          <Sub>Estimate</Sub>
          <T w={800} style={{ fontSize: 20 }}>
            {peso(t.price)}
          </T>
        </View>
      </Card>
      <Label>Pay after the job with</Label>
      <PayPicker value={d.payment} onChange={(payment) => app.setDraft({ payment })} />
      <View style={[s.row, { gap: 6 }]}>
        <Icon name="info" size={14} color={C.slate} />
        <Sub style={{ fontSize: 13 }}>Free to cancel until Manong starts the job.</Sub>
      </View>
    </Screen>
  );
}

export function PayPicker({
  value,
  onChange,
}: {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}) {
  return (
    <View style={s.row}>
      {(
        [
          ['gcash', 'GCash'],
          ['cash', 'Cash'],
        ] as const
      ).map(([k, label]) => (
        <Pressable
          key={k}
          accessibilityRole="radio"
          accessibilityState={{ checked: value === k }}
          onPress={() => onChange(k)}
          style={[s.pay, value === k && { borderColor: C.ink, borderWidth: 2 }]}
        >
          {k === 'gcash' ? (
            <View style={s.gc}>
              <T w={800} style={{ color: C.white, fontSize: 12 }}>
                G
              </T>
            </View>
          ) : (
            <Icon name="dollar-sign" size={16} color={C.ink} />
          )}
          <T w={500} style={{ fontSize: 15 }}>
            {label}
          </T>
        </Pressable>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  box: {
    backgroundColor: C.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.line,
    padding: 14,
  },
  textarea: { minHeight: 64, fontSize: 15, color: C.ink, textAlignVertical: 'top' },
  segm: { flexDirection: 'row', backgroundColor: C.cloud, borderRadius: 999, padding: 4 },
  seg: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 999 },
  segOn: { backgroundColor: C.white },
  day: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.white,
  },
  slot: {
    width: '31%',
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.white,
  },
  on: { backgroundColor: C.mango, borderColor: C.mango },
  radar: {
    alignSelf: 'center',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: C.mangoPale,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  radarIn: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: C.mango,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pay: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 48,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.line,
    backgroundColor: C.white,
  },
  gc: {
    width: 20,
    height: 20,
    borderRadius: 5,
    backgroundColor: C.gcash,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
