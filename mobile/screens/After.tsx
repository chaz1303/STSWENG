// Flow 4 after booking: finding, live tracking, pending/confirmed, declined, summary and thank-you.
import { useEffect, useRef, useState } from 'react';
import { Image, Pressable, ScrollView, Share, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { config } from '../config';
import { DURATION } from '../mocks/catalog';
import {
  answerPart,
  cancelBooking,
  dayLabel,
  priceOf,
  rateBooking,
  reportIssue,
  totalOf,
  weekday,
  whenText,
} from '../services/bookings';
import { chargeTip } from '../services/payments';
import { C, R, SHADOW, peso } from '../theme';
import {
  Avatar,
  Btn,
  Canopy,
  Card,
  Chip,
  Chips,
  ErrorText,
  FontAwesome,
  Grey,
  Icon,
  IMG,
  Kv,
  MapView,
  Opt,
  Pill,
  Progress,
  Sheet,
  SheetTitle,
  Sub,
  T,
  Verified,
} from '../ui';
import { useTask } from '../useTask';
import type { App, Booking, Stage } from '../types';
import { CallScreen, ChatSheet, QrSheet } from './Manong';

const STARS = [
  '',
  'Hindi maganda (1 Star)',
  'Medyo kulang (2 Stars)',
  'Okay lang (3 Stars)',
  'Ayos! (4 Stars)',
  'Sobrang Ayos! (5 Stars)',
];
const PRAISE = [
  ['⏰', 'Arrived on time'],
  ['🔧', 'Clean & thorough work'],
  ['💬', 'Courteous & polite'],
  ['💡', 'Helpful tips'],
  ['🛡️', 'Followed safety rules'],
  ['🏷️', 'Fair & honest pricing'],
];
const CANCEL_REASONS = ['Plans changed', 'Fixed it myself', 'Booked the wrong time', 'Other'];
const REPORT_REASONS = [
  "Charge I don't recognize",
  'Job not finished',
  'Damage in my unit',
  'Manong was late',
  'Something else',
];

const tierOf = (app: App, b: Booking) => app.state.catalog[b.category].tiers[b.serviceType];
const proOf = (app: App, b: Booking) => app.state.catalog[b.category].pro;

/** Dev-only switcher for the mock booking status. Hidden unless config.devTools. */
export function DevMenu({ app }: { app: App }) {
  const [open, setOpen] = useState(false);
  const b = app.state.booking;
  if (!config.devTools) return null;
  const stages: [Stage, string][] = [
    ['finding', 'Finding'],
    ['pending', 'Pending'],
    ['confirmed', 'Confirmed'],
    ['declined', 'Declined'],
    ['onway', 'On the way'],
    ['arrived', 'Arrived'],
    ['done', 'Job done'],
  ];
  const set = (stage: Stage) => {
    if (!b) return;
    setOpen(false);
    const f = b.manong.first;
    const note: Record<string, string> = {
      confirmed: `${f} confirmed ${whenText(b)}`,
      declined: `${f} can't take your booking. Pick another Manong.`,
      onway: `${f} is on the way`,
    };
    app.update((st) => ({
      booking: { ...b, stage },
      eta: stage === 'onway' ? 10 : st.eta,
      notifications: note[stage]
        ? [
            { group: 'Today', text: note[stage], time: 'Now', unread: true, act: 'bookings' },
            ...st.notifications,
          ]
        : st.notifications,
    }));
    app.openBooking(stage);
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
        <SheetTitle
          title="Mock status"
          sub={
            b ? 'Stands in for what the Manong does.' : 'Book something first to switch its status.'
          }
        />
        {b && (
          <Chips>
            {stages.map(([k, l]) => (
              <Chip key={k} label={l} on={b.stage === k} onPress={() => set(k)} />
            ))}
          </Chips>
        )}
        {b && ['onway', 'arrived'].includes(b.stage) && (
          <Btn
            kind="grey"
            label="Manong asks to add a part"
            onPress={() => {
              setOpen(false);
              app.update({ partAsk: true });
              app.openBooking();
            }}
          />
        )}
      </Sheet>
    </>
  );
}

function Rows({ app, b }: { app: App; b: Booking }) {
  return (
    <>
      <View style={s.lrow}>
        <Avatar manong={b.manong} size={50} />
        <View style={{ flex: 1, gap: 2 }}>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <T w={800} style={{ fontSize: 17 }}>
              {b.manong.name}
            </T>
            <Verified />
          </View>
          <Sub style={{ fontSize: 12 }}>
            {b.manong.skills} • {b.manong.rating}★ ({b.manong.jobs} jobs)
          </Sub>
        </View>
      </View>
      <View style={{ marginTop: 14 }}>
        <Kv
          rows={[
            ['Service', tierOf(app, b).name],
            ['Duration', DURATION[b.serviceType]],
            ['When', whenText(b)],
            ['Location', b.address.short],
            [
              'Estimate',
              peso(priceOf(b.category, b.serviceType, app.state.voucher, app.state.catalog)),
            ],
          ]}
        />
      </View>
    </>
  );
}

function Foot({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView edges={['bottom']} style={s.foot}>
      {children}
    </SafeAreaView>
  );
}

/** Closes the active booking after a cancel. */
async function cancelAndClose(app: App, b: Booking, reason: string | null, message: string) {
  await cancelBooking(b, reason);
  app.update({ booking: null });
  app.home();
  app.toast(message);
}

export function Finding({ app }: { app: App }) {
  const b = app.state.booking!; // opened only while a "now" booking is searching
  const [pct, setPct] = useState(0.06);
  const [secs, setSecs] = useState(38);
  const [cancelling, setCancelling] = useState(false);
  const task = useTask();
  const left = useRef(false);
  const gcash = app.state.payment === 'gcash';

  useEffect(() => {
    let n = 0;
    const t = setInterval(() => {
      n += 1;
      setPct(Math.min(1, 0.06 + n * 0.07));
      setSecs((x) => Math.max(0, x - 3));
      if (n < 14) return;
      clearInterval(t);
      // TODO(backend): acceptance arrives by push; the mock accepts after a few seconds.
      app.update((st) =>
        st.booking?.stage === 'finding'
          ? { booking: { ...st.booking, stage: 'onway' }, eta: 10 }
          : {},
      );
      app.go('found', { replace: true });
      app.toast(`${b.manong.first} accepted your request`);
    }, 400);
    return () => {
      clearInterval(t);
      if (!left.current) return;
      // Left with the back arrow: the search carries on and Home's strip picks it up.
      setTimeout(() => {
        app.update((st) =>
          st.booking?.stage === 'finding'
            ? {
                booking: { ...st.booking, stage: 'onway' },
                eta: 10,
                notifications: [
                  {
                    group: 'Today',
                    text: `${b.manong.first} accepted your request`,
                    time: 'Now',
                    unread: true,
                    act: 'home',
                  },
                  ...st.notifications,
                ],
              }
            : {},
        );
        app.toast(`${b.manong.first} accepted your request`);
      }, 3500);
    };
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <Canopy
        title="Finding Your Manong"
        sub="Searching for available Manongs nearby..."
        pill={app.state.catalog[b.category].name}
        onBack={() => {
          left.current = true;
          app.home();
          app.toast("We'll let you know when a Manong accepts");
        }}
      />
      <View style={{ marginTop: -28 }}>
        <MapView building={b.address.title.split(',')[0]} finding height={330} />
      </View>
      <View style={s.bsheet}>
        <View style={s.grab} />
        <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 20 }}>
          <View style={s.between}>
            <View style={{ flex: 1 }}>
              <T w={800} style={{ fontSize: 20 }}>
                Connecting to Manong <T style={{ color: C.mango }}>●</T>
              </T>
              <Sub style={{ fontSize: 14 }}>
                {proOf(app, b)} • {tierOf(app, b).name}
              </Sub>
            </View>
            <View style={s.eta}>
              <Icon name="clock" size={14} color={C.ink} />
              <T w={700}>~ {secs} s</T>
            </View>
          </View>
          <Progress value={pct} />
          <Grey>
            <View style={s.lrow}>
              <Icon name="map-pin" size={18} color={C.ink} />
              <View style={{ flex: 1 }}>
                <T w={700} style={{ fontSize: 14 }}>
                  {b.address.title.replace(', Tower 1', '')}
                </T>
                <Sub style={{ fontSize: 12 }}>{b.address.detail}</Sub>
              </View>
            </View>
            <View style={s.lrow}>
              <Icon name="shield" size={18} color={C.gcash} />
              <T style={{ flex: 1, fontSize: 13, color: '#444' }}>
                {gcash ? 'GCash Escrow Protection' : 'Pay cash after the job'}
              </T>
              <Pill text={gcash ? 'Safe Hold' : 'Cash'} bg={C.mango} />
            </View>
          </Grey>
          <View style={s.tip}>
            <Icon name="zap" size={18} color={C.goldText} />
            <T style={{ flex: 1, fontSize: 13 }}>
              <T w={800} style={{ fontSize: 13 }}>
                Mang Juan Pro-Tip:
              </T>{' '}
              Notify lobby security or prepare condo gate authorization so Manong can head straight
              up.
            </T>
          </View>
          <Btn
            kind="grey"
            label="Cancel Request"
            icon={<Icon name="x" size={18} color={C.ink} />}
            onPress={() => setCancelling(true)}
          />
        </ScrollView>
      </View>
      <Sheet open={cancelling} onClose={() => setCancelling(false)}>
        <SheetTitle
          title="Cancel this request?"
          sub="We'll stop looking and release your GCash hold. You'll go back to the home screen."
        />
        <ErrorText text={task.error} />
        <Btn
          kind="white"
          label="Yes, cancel request"
          loading={task.busy}
          style={{ borderWidth: 1.5, borderColor: C.destructive }}
          onPress={() =>
            task.run(() =>
              cancelAndClose(
                app,
                b,
                null,
                gcash ? 'Request cancelled. GCash hold released.' : 'Request cancelled.',
              ),
            )
          }
        />
        <Btn label="Keep looking" onPress={() => setCancelling(false)} />
      </Sheet>
    </View>
  );
}

