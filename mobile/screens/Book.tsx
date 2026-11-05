import { FontAwesome } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import { Animated, Image, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { BOOKING_TYPES } from '../../src/utils/contract.js';
import { createBooking, dayLabel, findManong, NoManongError } from '../services/bookings';
import { C, R, peso } from '../theme';
import {
  Avatar,
  Btn,
  Card,
  Chip,
  Chips,
  ErrorText,
  H,
  Header,
  Icon,
  Label,
  Note,
  Option,
  Rows,
  Screen,
  Sheet,
  Sub,
  T,
  Tear,
} from '../ui';
import { useTask } from '../useTask';
import type { App, Booking, Category, Draft, PaymentMethod, ServiceType, Tier } from '../types';
import { addressLine } from './Home';

const TIMES = ['9:00 AM', '10:30 AM', '1:00 PM', '3:00 PM', '4:30 PM', '6:00 PM'];
const FULL_TIME = '1:00 PM'; // shortcut: one slot always shows as fully booked, until slots come from the API.

// Next five days starting today.
const nextDays = () => [0, 1, 2, 3, 4].map((i) => new Date(Date.now() + i * 86400000));
const lastWord = (s: string) => s.split(',').pop()!.trim().split(' ').pop()!;

export const issueOf = (d: Draft, pickup?: string) => {
  if (d.category === 'moving')
    return d.dropoff.trim() ? `${lastWord(pickup || 'Home')} to ${lastWord(d.dropoff)}, 14 km` : '';
  if (d.symptoms.length) return d.symptoms.join(', ');
  const t = d.desc.trim();
  return t.length > 26 ? t.slice(0, 26) + '…' : t;
};
export const whenOf = (d: Pick<Draft, 'bookingType' | 'day' | 'time'>) =>
  d.bookingType === BOOKING_TYPES.ON_DEMAND
    ? 'Now, as soon as possible'
    : d.day && d.time
      ? `${dayLabel(d.day)}, ${d.time}`
      : '';
export const bookedWhen = (b: Booking) =>
  b.bookingType === 'on-demand'
    ? 'Today, as soon as possible'
    : b.day && b.time
      ? `${dayLabel(b.day)} at ${b.time}`
      : '';

const titleOf = (cat: Category) => `Book ${cat.name.toLowerCase()}`;

/** The progress ticket that fills in as the resident books. */
function Summary({
  app,
  showWhen = true,
  manong,
}: {
  app: App;
  showWhen?: boolean;
  manong?: string;
}) {
  const { draft: d, catalog, addresses, addressIdx } = app.state;
  const cat = catalog[d.category];
  const t = cat.tiers[d.serviceType];
  return (
    <Card>
      <View style={s.between}>
        <T w={600} style={{ fontSize: 15 }}>
          {cat.name}, {t.short}
        </T>
        <T w={700} style={{ fontSize: 17 }}>
          {peso(t.price)}
        </T>
      </View>
      <Tear />
      <Rows
        rows={[
          [cat.issueLabel, issueOf(d, addressLine(addresses[addressIdx]))],
          ['When', showWhen && whenOf(d)],
          [cat.crew, manong ?? d.manong?.name ?? (d.preferred && `${d.preferred} (requested)`)],
        ]}
      />
    </Card>
  );
}

export function AddressPick({ app }: { app: App }) {
  const { addresses, addressIdx } = app.state;
  const [pick, setPick] = useState(addressIdx);
  return (
    <Screen
      header={<Header title="Your address" onBack={app.back} />}
      footer={
        <Btn
          label="Use this address"
          disabled={!addresses.length}
          onPress={() => {
            app.update({ addressIdx: pick });
            app.back();
          }}
        />
      }
    >
      <H>Where should Manong go?</H>
      <Sub>Pick a saved place or add a new one.</Sub>
      {addresses.map((a, i) => (
        <Option
          key={i}
          title={a.label}
          desc={[a.unit, a.bldg, a.city].filter(Boolean).join(', ')}
          selected={pick === i}
          onPress={() => setPick(i)}
        />
      ))}
      <Pressable
        accessibilityRole="button"
        onPress={() => {
          app.update({ addrEdit: -1 });
          app.go('addrform');
        }}
        style={s.dashed}
      >
        <T w={600}>+ Add a new address</T>
      </Pressable>
    </Screen>
  );
}

export function Size({ app }: { app: App }) {
  const { draft: d, catalog } = app.state;
  const cat = catalog[d.category];
  return (
    <Screen
      header={<Header title={titleOf(cat)} step={1} onBack={app.back} />}
      footer={
        <Btn
          label="Continue"
          onPress={() => app.go(d.category === 'moving' ? 'route' : 'problem')}
        />
      }
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
          onPress={() =>
            // Locked out means now; the other lock jobs get scheduled.
            app.setDraft(
              d.category === 'locks'
                ? { serviceType: k, bookingType: k === 'CHECKUP' ? 'on-demand' : 'scheduled' }
                : { serviceType: k },
            )
          }
        />
      ))}
      {!!cat.note && <Note text={cat.note} />}
      <Summary app={app} showWhen={false} />
    </Screen>
  );
}

