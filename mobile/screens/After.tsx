import { FontAwesome } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import {
  Animated,
  Image,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { config } from '../config';
import { mockFlags } from '../mocks/flags';
import {
  approvePart,
  cancelBooking,
  dayLabel,
  materialsOf,
  rateBooking,
  reportProblem,
  serviceName,
  setMockStage,
  tierOf,
  totalOf,
} from '../services/bookings';
import { pay } from '../services/payments';
import { C, R, SHADOW, peso } from '../theme';
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
  Loader,
  Note,
  Option,
  Ring,
  Rows,
  Screen,
  Sheet,
  Sub,
  T,
  Tear,
} from '../ui';
import { useTask } from '../useTask';
import type { App, Booking, Stage } from '../types';
import { CallButton } from './Manong';
import { GcashMark, bookedWhen } from './Book';
import { addressLine } from './Home';

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
const CANCEL_REASONS = [
  'Fixed it myself',
  'Booked by mistake',
  'Need a different time',
  'Found someone else',
  'Something else',
];
const REPORT_REASONS = [
  "The fix didn't work",
  'Charged too much',
  'Arrived late',
  'Damage to my place',
  'Something else',
];

const guardTip = (app: App, b: Booking) =>
  `Make sure your condo guards know ${b.category === 'moving' ? 'the movers are' : 'a Manong is'} coming for ${app.state.catalog[b.category].guardJob}.`;