export function Found({ app }: { app: App }) {
  const b = app.state.booking!; // opened only while the Manong is on the way or arrived
  const { eta, partAsk, catalog } = app.state;
  const arrived = b.stage === 'arrived';
  const [sheet, setSheet] = useState<'chat' | 'qr' | 'call' | 'stop' | 'report' | null>(null);
  const [reason, setReason] = useState<number | null>(null);
  const [text, setText] = useState('');
  const task = useTask();
  const [part, price] = catalog[b.category].part;

  useEffect(() => {
    if (b.stage !== 'onway') return;
    // TODO(backend): ETA and distance from the live location feed; the mock counts down.
    const t = setInterval(() => {
      app.update((st) => {
        if (st.booking?.stage !== 'onway') return {};
        const next = Math.max(0, st.eta - 1);
        if (next > 0) return { eta: next };
        app.toast(`${st.booking.manong.first} has arrived at Tower 1`);
        return { eta: 0, booking: { ...st.booking, stage: 'arrived' } };
      });
    }, 1500);
    return () => clearInterval(t);
  }, [b.stage]);

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <Canopy
        title={arrived ? 'Manong Has Arrived' : 'Live Manong Tracking'}
        sub="Real-time dispatch & GPS updates to your door."
        pill={catalog[b.category].name}
        onBack={app.home}
        right={<DevMenu app={app} />}
      />
      <View style={{ marginTop: -28 }}>
        <MapView building={b.address.title.split(',')[0]} height={280} />
      </View>
      <View style={s.bsheet}>
        <View style={s.grab} />
        <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 20 }}>
          <View style={s.between}>
            <View style={{ flex: 1 }}>
              <T w={800} style={{ fontSize: 20 }}>
                {arrived ? 'Manong is at your door' : 'Manong on the move'}{' '}
                <T style={{ color: C.mango }}>●</T>
              </T>
              <Sub style={{ fontSize: 14 }}>
                {proOf(app, b)} • {tierOf(app, b).name}
              </Sub>
            </View>
            <View style={s.eta}>
              <Icon name="clock" size={14} color={C.ink} />
              <T w={700}>{arrived ? 'Arrived' : `~ ${eta} mins`}</T>
            </View>
          </View>
          <Progress value={arrived ? 1 : (60 + (10 - eta) * 4) / 100} />
          <Grey>
            <View style={s.lrow}>
              <Avatar manong={b.manong} size={50} />
              <View style={{ flex: 1, gap: 2 }}>
                <View
                  style={{ flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}
                >
                  <T w={800} style={{ fontSize: 17 }}>
                    {b.manong.name}
                  </T>
                  <Verified label="Verified Manong" />
                </View>
                <Sub style={{ fontSize: 12 }}>
                  {proOf(app, b)} • {b.manong.rating}★ ({b.manong.jobs} jobs)
                </Sub>
                <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
                  <Icon name="navigation" size={12} color={C.gcash} />
                  <T style={{ fontSize: 12, color: C.gcash }}>
                    {arrived ? 'At your building' : `${(eta * 0.14).toFixed(1)} km away from you`}
                  </T>
                </View>
              </View>
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Btn
                kind="white"
                label="Chat Manong"
                icon={<Icon name="message-square" size={18} color={C.ink} />}
                onPress={() => setSheet('chat')}
                style={{ flex: 1, height: 48, paddingHorizontal: 10 }}
              />
              <Btn
                label="Call Manong"
                icon={<Icon name="phone" size={18} color={C.white} />}
                onPress={() => setSheet('call')}
                style={{ flex: 1, height: 48, paddingHorizontal: 10 }}
              />
            </View>
            <View
              style={[s.lrow, { borderTopWidth: 1, borderTopColor: '#e3e3e3', paddingTop: 12 }]}
            >
              <Icon name="credit-card" size={20} color={C.ink} />
              <View style={{ flex: 1 }}>
                <Sub style={{ fontSize: 11 }}>Lobby Security Gate Pass</Sub>
                <T w={800} style={{ letterSpacing: 0.6 }}>
                  PIN: {b.id}
                </T>
              </View>
              <Pressable accessibilityRole="button" onPress={() => setSheet('qr')} style={s.small}>
                <Icon name="grid" size={14} color={C.ink} />
                <T w={700} style={{ fontSize: 13 }}>
                  Show QR
                </T>
              </Pressable>
            </View>
          </Grey>
          <Grey>
            <View style={s.lrow}>
              <Icon name="map-pin" size={18} color={C.ink} />
              <View style={{ flex: 1 }}>
                <T w={700} style={{ fontSize: 14 }}>
                  {b.address.title.replace(', Tower 1', '')}
                </T>
                <Sub style={{ fontSize: 12 }}>{b.address.detail}</Sub>
              </View>
            </View>
          </Grey>
          {arrived && (
            <Btn
              label="Job done · View order summary"
              icon={<Icon name="arrow-right" size={20} color={C.white} />}
              style={{ flexDirection: 'row-reverse' }}
              onPress={() => {
                app.update({ booking: { ...b, stage: 'done' } });
                app.go('summary', { replace: true });
              }}
            />
          )}
          <Btn
            kind="grey"
            label="Cancel Request/ Report Issue"
            icon={<Icon name="alert-triangle" size={18} color={C.ink} />}
            onPress={() => setSheet('stop')}
          />
        </ScrollView>
      </View>
      <ChatSheet app={app} manong={b.manong} open={sheet === 'chat'} close={() => setSheet(null)} />
      <QrSheet pin={b.id} open={sheet === 'qr'} close={() => setSheet(null)} />
      <CallScreen manong={b.manong} open={sheet === 'call'} close={() => setSheet(null)} />
      <Sheet open={sheet === 'stop'} onClose={() => setSheet(null)}>
        <SheetTitle title="Need to stop or report?" />
        <Opt
          title="Cancel request"
          sub="Free before Manong starts. GCash hold is released."
          icon={<Icon name="x" size={20} color={C.ink} />}
          onPress={() =>
            task.run(() =>
              cancelAndClose(
                app,
                b,
                null,
                app.state.payment === 'gcash'
                  ? 'Request cancelled. GCash hold released.'
                  : 'Request cancelled.',
              ),
            )
          }
        />
        <Opt
          title="Report an issue"
          sub="Late, unsafe, or wrong Manong"
          icon={<Icon name="alert-triangle" size={20} color={C.ink} />}
          onPress={() => setSheet('report')}
        />
        <ErrorText text={task.error} />
        <Btn kind="grey" label="Keep booking" onPress={() => setSheet(null)} />
      </Sheet>
      <Sheet open={sheet === 'report'} onClose={() => setSheet(null)}>
        <SheetTitle title="Report a problem" sub="Our team replies within 15 minutes." />
        {REPORT_REASONS.map((r, i) => (
          <Opt
            key={r}
            title={r}
            on={reason === i}
            onPress={() => setReason(reason === i ? null : i)}
          />
        ))}
        <TextInput
          accessibilityLabel="Details"
          multiline
          value={text}
          onChangeText={setText}
          placeholder="Tell us what happened"
          placeholderTextColor={C.muted}
          style={s.area}
        />
        <ErrorText text={task.error} />
        <Btn
          label="Send report"
          loading={task.busy}
          onPress={() =>
            task.run(async () => {
              await reportIssue(b.id, reason != null ? REPORT_REASONS[reason] : null, text);
              setSheet(null);
              app.toast("Report sent. We'll message you shortly.");
            })
          }
        />
      </Sheet>
      <Sheet open={partAsk} onClose={() => app.update({ partAsk: false })}>
        <SheetTitle
          title={`${b.manong.first} needs a part`}
          sub="Approve it before it's added to your bill. Nothing changes unless you say yes."
        />
        <Grey>
          <Kv
            rows={[
              [part, peso(price)],
              [
                'Total with this part',
                peso(priceOf(b.category, b.serviceType, app.state.voucher, catalog) + price),
              ],
            ]}
          />
        </Grey>
        {[true, false].map((yes) => (
          <Btn
            key={String(yes)}
            kind={yes ? 'primary' : 'grey'}
            label={yes ? `Approve ${peso(price)}` : 'Decline'}
            onPress={async () => {
              const next = await answerPart(b, yes);
              app.update({ booking: next, partAsk: false });
              app.toast(
                yes
                  ? 'Part approved and added to your bill'
                  : 'Declined. Manong finishes the base repair only.',
              );
            }}
          />
        ))}
      </Sheet>
    </View>
  );
}