export function Problem({ app }: { app: App }) {
  const { draft: d, catalog } = app.state;
  const cat = catalog[d.category];
  const [adding, setAdding] = useState(false);
  const toggle = (x: string) =>
    app.setDraft({
      symptoms: d.symptoms.includes(x) ? d.symptoms.filter((y) => y !== x) : [...d.symptoms, x],
    });
  // TODO(backend): upload real photos (expo-image-picker + storage). The mock adds a sample photo.
  const addPhoto = () => {
    app.setDraft({ photos: d.photos + 1 });
    setAdding(false);
    app.toast('Photo added');
  };
  return (
    <Screen
      header={<Header title={titleOf(cat)} step={2} onBack={app.back} />}
      footer={
        <Btn
          label="Continue"
          onPress={() =>
            d.desc.trim() || d.symptoms.length
              ? app.go('schedule')
              : app.toast('Describe the problem or pick a symptom')
          }
        />
      }
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
      <Label>
        Photos <Sub>Optional, up to 3</Sub>
      </Label>
      <View style={s.row}>
        {Array.from({ length: d.photos }, (_, i) => (
          <View key={i}>
            <Image
              source={require('../assets/pipe.png')}
              style={s.photo}
              accessibilityLabel={`Problem photo ${i + 1}`}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Remove photo"
              onPress={() => app.setDraft({ photos: d.photos - 1 })}
              style={s.rm}
            >
              <Icon name="x" size={14} color={C.white} />
            </Pressable>
          </View>
        ))}
        {d.photos < 3 && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add photo"
            onPress={() => setAdding(true)}
            style={[s.photo, s.addPhoto]}
          >
            <Icon name="camera" size={20} color={C.ink} />
            <T w={600} style={{ fontSize: 13 }}>
              Add
            </T>
          </Pressable>
        )}
      </View>
      <Summary app={app} showWhen={false} />
      <Sheet open={adding} onClose={() => setAdding(false)}>
        <T w={700} style={{ fontSize: 20 }}>
          Add a photo
        </T>
        <Option
          title="Take photo"
          desc="Uses a sample photo for now"
          selected={false}
          onPress={addPhoto}
        />
        <Option
          title="Choose from gallery"
          desc="Uses a sample photo for now"
          selected={false}
          onPress={addPhoto}
        />
      </Sheet>
    </Screen>
  );
}

export function Route({ app }: { app: App }) {
  const { draft: d, catalog, addresses, addressIdx } = app.state;
  const cat = catalog[d.category];
  const toggle = (x: string) =>
    app.setDraft({
      symptoms: d.symptoms.includes(x) ? d.symptoms.filter((y) => y !== x) : [...d.symptoms, x],
    });
  return (
    <Screen
      header={<Header title={titleOf(cat)} step={2} onBack={app.back} />}
      footer={
        <Btn
          label="Continue"
          onPress={() =>
            d.dropoff.trim() ? app.go('schedule') : app.toast('Add the drop-off address')
          }
        />
      }
    >
      <H>Where are we moving?</H>
      <Card style={{ gap: 4, padding: 0 }}>
        <Pressable accessibilityRole="button" onPress={() => app.go('addrpick')} style={s.stop}>
          <View style={s.disc}>
            <Icon name="map-pin" size={16} color={C.ink} />
          </View>
          <View style={{ flex: 1 }}>
            <Sub style={{ fontSize: 12 }}>Pick-up</Sub>
            <T w={600}>{addressLine(addresses[addressIdx]) || 'Add your address'}</T>
          </View>
          <Icon name="edit-2" size={16} color={C.ink} />
        </Pressable>
        <View style={s.stop}>
          <View style={[s.disc, { backgroundColor: C.mango }]}>
            <Icon name="map-pin" size={16} color={C.ink} />
          </View>
          <View style={{ flex: 1 }}>
            <Sub style={{ fontSize: 12 }}>Drop-off</Sub>
            <TextInput
              accessibilityLabel="Drop-off address"
              value={d.dropoff}
              onChangeText={(dropoff) => app.setDraft({ dropoff })}
              placeholder="e.g. Unit 5A, The Grove, Pasig"
              placeholderTextColor={C.slate}
              style={{ fontSize: 15, color: C.ink, paddingVertical: 4 }}
            />
          </View>
        </View>
      </Card>
      <Label>{cat.chips}</Label>
      <Chips>
        {cat.symptoms.map((x) => (
          <Chip key={x} label={x} on={d.symptoms.includes(x)} onPress={() => toggle(x)} />
        ))}
      </Chips>
      <Sub style={{ fontSize: 13 }}>
        {d.dropoff.trim() ? 'About 14 km. ' : ''}Trips over 20 km get a price quote first.
      </Sub>
      <Summary app={app} showWhen={false} />
    </Screen>
  );
}