/** Timeline rows: [title, detail, 'done' | 'cur' | '']. */
function Timeline({
  steps,
  note,
  current,
}: {
  steps: [string, string, 'done' | 'cur' | ''][];
  note?: string;
  /** A finished step that is also where the booking is now (checked, with "Current status"). */
  current?: number;
}) {
  return (
    <View accessibilityRole="list">
      {steps.map(([title, detail, state], i) => (
        <View key={title} style={[s.step, i < steps.length - 1 && { paddingBottom: 16 }]}>
          {i < steps.length - 1 && (
            <View style={[s.rail, state === 'done' && { backgroundColor: C.success }]} />
          )}
          <View
            style={[
              s.node,
              state === 'done' && { backgroundColor: C.success, borderColor: C.success },
              state === 'cur' && { borderColor: C.mango, backgroundColor: C.mango },
            ]}
          >
            {state === 'done' && <Icon name="check" size={12} color={C.white} />}
          </View>
          <View style={{ flex: 1 }}>
            <T w={600} style={{ color: state ? C.ink : C.slate }}>
              {title}
            </T>
            <Sub style={{ fontSize: 13 }}>{detail}</Sub>
            {(state === 'cur' || i === current) && (
              <T w={600} style={{ fontSize: 12, color: C.success }}>
                Current status{note ?? ''}
              </T>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

function ManongRow({
  app,
  b,
  chat = true,
  sub = 'Your Manong',
}: {
  app: App;
  b: Booking;
  chat?: boolean;
  sub?: string;
}) {
  const m = b.manong;
  return (
    <View style={s.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${m.name}, view profile`}
        onPress={() => {
          app.update({ viewManong: m });
          app.go('manong');
        }}
        style={[s.row, { flex: 1 }]}
      >
        <Avatar initial={m.initial} />
        <View style={{ flex: 1 }}>
          <T w={600}>{m.name}</T>
          <Sub style={{ fontSize: 13 }}>{sub}</Sub>
        </View>
      </Pressable>
      {chat && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Message ${m.first}`}
          onPress={() => app.go('chat')}
          style={s.chatBtn}
        >
          <Icon name="message-square" size={18} color={C.ink} />
        </Pressable>
      )}
      <CallButton manong={m} />
    </View>
  );
}

/** Dev-only switcher: flips the mock booking status and failure cases. Hidden unless config.devTools. */
export function DevMenu({ app }: { app: App }) {
  const [open, setOpen] = useState(false);
  const [, rerender] = useState(0);
  const b = app.state.booking;
  if (!config.devTools) return null;
  const stages: [Stage, string][] = [
    ['booked', 'Booked'],
    ['confirmed', 'Confirmed'],
    ['onway', 'On the way'],
    ['late', 'Running late'],
    ['inprogress', 'In progress'],
    ['completed', 'Completed'],
    ['mcancelled', 'Manong cancelled'],
    ['cancelled', 'Cancelled'],
  ];
  const setStage = async (stage: Stage) => {
    if (!b) return;
    setOpen(false);
    if (stage === 'cancelled') return finishCancel(app, b, 'Cancelled from the Dev menu', 0);
    const next = setMockStage(b, stage, app.state.catalog);
    app.update({ booking: next });
    app.go(stage === 'completed' ? 'charges' : 'status', { reset: true });
  };
  const flag = (k: keyof typeof mockFlags) => {
    mockFlags[k] = !mockFlags[k];
    rerender((n) => n + 1);
  };
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dev menu"
        onPress={() => setOpen(true)}
        style={s.dev}
      >
        <T w={700} style={{ fontSize: 12 }}>
          Dev
        </T>
      </Pressable>
      <Sheet open={open} onClose={() => setOpen(false)}>
        <ScrollView style={{ maxHeight: 520 }} contentContainerStyle={{ gap: 8 }}>
          <T w={700} style={{ fontSize: 18 }}>
            Mock status
          </T>
          {b ? (
            <Chips>
              {stages.map(([k, label]) => (
                <Chip key={k} label={label} on={b.stage === k} onPress={() => setStage(k)} />
              ))}
            </Chips>
          ) : (
            <Sub>Book something first to switch its status.</Sub>
          )}
          {b?.stage === 'inprogress' && (
            <Btn
              kind="secondary"
              label={`${b.manong.first} needs a part`}
              onPress={() => {
                setOpen(false);
                app.go('part');
              }}
            />
          )}
          <T w={700} style={{ fontSize: 18, marginTop: 8 }}>
            Failure cases
          </T>
          <Option
            title="No Manong free on the next search"
            selected={mockFlags.noManongFree}
            onPress={() => flag('noManongFree')}
          />
          <Option
            title="Next GCash payment fails"
            selected={mockFlags.failNextPayment}
            onPress={() => flag('failNextPayment')}
          />
        </ScrollView>
      </Sheet>
    </>
  );
}

async function finishCancel(app: App, b: Booking, reason: string, fee: number) {
  const past = await cancelBooking(b, fee, app.state.catalog);
  app.update((st) => ({
    past: [past, ...st.past],
    booking: null,
    cancelled: { booking: b, reason, fee },
  }));
  app.go('cancelled', { reset: true });
}

export function Status({ app }: { app: App }) {
  const b = app.state.booking;
  if (!b)
    return (
      <Screen header={<Header title="Booking" onBack={app.home} />}>
        <Sub style={{ textAlign: 'center', marginTop: 40 }}>This booking is closed.</Sub>
        <Btn kind="link" label="Back to home" onPress={app.home} />
      </Screen>
    );
  if (b.stage === 'onway') return <OnTheWay app={app} b={b} />;
  if (b.stage === 'inprogress') return <InProgress app={app} b={b} />;
  if (b.stage === 'mcancelled') return <ManongCancelled app={app} b={b} />;
  return <NotToday app={app} b={b} />;
}

function NotToday({ app, b }: { app: App; b: Booking }) {
  const m = b.manong;
  const now = b.bookingType === 'on-demand';
  const late = b.stage === 'late';
  const [cancelling, setCancelling] = useState(false);
  const [reason, setReason] = useState<number | null>(null);
  const task = useTask();
  const cur = b.stage === 'booked' ? 0 : 1;
  const steps: [string, string, 'done' | 'cur' | ''][] = [
    [now ? 'Requested' : 'Pending confirmation', 'Booked today', cur === 0 ? 'cur' : 'done'],
    [
      now ? 'Accepted' : 'Confirmed',
      cur
        ? now
          ? `${m.first} accepted your request`
          : `${m.first} confirmed your booking`
        : `Waiting for ${m.first}`,
      cur === 1 ? 'done' : '',
    ],
    ['In progress', now ? `When ${m.first} starts the job` : `Starts ${bookedWhen(b)}`, ''],
    ['Completed', 'You review charges and pay', ''],
  ];
  return (
    <Screen
      header={<Header title={`Booking ${b.id}`} onBack={app.home} right={<DevMenu app={app} />} />}
      footer={
        late ? (
          <Btn kind="secondary" label={`Message ${m.first}`} onPress={() => app.go('chat')} />
        ) : (
          <>
            <Sub style={{ textAlign: 'center', fontSize: 13 }}>
              You can cancel for free until Manong starts the job.
            </Sub>
            <Btn kind="danger" label="Cancel booking" onPress={() => setCancelling(true)} />
          </>
        )
      }
    >
      <Card>
        <T w={700} style={{ fontSize: 18 }}>
          {serviceName(b, app.state.catalog)}
        </T>
        <T w={600} style={{ marginTop: 2 }}>
          {now ? 'Requested now' : bookedWhen(b)}
        </T>
        <Sub numberOfLines={1} style={{ fontSize: 13 }}>
          {addressLine(b.address)}
        </Sub>
        <View style={{ marginTop: 12 }}>
          <Ring stage={b.stage} accepted={now} />
        </View>
        <Tear />
        <Timeline
          steps={steps}
          current={cur}
          note={now && cur === 1 ? ", we'll tell you when he heads out" : undefined}
        />
        <Tear />
        <ManongRow app={app} b={b} />
      </Card>
      {late ? (
        <Note icon="clock" text={`${m.first} is running late. We'll tell you when he's close.`} />
      ) : (
        <Note text={guardTip(app, b)} />
      )}
      <Sheet open={cancelling} onClose={() => setCancelling(false)}>
        <T w={700} style={{ fontSize: 20 }}>
          Cancel this booking?
        </T>
        <Label style={{ marginTop: 0 }}>Tell us why (optional)</Label>
        <Chips>
          {CANCEL_REASONS.map((r, i) => (
            <Chip
              key={r}
              label={r}
              on={reason === i}
              onPress={() => setReason(reason === i ? null : i)}
            />
          ))}
        </Chips>
        <ErrorText text={task.error} />
        <Btn label="Keep my booking" onPress={() => setCancelling(false)} />
        <Btn
          kind="danger"
          label="Yes, cancel booking"
          loading={task.busy}
          onPress={() =>
            task.run(async () => {
              await finishCancel(
                app,
                b,
                reason != null ? CANCEL_REASONS[reason] : 'No reason given',
                0,
              );
              setCancelling(false);
            })
          }
        />
      </Sheet>
    </Screen>
  );
}

function InProgress({ app, b }: { app: App; b: Booking }) {
  const m = b.manong;
  return (
    <Screen
      header={<Header title={`Booking ${b.id}`} onBack={app.home} right={<DevMenu app={app} />} />}
      footer={<Btn kind="secondary" label={`Message ${m.first}`} onPress={() => app.go('chat')} />}
    >
      <Card>
        <T w={700} style={{ fontSize: 18 }}>
          {serviceName(b, app.state.catalog)}
        </T>
        <Sub style={{ fontSize: 13 }}>Started 10:32 AM</Sub>
        <View style={{ marginTop: 12 }}>
          <Ring stage="inprogress" />
        </View>
        <Tear />
        <Timeline
          steps={[
            ['Confirmed', `${m.first} confirmed your booking`, 'done'],
            [`${m.first} arrived`, `At ${b.address.unit || 'your place'}`, 'done'],
            ['In progress', `Fixing the ${b.problem.toLowerCase()}`, 'cur'],
            ['Completed', 'You review charges and pay', ''],
          ]}
        />
        <Tear />
        <ManongRow app={app} b={b} chat={false} />
      </Card>
    </Screen>
  );
}

function ManongCancelled({ app, b }: { app: App; b: Booking }) {
  const [pick, setPick] = useState(0);
  const go = () => {
    // Same job, a different Manong: the mock sends whoever b.manong isn't.
    app.update((st) => ({
      booking: null,
      draft: {
        ...st.draft,
        category: b.category,
        serviceType: b.serviceType,
        bookingType: b.bookingType,
        desc: b.problem,
        symptoms: [],
        day: b.day,
        time: b.time,
        manong: null,
        preferred: b.manong.key === 'alfred' ? 'John' : 'Alfred',
        retried: true,
      },
    }));
    app.go(pick === 0 ? 'finding' : 'schedule', { reset: true });
  };
  return (
    <Screen
      header={<Header title={`Booking ${b.id}`} onBack={app.home} right={<DevMenu app={app} />} />}
      footer={<Btn label="Continue" onPress={go} />}
    >
      <H>{b.manong.first} had to cancel</H>
      <Sub>Something came up on his side. Your booking is safe and you won't be charged.</Sub>
      <Label>What would you like to do?</Label>
      <Option
        title="Find another Manong"
        desc="Same day and time"
        selected={pick === 0}
        onPress={() => setPick(0)}
      />
      <Option
        title="Pick a new time"
        desc="Choose another day"
        selected={pick === 1}
        onPress={() => setPick(1)}
      />
    </Screen>
  );
}

// Book 5b: the map fills the screen behind a sheet that peeks and drags open.
// TODO(backend): live location feed for the Manong's marker and the distance; the mock map is a static image.
function OnTheWay({ app, b }: { app: App; b: Booking }) {
  const m = b.manong;
  const tower = b.address.unit.split(', ').pop() || 'your place';
  const [h, setH] = useState(0);
  const [peek, setPeek] = useState(true);
  const y = useRef(new Animated.Value(0)).current;
  const peekY = Math.max(h * 0.46, 0);
  const snap = (toPeek: boolean) => {
    setPeek(toPeek);
    Animated.spring(y, {
      toValue: toPeek ? peekY : 0,
      useNativeDriver: false,
      bounciness: 0,
    }).start();
  };
  const start = useRef(0);
  const pan = useRef(
    PanResponder.create({
      // Claim the drag on its first pixel (mouse on web) or once it moves (touch, over the handle button).
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dy) > 4,
      onMoveShouldSetPanResponderCapture: (_e, g) => Math.abs(g.dy) > 4,
      onPanResponderGrant: () => {
        y.stopAnimation((v) => (start.current = v));
      },
      onPanResponderMove: (_e, g) =>
        y.setValue(Math.min(Math.max(start.current + g.dy, 0), peekRef.current)),
      onPanResponderTerminationRequest: () => false,
      onPanResponderRelease: (_e, g) => snapRef.current(start.current + g.dy > peekRef.current / 2),
      onPanResponderTerminate: (_e, g) =>
        snapRef.current(start.current + g.dy > peekRef.current / 2),
    }),
  ).current;
  // PanResponder is created once, so it reads the latest layout through refs.
  const peekRef = useRef(peekY);
  peekRef.current = peekY;
  const snapRef = useRef(snap);
  snapRef.current = snap;

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <Header title={`Booking ${b.id}`} onBack={app.home} right={<DevMenu app={app} />} />
      <View
        style={{ flex: 1, overflow: 'hidden' }}
        onLayout={(e) => {
          const nh = e.nativeEvent.layout.height;
          setH(nh);
          y.setValue(peek ? nh * 0.46 : 0);
        }}
      >
        <View
          style={StyleSheet.absoluteFill}
          accessible
          accessibilityLabel={`Map: ${m.first} is 6 km away, heading to ${tower}`}
        >
          <Image
            source={require('../assets/map.png')}
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
          />
          <Svg
            style={StyleSheet.absoluteFill}
            viewBox="0 0 375 420"
            preserveAspectRatio="xMidYMin slice"
          >
            <Path
              d="M300 70 C 285 120, 270 140, 250 180 S 210 250, 190 275"
              stroke="#111"
              strokeWidth={4}
              fill="none"
              strokeLinecap="round"
            />
          </Svg>
          <View style={[s.pin, { right: '17%', top: 40 }]}>
            <Icon name="home" size={18} color={C.mango} />
          </View>
          <View style={[s.mapPill, { right: '12%', top: 84 }]}>
            <T w={600} style={{ fontSize: 13 }}>
              {tower}
            </T>
          </View>
          <View style={[s.marker, { left: '58%', top: 150 }]}>
            <T w={800}>{m.initial}</T>
          </View>
          <View style={[s.mapPill, { left: '28%', top: 118, backgroundColor: '#111' }]}>
            <Icon name="navigation" size={14} color={C.white} />
            <T w={600} style={{ fontSize: 13, color: C.white }}>
              6 km
            </T>
          </View>
        </View>
        {peek && h > 0 && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Center map"
            onPress={() => app.toast('Centered on your building')}
            style={[s.recenter, { top: peekY - 60 }]}
          >
            <Icon name="crosshair" size={20} color={C.ink} />
          </Pressable>
        )}
        <Animated.View style={[s.sheet, { top: y }]}>
          <View {...pan.panHandlers}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={peek ? 'Show more details' : 'Show less'}
              onPress={() => snap(!peek)}
              style={{ paddingVertical: 10 }}
            >
              <View style={s.grab} />
            </Pressable>
            <T w={700} style={{ fontSize: 18 }}>
              {serviceName(b, app.state.catalog)}
            </T>
            <T w={600} style={{ marginTop: 2 }}>
              {b.time ? `Today at ${b.time}` : 'Today'}
            </T>
            <Sub numberOfLines={1} style={{ fontSize: 13 }}>
              {addressLine(b.address)}
            </Sub>
            <View style={{ marginTop: 12 }}>
              <Ring stage="onway" />
            </View>
          </View>
          <ScrollView scrollEnabled={!peek} contentContainerStyle={{ paddingBottom: 32 }}>
            <Tear />
            <ManongRow app={app} b={b} chat={false} sub={m.vehicle} />
            <Tear />
            <Timeline
              steps={[
                ['Pending confirmation', 'Booked earlier', 'done'],
                ['Confirmed', `${m.first} confirmed your booking`, 'done'],
                ['On the way', `${m.first} is heading to ${tower}`, 'cur'],
                ['In progress', `Starts once ${m.first} arrives`, ''],
                ['Completed', 'You review charges and pay', ''],
              ]}
            />
          </ScrollView>
        </Animated.View>
      </View>
    </View>
  );
}

export function Part({ app }: { app: App }) {
  const b = app.state.booking!; // opened only from an in-progress booking
  const [name, price, why] = app.state.catalog[b.category].part;
  const task = useTask();
  return (
    <Screen
      header={<Header title={`Booking ${b.id}`} onBack={app.back} />}
      footer={
        <>
          <ErrorText text={task.error} />
          <Btn
            label={`Approve ${peso(price)}`}
            loading={task.busy}
            onPress={() =>
              task.run(async () => {
                app.update({ booking: await approvePart(b, app.state.catalog) });
                app.back();
                app.toast(`Approved. ${peso(price)} added to your bill.`);
              })
            }
          />
          <Btn
            kind="secondary"
            label="Decline"
            onPress={() => {
              app.back();
              app.toast(`Declined. ${b.manong.first} will finish the base repair only.`);
            }}
          />
        </>
      }
    >
      <H>{b.manong.first} needs a part</H>
      <Sub>Approve it before he adds it to your bill. Nothing changes unless you say yes.</Sub>
      <Card>
        <View style={s.row}>
          <View style={s.sq}>
            <Icon name={app.state.catalog[b.category].icon} size={18} color={C.ink} />
          </View>
          <View style={{ flex: 1 }}>
            <T w={600}>{name}</T>
            <Sub style={{ fontSize: 13 }}>{why}</Sub>
          </View>
          <T w={700} style={{ fontSize: 18 }}>
            {peso(price)}
          </T>
        </View>
        <Tear />
        <Rows
          rows={[
            ['Base charge', peso(tierOf(b, app.state.catalog).price)],
            ['This part', peso(price)],
          ]}
        />
        <View style={[s.between, { marginTop: 8 }]}>
          <T w={700}>New total</T>
          <T w={700}>{peso(totalOf(b, app.state.catalog) + price)}</T>
        </View>
      </Card>
      <Note
        text={`Not sure? Message ${b.manong.first} first. If you decline, he finishes the base repair only.`}
      />
    </Screen>
  );
}

export function Charges({ app }: { app: App }) {
  const b = app.state.booking!; // opened only for a completed booking
  const { catalog } = app.state;
  const [method, setMethod] = useState(b.payment);
  const [failed, setFailed] = useState<string | null>(null);
  const task = useTask();
  const total = totalOf(b, catalog);
  const mats = materialsOf(b, catalog);
  const paying = task.busy && method === 'gcash';
  const payNow = (how = method) =>
    task.run(async () => {
      try {
        const paid = await pay(b, how);
        app.update({ booking: paid });
        app.go('rate', { replace: true });
        app.toast(`Paid ${peso(total)}. Receipt emailed.`);
      } catch (e) {
        setFailed((e as Error).message);
      }
    });
  return (
    <Screen
      header={<Header title={`Booking ${b.id}`} onBack={app.home} right={<DevMenu app={app} />} />}
      footer={
        failed ? (
          <>
            <Btn label="Try GCash again" loading={task.busy} onPress={() => payNow('gcash')} />
            <Btn
              kind="link"
              label="Pay in cash instead"
              onPress={() => {
                setMethod('cash');
                payNow('cash');
              }}
            />
          </>
        ) : (
          <>
            <ErrorText text={task.error} />
            <Btn
              label={
                method === 'gcash'
                  ? `Pay ${peso(total)} with GCash`
                  : `I paid ${peso(total)} in cash`
              }
              loading={task.busy}
              onPress={() => payNow()}
            />
            <Btn
              kind="link"
              label="Report a problem"
              onPress={() => {
                app.update({ reportFrom: 'charges' });
                app.go('report');
              }}
            />
          </>
        )
      }
    >
      <H>{failed ? 'GCash payment failed' : `${b.manong.first} finished the job`}</H>
      <Sub>{failed ?? 'Check the charges before you pay.'}</Sub>
      <Card>
        <View style={s.between}>
          <T w={600} style={{ fontSize: 16, flexShrink: 1 }}>
            {tierOf(b, catalog).name}
          </T>
          <Ring stage="completed" />
        </View>
        <View style={[s.between, { marginTop: 10 }]}>
          <Sub>Base charge</Sub>
          <T w={600}>{peso(tierOf(b, catalog).price)}</T>
        </View>
        {mats.length > 0 && (
          <>
            <Tear />
            <T w={600} style={{ fontSize: 14, marginBottom: 6 }}>
              Materials added <Sub>{mats.length === 1 ? '1 item' : `${mats.length} items`}</Sub>
            </T>
            {mats.map(([n, p]) => (
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
        <View style={[s.between, { marginTop: 12 }]}>
          <View style={s.row}>
            {method === 'gcash' ? (
              <GcashMark />
            ) : (
              <Icon name="dollar-sign" size={16} color={C.slate} />
            )}
            <Sub>{method === 'gcash' ? 'Paying with GCash' : 'Paying with cash'}</Sub>
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              const next = method === 'gcash' ? 'cash' : 'gcash';
              setMethod(next);
              app.toast(`Paying with ${next === 'gcash' ? 'GCash' : 'cash'}`);
            }}
          >
            <T w={600} style={{ textDecorationLine: 'underline' }}>
              Change
            </T>
          </Pressable>
        </View>
      </Card>
      {failed ? (
        <Note bad text="Check your GCash balance, or pay in cash." />
      ) : (
        <Note
          text={`Ask ${b.manong.first} about any charge you don't recognize. Paying closes ticket ${b.id}.`}
        />
      )}
      <Sheet open={paying} onClose={() => {}}>
        <Loader />
        <T w={700} style={{ fontSize: 20, textAlign: 'center' }}>
          Paying with GCash…
        </T>
        <Sub style={{ textAlign: 'center' }}>
          Sending {peso(total)} to {b.manong.first}.
        </Sub>
      </Sheet>
    </Screen>
  );
}

export function Rate({ app }: { app: App }) {
  const b = app.state.booking!; // opened right after paying
  const { catalog, addresses, addressIdx } = app.state;
  const [stars, setStars] = useState(4);
  const [praise, setPraise] = useState<string[]>(['On time', 'Clean work']);
  const [note, setNote] = useState('');
  const task = useTask();
  const toggle = (p: string) =>
    setPraise(praise.includes(p) ? praise.filter((x) => x !== p) : [...praise, p]);
  const finish = (rating: number) =>
    task.run(async () => {
      const done = await rateBooking(b, rating, praise, note, catalog);
      app.update((st) => ({ past: [done, ...st.past], booking: null }));
      if (rating) app.go('thanks', { replace: true });
      else app.home();
    });
  return (
    <Screen
      top={false}
      footer={
        <>
          <ErrorText text={task.error} />
          <Btn
            label="Submit rating"
            disabled={!stars}
            loading={task.busy}
            onPress={() => finish(stars)}
          />
          <Btn kind="link" label="Skip for now" onPress={() => finish(0)} />
        </>
      }
    >
      <SafeAreaView edges={['top']} style={s.rateBand}>
        <Card>
          <View style={s.between}>
            <T w={600} style={{ flexShrink: 1 }}>
              {serviceName(b, catalog)}
            </T>
            <Ring stage="paid" />
          </View>
          <Tear />
          <Sub style={{ fontSize: 13 }}>
            {peso(totalOf(b, catalog))} with {b.payment === 'gcash' ? 'GCash' : 'cash'}, receipt
            emailed
          </Sub>
        </Card>
      </SafeAreaView>
      <Avatar initial={b.manong.initial} size={56} />
      <H>How did {b.manong.first} do?</H>
      <Sub>
        Your rating helps other residents in{' '}
        {b.address.bldg || addresses[addressIdx]?.bldg || 'your building'}.
      </Sub>
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

export function Cancelled({ app }: { app: App }) {
  const c = app.state.cancelled!; // opened right after a cancel
  const b = c.booking;
  const rebook = () => {
    app.update((st) => ({
      draft: {
        ...st.draft,
        category: b.category,
        serviceType: b.serviceType,
        bookingType: 'scheduled',
        desc: b.problem,
        symptoms: [],
        day: null,
        time: null,
        manong: null,
        preferred: null,
        retried: false,
      },
    }));
    app.go('schedule', { reset: true });
  };
  return (
    <Screen
      header={<Header title={`Booking ${b.id}`} onBack={app.home} />}
      footer={
        <>
          <Btn label="Book a new time" onPress={rebook} />
          <Btn kind="link" label="Go to home" onPress={app.home} />
        </>
      }
    >
      <H>Booking cancelled</H>
      <Sub>
        {c.fee
          ? `You paid a ${peso(c.fee)} trip fee. ${b.manong.first} has been told.`
          : `You weren't charged. ${b.manong.first} has been told, and the slot is free again.`}
      </Sub>
      <Card>
        <T w={700} style={{ fontSize: 18 }}>
          {serviceName(b, app.state.catalog)}
        </T>
        <Sub style={{ fontSize: 13 }}>
          Was set for {b.bookingType === 'on-demand' ? 'today, now' : bookedWhen(b)}
        </Sub>
        <View style={{ marginTop: 12 }}>
          <Ring stage="cancelled" />
        </View>
        <Tear />
        <Rows
          rows={[
            [
              'Cancelled on',
              `${dayLabel(new Date())}, ${new Date().toLocaleTimeString('en-PH', { hour: 'numeric', minute: '2-digit' })}`,
            ],
            ['Reason', c.reason],
            ['Charge', peso(c.fee)],
          ]}
        />
      </Card>
    </Screen>
  );
}

export function Report({ app }: { app: App }) {
  const b = app.state.booking;
  const [reason, setReason] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [photo, setPhoto] = useState(false);
  const task = useTask();
  return (
    <Screen
      header={<Header title={`Booking ${b?.id ?? ''}`} onBack={app.back} />}
      footer={
        <>
          <ErrorText text={task.error} />
          <Btn
            label="Send report"
            loading={task.busy}
            onPress={() =>
              task.run(async () => {
                await reportProblem(
                  b?.id ?? '',
                  reason != null ? REPORT_REASONS[reason] : null,
                  text,
                );
                app.go('reportsent', { replace: true });
              })
            }
          />
        </>
      }
    >
      <H>What went wrong?</H>
      <Sub>Tell us and we'll sort it out with {b ? b.manong.first : 'your Manong'}.</Sub>
      <Chips>
        {REPORT_REASONS.map((r, i) => (
          <Chip
            key={r}
            label={r}
            on={reason === i}
            onPress={() => setReason(reason === i ? null : i)}
          />
        ))}
      </Chips>
      <Label>What happened</Label>
      <View style={s.box}>
        <TextInput
          accessibilityLabel="What happened"
          multiline
          maxLength={300}
          value={text}
          onChangeText={setText}
          placeholder="e.g. The sink started dripping again an hour after he left."
          placeholderTextColor={C.slate}
          style={{ minHeight: 64, fontSize: 15, color: C.ink, textAlignVertical: 'top' }}
        />
        <Sub style={{ alignSelf: 'flex-end', fontSize: 12 }}>{text.length} / 300</Sub>
      </View>
      <View style={s.row}>
        {/* TODO(backend): upload the photo with the report. The mock uses a sample photo. */}
        {photo ? (
          <Image
            source={require('../assets/pipe.png')}
            style={s.photo}
            accessibilityLabel="Report photo"
          />
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add photo"
            onPress={() => setPhoto(true)}
            style={[s.photo, s.addPhoto]}
          >
            <Icon name="camera" size={20} color={C.ink} />
            <T w={600} style={{ fontSize: 13 }}>
              Add
            </T>
          </Pressable>
        )}
        <Sub style={{ flex: 1, fontSize: 13 }}>Photos help us check faster. Optional.</Sub>
      </View>
    </Screen>
  );
}

export function ReportSent({ app }: { app: App }) {
  const b = app.state.booking;
  const id = b?.id ?? app.state.cancelled?.booking.id ?? '';
  const first = b?.manong.first ?? app.state.cancelled?.booking.manong.first ?? 'your Manong';
  return (
    <Screen
      header={<Header title={`Booking ${id}`} onBack={app.home} />}
      footer={
        <>
          <Btn
            label="Back to booking"
            onPress={() => (b ? app.go(app.state.reportFrom, { reset: true }) : app.home())}
          />
          <Btn kind="link" label="Go to home" onPress={app.home} />
        </>
      }
    >
      <H>We got your report</H>
      <Sub>Ticket {id}-R1. We'll text you each time there's an update.</Sub>
      <Card style={{ gap: 14 }}>
        <T w={700} style={{ fontSize: 17 }}>
          What happens next
        </T>
        {[
          ['We review your report', "We'll text you once we've looked at it."],
          [`We check with ${first}`, 'He gets a chance to explain.'],
          ['We make it right', 'A free revisit or a refund if the fix failed.'],
        ].map(([t, d], i) => (
          <View key={t} style={s.row}>
            <View style={s.num}>
              <T w={700}>{i + 1}</T>
            </View>
            <View style={{ flex: 1 }}>
              <T w={600}>{t}</T>
              <Sub style={{ fontSize: 13 }}>{d}</Sub>
            </View>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

const s = StyleSheet.create({
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  row: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  step: { flexDirection: 'row', gap: 12 },
  rail: { position: 'absolute', left: 9, top: 22, bottom: 0, width: 2, backgroundColor: C.line },
  node: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: C.line,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  chatBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: C.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dev: {
    borderWidth: 1.5,
    borderColor: C.ink,
    borderRadius: R.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minHeight: 32,
    justifyContent: 'center',
  },
  sq: {
    width: 40,
    height: 40,
    borderRadius: R.control,
    backgroundColor: C.mangoSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
    borderRadius: R.card,
    borderWidth: 1,
    borderColor: C.line,
    padding: 14,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  box: {
    backgroundColor: C.white,
    borderRadius: R.card,
    borderWidth: 1,
    borderColor: C.line,
    padding: 14,
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
  mark: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: C.mango,
    alignItems: 'center',
    justifyContent: 'center',
  },
  num: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.mango,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pin: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPill: {
    position: 'absolute',
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    backgroundColor: C.white,
    borderRadius: R.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  marker: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: C.mango,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 10,
    borderColor: 'rgba(255,199,44,0.35)',
  },
  recenter: {
    position: 'absolute',
    right: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.ticket,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: C.white,
    borderTopLeftRadius: R.sheet,
    borderTopRightRadius: R.sheet,
    paddingHorizontal: 24,
    ...SHADOW.sheet,
  },
  grab: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(0,0,0,0.15)',
    alignSelf: 'center',
  },
});