export function Pending({ app }: { app: App }) {
  const b = app.state.booking!; // opened only while a scheduled booking waits or is confirmed
  const conf = b.stage === 'confirmed';
  const f = b.manong.first;
  const [cancelling, setCancelling] = useState(false);
  const [calling, setCalling] = useState(false);
  const [reason, setReason] = useState<number | null>(null);
  const task = useTask();
  const steps = [
    ['Pending confirmation', 'Request sent today'],
    ['Confirmed', conf ? `${f} confirmed your booking` : `Waiting for ${f}`],
    ['In progress', `Starts ${dayLabel(b.day)} at ${b.time}`],
    ['Completed', 'You review charges and pay'],
  ];
  const cur = conf ? 1 : 0;
  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <Canopy
        title={conf ? 'Booking Confirmed' : 'Request Sent'}
        sub={
          conf ? `${f} will arrive ${weekday(b.day)} at ${b.time}.` : `Waiting for ${f} to confirm.`
        }
        pill={app.state.catalog[b.category].name}
        onBack={app.home}
        right={<DevMenu app={app} />}
      />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <Card accessibilityRole="list">
          {steps.map(([t, d], i) => (
            <View key={t} style={[s.step, i < steps.length - 1 && { paddingBottom: 16 }]}>
              {i < steps.length - 1 && (
                <View style={[s.rail, i < cur && { backgroundColor: C.success }]} />
              )}
              <View style={[s.node, i < cur && s.nodeDone, i === cur && s.nodeCur]} />
              <View style={{ flex: 1 }}>
                <T
                  w={i <= cur ? 700 : 500}
                  style={{ fontSize: 16, color: i <= cur ? C.ink : C.muted }}
                >
                  {t}
                </T>
                <Sub style={{ fontSize: 12 }}>{d}</Sub>
              </View>
            </View>
          ))}
        </Card>
        <Card>
          <Rows app={app} b={b} />
        </Card>
      </ScrollView>
      <Foot>
        {conf && (
          <Btn
            label={`Call ${f}`}
            icon={<Icon name="phone" size={18} color={C.white} />}
            onPress={() => setCalling(true)}
          />
        )}
        <Btn
          kind="grey"
          label="Cancel Request"
          icon={<Icon name="x" size={18} color={C.ink} />}
          onPress={() => setCancelling(true)}
        />
      </Foot>
      <CallScreen manong={b.manong} open={calling} close={() => setCalling(false)} />
      <Sheet open={cancelling} onClose={() => setCancelling(false)}>
        <SheetTitle
          title="Cancel this booking?"
          sub="It's free until your Manong starts the job. Tell us why (optional)."
        />
        {CANCEL_REASONS.map((r, i) => (
          <Opt
            key={r}
            title={r}
            on={reason === i}
            onPress={() => setReason(reason === i ? null : i)}
          />
        ))}
        <ErrorText text={task.error} />
        <Btn
          kind="white"
          label="Cancel booking"
          loading={task.busy}
          style={{ borderWidth: 1.5, borderColor: C.destructive }}
          onPress={() =>
            task.run(() =>
              cancelAndClose(
                app,
                b,
                reason != null ? CANCEL_REASONS[reason] : null,
                'Booking cancelled. No charge.',
              ),
            )
          }
        />
        <Btn kind="grey" label="Keep booking" onPress={() => setCancelling(false)} />
      </Sheet>
    </View>
  );
}