export function Schedule({ app }: { app: App }) {
  const { draft: d, catalog } = app.state;
  const cat = catalog[d.category];
  const now = d.bookingType === BOOKING_TYPES.ON_DEMAND;
  const find = () => {
    if (!now && (!d.day || !d.time)) return app.toast('Pick a day and time');
    app.setDraft({ retried: false });
    app.go('finding');
  };
  return (
    <Screen
      header={<Header title={titleOf(cat)} step={3} onBack={app.back} />}
      footer={<Btn label="Find my Manong" onPress={find} />}
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
          text={
            d.category === 'locks' && d.serviceType === 'CHECKUP'
              ? 'A locksmith heads over now. Have your ID ready at the door.'
              : `We'll send the nearest free ${cat.who}. Free to cancel until Manong starts the job.`
          }
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
                  accessibilityLabel={off ? `${t}, fully booked` : t}
                  onPress={() =>
                    off
                      ? app.toast(`${FULL_TIME} is fully booked. Pick another time.`)
                      : app.setDraft({ time: t })
                  }
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
      <Summary app={app} />
    </Screen>
  );
}

export function Finding({ app }: { app: App }) {
  const { draft: d, catalog } = app.state;
  const cat = catalog[d.category];
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const left = useRef(false);
  const stopped = useRef(false);
  const progress = useRef(new Animated.Value(0.06)).current;

  useEffect(() => {
    left.current = false;
    stopped.current = false;
    setError(null);
    progress.setValue(0.06);
    Animated.timing(progress, { toValue: 1, duration: 2500, useNativeDriver: false }).start();
    findManong(d)
      .then((manong) => {
        if (stopped.current) return;
        app.setDraft({ manong });
        if (!left.current) {
          app.go('review', { replace: true });
          return app.toast(
            `${manong.first} ${d.bookingType === 'on-demand' ? 'can come now' : 'is free then'}`,
          );
        }
        // Found while the resident was away: Home shows a card and a notification.
        app.update((s) => ({
          pendingReview: true,
          notifications: [
            {
              group: 'Today',
              icon: 'check',
              text: `${manong.first} can take your ${cat.name.toLowerCase()} job. Review and confirm.`,
              time: 'Now',
              unread: true,
              act: 'review',
            },
            ...s.notifications,
          ],
        }));
        app.toast(`${manong.first} is free. Tap the card to review.`);
      })
      .catch((e: Error) => {
        if (stopped.current) return;
        if (left.current) return app.toast('No Manong is free right now. Try another time.');
        if (e instanceof NoManongError) {
          if (!e.nowJob) app.update({ noneFrom: d.time ?? '' });
          return app.go(e.nowJob ? 'nonearby' : 'none', { replace: true });
        }
        setError(e.message);
      });
    return () => {
      // Leaving by any route other than "back" stops the search.
      if (!left.current) stopped.current = true;
    };
  }, [attempt]);

  const leave = () => {
    left.current = true;
    app.home();
    app.toast("We'll notify you when a Manong is found");
  };
  return (
    <Screen
      header={<Header title={titleOf(cat)} onBack={leave} />}
      footer={<Btn kind="secondary" label="Cancel request" onPress={() => setCancelling(true)} />}
    >
      <H>Finding your Manong</H>
      <Sub>You can leave this screen. We'll notify you once a Manong accepts.</Sub>
      <View style={s.radar}>
        <View style={s.radarIn}>
          <Image
            source={require('../assets/mark.png')}
            style={{ width: 46, height: 42 }}
            accessibilityIgnoresInvertColors
          />
        </View>
      </View>
      <View style={s.bar} accessibilityRole="progressbar">
        <Animated.View
          style={[
            s.barFill,
            { width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) },
          ]}
        />
      </View>
      {error ? (
        <>
          <ErrorText text={`We couldn't search right now: ${error}`} />
          <Btn kind="secondary" label="Try again" onPress={() => setAttempt(attempt + 1)} />
        </>
      ) : null}
      <Summary app={app} manong="Looking now" />
      <Note text="Tip: let your lobby guard know a Manong is coming." />
      <Sheet open={cancelling} onClose={() => setCancelling(false)}>
        <T w={700} style={{ fontSize: 20 }}>
          Cancel this request?
        </T>
        <Sub>We'll stop looking. Your answers stay saved so you can try again.</Sub>
        <Btn
          kind="danger"
          label="Yes, cancel request"
          onPress={() => {
            stopped.current = true;
            setCancelling(false);
            app.go('size', { reset: true });
            app.toast('Request cancelled');
          }}
        />
        <Btn label="Keep looking" onPress={() => setCancelling(false)} />
      </Sheet>
    </Screen>
  );
}