export function Declined({ app }: { app: App }) {
  const b = app.state.booking!; // opened only after the Manong declined
  const f = b.manong.first;
  const retry = (to: 'pick' | 'details') => {
    app.update((st) => ({
      booking: null,
      draft: {
        ...st.draft,
        category: b.category,
        serviceType: b.serviceType,
        manongKey: null,
        avoidKey: b.manong.key,
      },
    }));
    app.go(to, { reset: true });
  };
  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <Canopy
        title={`${f} Can't Take It`}
        sub="Your request is closed and you won't be charged."
        pill={app.state.catalog[b.category].name}
        onBack={app.home}
        right={<DevMenu app={app} />}
      />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <Card>
          <T style={{ fontSize: 15, lineHeight: 21, marginBottom: 12 }}>
            {f} couldn't make {dayLabel(b.day)} at {b.time}. Pick another Manong for the same time,
            or choose a different time.
          </T>
          <Rows app={app} b={b} />
        </Card>
      </ScrollView>
      <Foot>
        <Btn label="Find another Manong" onPress={() => retry('pick')} />
        <Btn kind="grey" label="Pick a new time" onPress={() => retry('details')} />
        <Btn
          kind="text"
          label="Cancel request"
          onPress={() => {
            app.update({ booking: null });
            app.home();
            app.toast('Request cancelled. No charge.');
          }}
        />
      </Foot>
    </View>
  );
}

/** Shares a plain-text e-receipt. TODO(backend): a PDF receipt from the server. */
const shareReceipt = async (app: App, lines: string[]) => {
  try {
    await Share.share({
      message: ['MANG JUAN E-RECEIPT', ...lines].join('\n'),
      title: 'Mang Juan e-receipt',
    });
  } catch {
    app.toast("Couldn't open the share sheet");
  }
};

export function Summary({ app }: { app: App }) {
  const b = app.state.booking!; // opened only when the job is done
  const { catalog, voucher, payment } = app.state;
  const tier = tierOf(app, b);
  const [stars, setStars] = useState(5);
  const [praise, setPraise] = useState<string[]>(['Arrived on time', 'Clean & thorough work']);
  const [review, setReview] = useState('');
  const [tip, setTip] = useState(50);
  const [custom, setCustom] = useState(false);
  const task = useTask();
  const total = totalOf(b, voucher, tip, catalog);
  const gcash = payment === 'gcash';
  const [part, partPrice] = catalog[b.category].part;
  const f = b.manong.first;
  const receiptLines = () =>
    [
      `Booking #${b.id}`,
      `${tier.name}: ${peso(tier.price)}`,
      b.partApproved ? `${part}: ${peso(partPrice)}` : '',
      voucher ? 'Voucher MANONG50: -₱50' : '',
      `Tip: ${peso(tip)}`,
      `Total: ${peso(total)}`,
      `Paid via ${gcash ? 'GCash' : 'Cash'}`,
      `Manong: ${b.manong.name}`,
    ].filter(Boolean);
  const submit = () =>
    task.run(async () => {
      await chargeTip(tip, payment);
      const past = await rateBooking(b, { stars, praise, review, tip }, payment, voucher, catalog);
      app.update((st) => ({
        past: [past, ...st.past],
        booking: null,
        thanks: { manong: b.manong, tierName: tier.name, stars, tip, total },
      }));
      app.go('thanks', { replace: true });
    });
  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <SafeAreaView edges={['top']} style={s.ahead}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close"
          onPress={app.home}
          style={{ width: 44, height: 44, justifyContent: 'center' }}
        >
          <Icon name="arrow-left" size={24} color={C.ink} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <Icon name="file-text" size={20} color={C.ink} />
            <T w={800} style={{ fontSize: 20 }}>
              Order Summary
            </T>
          </View>
          <Sub style={{ color: C.goldText }}>Service Completed • Invoice & Review</Sub>
        </View>
      </SafeAreaView>
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 12 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.statusPill}>
          <Icon name="check-circle" size={14} color={C.ink} />
          <T w={800} style={{ fontSize: 12, letterSpacing: 0.5 }}>
            SERVICE COMPLETED • {gcash ? 'GCASH PAID' : 'PAY IN CASH'}
          </T>
        </View>
        <Card>
          <View style={[s.between, { marginBottom: 14 }]}>
            <View style={s.rIc}>
              <Icon name="file-text" size={18} color={C.ink} />
            </View>
            <View style={{ flex: 1 }}>
              <T w={800}>Payment Summary</T>
              <Sub style={{ fontSize: 11 }}>Booking ID: #{b.id}</Sub>
            </View>
            <T w={800} style={{ fontSize: 20 }}>
              {peso(total)}.00
            </T>
          </View>
          <Kv
            rows={[
              ['Service Performed', tier.name],
              ['Base price', peso(tier.price)],
              ...(b.partApproved ? [[part, peso(partPrice)] as [string, string]] : []),
              ...(voucher ? [['Voucher MANONG50', '−₱50'] as [string, string]] : []),
              ['Tip', peso(tip)],
              ['Duration', '35 mins'],
              ['Location', b.address.short],
              [
                'Payment Method',
                <T key="pm" w={600} style={{ color: C.gcash, fontSize: 14 }}>
                  {gcash ? 'GCash (Paid Escrow)' : 'Cash on completion'}
                </T>,
              ],
            ]}
          />
          <Btn
            kind="text"
            label="Download Official E-Receipt"
            icon={<Icon name="download" size={16} color={C.slate} />}
            onPress={() => shareReceipt(app, receiptLines())}
          />
        </Card>
        <Card style={{ alignItems: 'center', gap: 6, paddingVertical: 20 }}>
          <Avatar manong={b.manong} size={80} />
          <T style={{ marginTop: 4 }}>{b.manong.name}</T>
          <Sub style={{ fontSize: 14 }}>
            {proOf(app, b)} • ★ <T w={800}>{b.manong.rating}</T> ({b.manong.jobs} jobs)
          </Sub>
          <T w={800} style={{ marginTop: 8 }}>
            How was Manong {f}'s service?
          </T>
          <View
            style={{ flexDirection: 'row', gap: 8, marginVertical: 6 }}
            accessibilityRole="radiogroup"
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable
                key={n}
                accessibilityRole="radio"
                accessibilityLabel={`${n} stars`}
                accessibilityState={{ checked: stars === n }}
                onPress={() => setStars(n)}
              >
                <FontAwesome name="star" size={38} color={n <= stars ? C.star : C.line} />
              </Pressable>
            ))}
          </View>
          <T w={800} style={{ color: '#7a5a00' }}>
            {STARS[stars]}
          </T>
        </Card>
        <Card style={{ gap: 12 }}>
          <View style={s.between}>
            <T w={800}>{stars >= 4 ? 'What did he do well?' : 'What could be better?'}</T>
            <Sub style={{ fontSize: 12 }}>Select all that apply</Sub>
          </View>
          <Chips>
            {PRAISE.map(([e, l]) => (
              <Chip
                key={l}
                tone="mango"
                label={`${e} ${l}`}
                on={praise.includes(l)}
                onPress={() =>
                  setPraise(praise.includes(l) ? praise.filter((x) => x !== l) : [...praise, l])
                }
              />
            ))}
          </Chips>
          <TextInput
            accessibilityLabel="Review"
            multiline
            value={review}
            onChangeText={setReview}
            placeholder={`Tell us more about Manong ${f}'s service (optional).`}
            placeholderTextColor={C.muted}
            style={s.area}
          />
        </Card>
        <Card style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <Icon name="gift" size={20} color="#7a5a00" />
            <T w={800} style={{ fontSize: 17 }}>
              Pa-Tip kay Manong {f}?
            </T>
          </View>
          <Sub>
            100% of your tip goes directly to your Manong's personal{' '}
            {gcash ? 'GCash wallet' : 'pocket'}.
          </Sub>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[0, 20, 50, 100].map((v) => {
              const on = !custom && tip === v;
              return (
                <Pressable
                  key={v}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: on }}
                  onPress={() => {
                    setCustom(false);
                    setTip(v);
                  }}
                  style={[s.tipBtn, on && { backgroundColor: C.ink }]}
                >
                  {v === 50 && (
                    <View style={s.pop}>
                      <T w={800} style={{ fontSize: 8 }}>
                        POPULAR
                      </T>
                    </View>
                  )}
                  <T w={700} style={{ color: on ? C.white : C.ink, fontSize: 14 }}>
                    {v ? `+${peso(v)}` : 'No Tip'}
                  </T>
                </Pressable>
              );
            })}
          </View>
          {custom && (
            <TextInput
              accessibilityLabel="Custom tip"
              keyboardType="number-pad"
              value={tip ? String(tip) : ''}
              onChangeText={(v) => setTip(Math.min(5000, Number(v.replace(/\D/g, '')) || 0))}
              placeholder="Enter tip amount"
              placeholderTextColor={C.muted}
              style={[s.area, { minHeight: 48 }]}
            />
          )}
          <View
            style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 }}
          >
            <Sub style={{ fontSize: 12 }}>Tip will be charged to {gcash ? 'GCash' : 'Cash'}</Sub>
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                if (custom) setTip(50);
                setCustom(!custom);
              }}
            >
              <T w={600} style={{ color: C.gcash, fontSize: 12 }}>
                {custom ? 'Use presets' : 'Custom amount'}
              </T>
            </Pressable>
          </View>
        </Card>
        <ErrorText text={task.error} />
        <Btn
          label="Submit Rating & Done"
          loading={task.busy}
          icon={<Icon name="arrow-right" size={20} color={C.white} />}
          style={{ flexDirection: 'row-reverse' }}
          onPress={submit}
        />
        <Btn kind="text" label="Skip for now" onPress={app.home} />
      </ScrollView>
    </View>
  );
}