export function NoneFree({ app }: { app: App }) {
  const { draft: d, catalog, noneFrom, addresses, addressIdx } = app.state;
  const cat = catalog[d.category];
  const open = TIMES.filter((t) => t !== FULL_TIME && t !== noneFrom);
  const [pick, setPick] = useState<string | null>(null);
  const day = d.day ? dayLabel(d.day) : 'that day';
  return (
    <Screen
      header={<Header title={titleOf(cat)} onBack={app.back} />}
      footer={
        <>
          <Btn
            label={pick ? `Book ${pick} instead` : 'Pick an open time'}
            disabled={!pick}
            onPress={() => {
              app.setDraft({ time: pick, retried: true });
              app.go('finding', { replace: true });
            }}
          />
          <Btn kind="secondary" label="Go Back" onPress={app.back} />
        </>
      }
    >
      <H>No Manong is free at {noneFrom}</H>
      <Sub>
        Every {cat.who} near {addresses[addressIdx]?.bldg || 'you'} is booked then. Pick another
        time on {day}, or book for now.
      </Sub>
      <Label>Open times on {day}</Label>
      <View style={[s.row, { flexWrap: 'wrap' }]}>
        {open.map((t) => (
          <Pressable
            key={t}
            accessibilityRole="button"
            accessibilityState={{ selected: pick === t }}
            onPress={() => setPick(t)}
            style={[s.slot, pick === t && s.on]}
          >
            <T>{t}</T>
          </Pressable>
        ))}
      </View>
      <Btn
        kind="link"
        label="Book for now instead"
        onPress={() => {
          app.setDraft({ bookingType: 'on-demand', retried: true });
          app.go('finding', { replace: true });
        }}
      />
    </Screen>
  );
}