export function Thanks({ app }: { app: App }) {
  const t = app.state.thanks!; // opened right after submitting a rating
  const first = app.state.user.name.split(' ')[0];
  return (
    <View style={{ flex: 1, backgroundColor: C.mango }}>
      <SafeAreaView
        edges={['top']}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      >
        <View style={s.illo}>
          <Image
            source={IMG.illo}
            style={{ width: 150, height: 150 }}
            resizeMode="contain"
            accessibilityIgnoresInvertColors
          />
        </View>
      </SafeAreaView>
      <SafeAreaView edges={['bottom']} style={s.thx}>
        <T w={800} style={{ fontSize: 12, color: C.gold, letterSpacing: 1 }}>
          JOB COMPLETE
        </T>
        <T w={800} style={{ fontSize: 28 }}>
          Salamat, {first}
        </T>
        <Sub style={{ fontSize: 15, lineHeight: 21 }}>
          {t.manong.first} finished your {t.tierName.toLowerCase()} job. We sent the receipt to{' '}
          {app.state.user.email}.
        </Sub>
        <Kv
          rows={[
            ['Manong', t.manong.name],
            ['Your rating', '★'.repeat(t.stars)],
            ...(t.tip ? [['Tip', peso(t.tip)] as [string, string]] : []),
            [
              'Total paid',
              <T key="tp" w={800}>
                {peso(t.total)}
              </T>,
            ],
          ]}
        />
        <Btn label="Back to home" onPress={app.home} />
        <Btn
          kind="text"
          label="Download e-receipt"
          icon={<Icon name="download" size={16} color={C.slate} />}
          onPress={() =>
            shareReceipt(app, [
              `${t.tierName}`,
              `Manong: ${t.manong.name}`,
              `Tip: ${peso(t.tip)}`,
              `Total: ${peso(t.total)}`,
            ])
          }
        />
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  dev: {
    borderWidth: 1.5,
    borderColor: C.ink,
    borderRadius: R.full,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minHeight: 32,
    justifyContent: 'center',
  },
  between: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  lrow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  foot: { paddingHorizontal: 16, paddingTop: 10, gap: 10, backgroundColor: C.paper },
  bsheet: {
    flex: 1,
    marginTop: -20,
    backgroundColor: C.white,
    borderTopLeftRadius: R.sheet,
    borderTopRightRadius: R.sheet,
    paddingHorizontal: 16,
    paddingTop: 8,
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
  eta: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    backgroundColor: C.mangoSoft,
    borderRadius: R.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  tip: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: C.mangoPale,
    borderRadius: R.control,
    padding: 12,
    borderWidth: 1,
    borderColor: C.mangoSoft,
  },
  small: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    backgroundColor: C.mango,
    borderRadius: 17,
    height: 34,
    paddingHorizontal: 14,
  },
  area: {
    backgroundColor: C.cloud,
    borderRadius: R.control,
    padding: 14,
    minHeight: 80,
    fontSize: 15,
    color: C.ink,
    textAlignVertical: 'top',
  },
  step: { flexDirection: 'row', gap: 12 },
  rail: { position: 'absolute', left: 8, top: 22, bottom: 0, width: 2, backgroundColor: '#ddd' },
  node: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#ccc',
    backgroundColor: C.white,
    marginTop: 2,
  },
  nodeDone: { backgroundColor: C.success, borderColor: C.success },
  nodeCur: { backgroundColor: C.mango, borderColor: C.mango },
  ahead: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.mango,
    paddingHorizontal: 12,
    paddingBottom: 14,
    borderBottomLeftRadius: R.canopy,
    borderBottomRightRadius: R.canopy,
  },
  statusPill: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: C.mangoSoft,
    borderRadius: R.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  rIc: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.grey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tipBtn: {
    flex: 1,
    height: 44,
    borderRadius: R.full,
    backgroundColor: C.grey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pop: {
    position: 'absolute',
    top: -9,
    backgroundColor: C.mango,
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  illo: {
    width: 200,
    height: 200,
    backgroundColor: C.white,
    borderRadius: R.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thx: {
    backgroundColor: C.white,
    borderTopLeftRadius: R.canopy,
    borderTopRightRadius: R.canopy,
    padding: 24,
    gap: 12,
  },
});