export function NoneNearby({ app }: { app: App }) {
  const { draft: d, catalog, addresses, addressIdx } = app.state;
  const cat = catalog[d.category];
  const [soon, setSoon] = useState('4:30 PM');
  return (
    <Screen
      header={<Header title={titleOf(cat)} onBack={app.back} />}
      footer={
        <>
          <Btn
            label={`Book ${soon} instead`}
            onPress={() => {
              app.setDraft({
                bookingType: 'scheduled',
                day: new Date(),
                time: soon,
                retried: true,
              });
              app.go('finding', { replace: true });
            }}
          />
          <Btn
            kind="secondary"
            label="Text me when one is free"
            onPress={() => {
              app.home();
              app.toast("We'll text you when a Manong is free");
            }}
          />
        </>
      }
    >
      <H>No Manong is nearby right now</H>
      <Sub>
        {cat.who[0].toUpperCase() + cat.who.slice(1)}s near {addresses[addressIdx]?.bldg || 'you'}{' '}
        are all on jobs. You haven't been charged. Pick a time later today.
      </Sub>
      <Label>Soonest times today</Label>
      <View style={[s.row, { flexWrap: 'wrap' }]}>
        {['3:00 PM', '4:30 PM', '6:00 PM'].map((t) => (
          <Pressable
            key={t}
            accessibilityRole="button"
            accessibilityState={{ selected: soon === t }}
            onPress={() => setSoon(t)}
            style={[s.slot, soon === t && s.on]}
          >
            <T>{t}</T>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

export function Review({ app }: { app: App }) {
  const { draft: d, catalog, addresses, addressIdx, payment } = app.state;
  const cat = catalog[d.category];
  const t = cat.tiers[d.serviceType];
  const m = d.manong!; // Review opens only after a Manong was found
  const address = addresses[addressIdx];
  const [pay, setPay] = useState<PaymentMethod>(payment);
  const task = useTask();
  const confirm = () =>
    task.run(async () => {
      if (!address) {
        app.toast('Add an address first');
        return app.go('addrpick');
      }
      const booking = await createBooking(d, address, pay, issueOf(d, addressLine(address)));
      const now = booking.bookingType === 'on-demand';
      app.update((s) => ({
        booking,
        pendingReview: false,
        notifications: [
          {
            group: 'Today',
            icon: 'check',
            text: now
              ? `${m.first} accepted your request.`
              : `${m.first} confirmed your booking for ${bookedWhen(booking)}.`,
            time: 'Now',
            unread: true,
            act: 'status',
          },
          ...s.notifications,
        ],
      }));
      app.go('status', { reset: true });
      app.toast(now ? `${m.first} accepted your request` : `Booked! ${booking.id} confirmed`);
    });
  return (
    <Screen
      header={<Header title={titleOf(cat)} step={4} onBack={app.back} />}
      footer={
        <>
          <ErrorText text={task.error} />
          <Btn label="Confirm booking" loading={task.busy} onPress={confirm} />
        </>
      }
    >
      <H>Review and confirm</H>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${m.name}, view profile`}
        onPress={() => {
          app.update({ viewManong: m });
          app.go('manong');
        }}
      >
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
          <Icon name="chevron-right" size={20} color={C.ink} />
        </Card>
      </Pressable>
      <Card>
        <Rows
          big
          rows={[
            ['Service', `${cat.name}, ${t.short}`],
            [
              cat.issueLabel === 'Issue' ? 'Problem' : cat.issueLabel,
              issueOf(d, addressLine(address)),
            ],
            ['When', whenOf(d)],
          ]}
        />
        <Pressable
          accessibilityRole="button"
          onPress={() => app.go('addrpick')}
          style={[s.between, { marginTop: 10 }]}
        >
          <T style={{ fontSize: 14, color: C.slate }}>Where</T>
          <T
            w={600}
            numberOfLines={1}
            style={{
              fontSize: 14,
              flexShrink: 1,
              textDecorationLine: address ? 'none' : 'underline',
            }}
          >
            {address ? addressLine(address) : 'Add address'}
          </T>
        </Pressable>
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
      <PayPicker value={pay} onChange={setPay} />
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
    <View style={s.row} accessibilityRole="radiogroup">
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
          {k === 'gcash' ? <GcashMark /> : <Icon name="dollar-sign" size={16} color={C.ink} />}
          <T w={500} style={{ fontSize: 15 }}>
            {label}
          </T>
        </Pressable>
      ))}
    </View>
  );
}

export const GcashMark = () => (
  <View style={s.gc}>
    <T w={800} style={{ color: C.white, fontSize: 12 }}>
      G
    </T>
  </View>
);

const s = StyleSheet.create({
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  box: {
    backgroundColor: C.white,
    borderRadius: R.card,
    borderWidth: 1,
    borderColor: C.line,
    padding: 14,
  },
  textarea: { minHeight: 64, fontSize: 15, color: C.ink, textAlignVertical: 'top' },
  segm: { flexDirection: 'row', backgroundColor: C.cloud, borderRadius: R.full, padding: 4 },
  seg: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: R.full },
  segOn: { backgroundColor: C.white },
  day: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: R.control,
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
    minHeight: 44,
    justifyContent: 'center',
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
  bar: { height: 4, borderRadius: 2, backgroundColor: C.cloud, overflow: 'hidden' },
  barFill: { height: 4, backgroundColor: C.mango },
  pay: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 48,
    borderRadius: R.full,
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
  dashed: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: C.line,
    borderRadius: R.card,
    padding: 16,
    alignItems: 'center',
  },
  photo: { width: 76, height: 76, borderRadius: R.control },
  addPhoto: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: C.line,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  rm: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stop: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  disc: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.mangoSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
