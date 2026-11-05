import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { tierOf } from '../services/bookings';
import { C, R, SHADOW } from '../theme';
import { Avatar, Icon, Note, Ring, Screen, Header, Sub, T, TabBar, type Tab } from '../ui';
import type { App, Booking } from '../types';
import { bookedWhen } from './Book';
import { DevMenu } from './After';

export const goTab = (app: App) => (tab: Tab) =>
  app.go(tab === 'home' ? 'home' : tab, { replace: true });

export const addressLine = (a?: { unit: string; bldg: string }) =>
  a ? [a.unit, a.bldg].filter(Boolean).join(', ') : '';

/** Opens the booking at the screen that fits its status. */
export const openBooking = (app: App) =>
  app.go(app.state.booking?.stage === 'completed' ? 'charges' : 'status');

function whoLine(b: Booking): [string, string] {
  const m = b.manong.first;
  const now = b.bookingType === 'on-demand';
  switch (b.stage) {
    case 'confirmed':
      return [`${m} is booked`, now ? "Today, we'll tell you when he heads out" : bookedWhen(b)];
    case 'onway':
      return [`${m} is on the way`, 'On his way, 6 km away'];
    case 'late':
      return [`${m} is running late`, "We'll tell you when he's close"];
    case 'inprogress':
      return [`${m} is working on it`, 'Started 10:32 AM'];
    case 'completed':
      return [`${m} finished the job`, 'Check the charges and pay'];
    case 'mcancelled':
      return [`${m} had to cancel`, 'Choose what to do next'];
    default:
      return [`${m} is booked`, bookedWhen(b)];
  }
}

export function Home({ app }: { app: App }) {
  const {
    catalog,
    addresses,
    addressIdx,
    booking: b,
    notifications,
    past,
    pendingReview,
  } = app.state;
  const unread = notifications.some((n) => n.unread);
  const again = past.find((p) => p.status === 'paid' && p.manong);
  const a = addresses[addressIdx];
  let card;
  if (b) {
    const [l1, l2] = whoLine(b);
    card = (
      <Pressable accessibilityRole="button" onPress={() => openBooking(app)} style={s.card}>
        <T w={700} style={{ fontSize: 17 }}>
          {catalog[b.category].name}
        </T>
        <Sub style={{ fontSize: 13 }}>
          {tierOf(b, catalog).name}, {b.problem.toLowerCase()}
        </Sub>
        <View style={{ marginTop: 12 }}>
          <Ring stage={b.stage} accepted={b.bookingType === 'on-demand'} />
        </View>
        <View style={s.tear} />
        <View style={s.row}>
          <Avatar initial={b.manong.initial} />
          <View style={{ flex: 1 }}>
            <T w={600}>{l1}</T>
            <Sub style={{ fontSize: 13 }}>{l2}</Sub>
          </View>
          <Icon name="chevron-right" size={20} color={C.ink} />
        </View>
      </Pressable>
    );
  } else if (pendingReview) {
    card = (
      <Pressable
        accessibilityRole="button"
        onPress={() => app.go('review')}
        style={[s.card, s.row]}
      >
        <View style={{ flex: 1 }}>
          <T w={700}>A Manong is free</T>
          <Sub style={{ fontSize: 13 }}>Tap to review and confirm.</Sub>
        </View>
        <View style={s.go}>
          <Icon name="arrow-right" size={20} color={C.ink} />
        </View>
      </Pressable>
    );
  } else {
    card = (
      <View style={[s.card, s.row]}>
        <View style={{ flex: 1 }}>
          <T w={700}>Nothing booked yet</T>
          <Sub style={{ fontSize: 13 }}>Tell us what needs fixing.</Sub>
        </View>
        <Image
          source={require('../assets/illo-manong.png')}
          style={{ width: 64, height: 64 }}
          resizeMode="contain"
        />
      </View>
    );
  }
  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <SafeAreaView edges={['top']} style={s.band}>
          <View style={s.top}>
            <Image
              source={require('../assets/wordmark.png')}
              style={{ width: 154, height: 36 }}
              accessibilityLabel="Mang Juan"
            />
            <View style={{ flex: 1 }} />
            <DevMenu app={app} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={unread ? 'Notifications, unread' : 'Notifications'}
              onPress={() => app.go('notifications')}
              style={s.bell}
            >
              <Icon name="bell" size={20} color={C.ink} />
              {unread && <View style={s.dot} />}
            </Pressable>
          </View>
          <Pressable accessibilityRole="button" onPress={() => app.go('addrpick')} style={s.unit}>
            <Icon name="map-pin" size={16} color={C.ink} />
            <T w={500} numberOfLines={1} style={{ flex: 1, fontSize: 13 }}>
              {a ? addressLine(a) : 'Add your address'}
            </T>
            <Icon name="chevron-right" size={16} color={C.ink} />
          </Pressable>
          {card}
        </SafeAreaView>
        <View style={{ padding: 20, gap: 14 }}>
          <T w={700} style={{ fontSize: 20 }}>
            What needs fixing?
          </T>
          <View style={s.grid}>
            {Object.entries(catalog).map(([k, c]) => (
              <Pressable
                key={k}
                accessibilityRole="button"
                onPress={() => app.startBooking(k)}
                style={s.tile}
              >
                <View style={s.disc}>
                  <Icon name={c.icon} size={18} color={C.ink} />
                </View>
                <T w={500} style={{ fontSize: 14 }}>
                  {c.name}
                </T>
              </Pressable>
            ))}
          </View>
          {again?.manong ? (
            <>
              <T w={700} style={{ fontSize: 17, marginTop: 6 }}>
                Book again
              </T>
              <View style={[s.card, s.row, { borderWidth: 1, borderColor: C.cloud }]}>
                <Avatar initial={again.manong.initial} />
                <View style={{ flex: 1 }}>
                  <T w={600}>{again.manong.name}</T>
                  <Sub style={{ fontSize: 13 }}>
                    {catalog[again.category].name} on {again.date.split(', ')[1]}
                  </Sub>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Book ${again.manong.first} again`}
                  onPress={() => app.startBooking(again.category, again.manong)}
                  style={s.pill}
                >
                  <T w={600}>Book</T>
                </Pressable>
              </View>
            </>
          ) : (
            <Note
              icon="shield"
              text="Every Manong is ID-verified, and you only pay once the job is done."
            />
          )}
        </View>
      </ScrollView>
      <TabBar on="home" go={goTab(app)} />
    </View>
  );
}

export function Notifications({ app }: { app: App }) {
  const { notifications, booking, past } = app.state;
  const open = (i: number) => {
    const n = notifications[i];
    app.update({
      notifications: notifications.map((x, j) => (j === i ? { ...x, unread: false } : x)),
    });
    if (n.act === 'status')
      return booking ? openBooking(app) : app.toast('That booking is no longer active');
    if (n.act === 'receipt') {
      const idx = past.findIndex((p) => p.status === 'paid');
      if (idx >= 0) {
        app.update({ receiptIdx: idx });
        return app.go('receipt');
      }
    }
    if (n.act === 'review' && app.state.pendingReview) return app.go('review');
    if (n.act === 'cleaning') app.startBooking('cleaning');
  };
  return (
    <Screen header={<Header title="Notifications" onBack={app.back} />}>
      {!notifications.length && <Sub>No notifications yet.</Sub>}
      {notifications.map((n, i) => (
        <View key={i} style={{ gap: 8 }}>
          {n.group !== notifications[i - 1]?.group && (
            <T w={600} style={{ fontSize: 13, color: C.slate, marginTop: 8 }}>
              {n.group}
            </T>
          )}
          <Pressable
            accessibilityRole="button"
            onPress={() => open(i)}
            style={[s.notif, n.unread && { backgroundColor: C.mangoPale }]}
          >
            <View style={s.sq}>
              <Icon name={n.icon} size={18} color={C.ink} />
            </View>
            <T style={{ flex: 1, fontSize: 14, lineHeight: 20 }}>{n.text}</T>
            <View style={{ alignItems: 'flex-end', gap: 6 }}>
              <Sub style={{ fontSize: 12 }}>{n.time}</Sub>
              {n.unread && (
                <View
                  style={[s.dot, { position: 'relative', top: 0, right: 0 }]}
                  accessibilityLabel="Unread"
                />
              )}
            </View>
          </Pressable>
        </View>
      ))}
    </Screen>
  );
}

const s = StyleSheet.create({
  band: {
    backgroundColor: C.mango,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 14,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  top: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: {
    position: 'absolute',
    top: 10,
    right: 11,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: C.unread,
  },
  unit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.mangoSoft,
    borderRadius: R.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: 44,
  },
  card: { backgroundColor: C.white, borderRadius: R.card, padding: 16, ...SHADOW.ticket },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tear: { height: 1, backgroundColor: C.cloud, marginVertical: 14 },
  go: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.mango,
    alignItems: 'center',
    justifyContent: 'center',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: {
    width: '31%',
    aspectRatio: 1.05,
    backgroundColor: C.white,
    borderRadius: R.tile,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  disc: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: C.mangoSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    borderWidth: 1.5,
    borderColor: C.ink,
    borderRadius: R.full,
    paddingHorizontal: 18,
    paddingVertical: 8,
    minHeight: 40,
    justifyContent: 'center',
  },
  notif: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.white,
    borderRadius: R.card,
    padding: 14,
  },
  sq: {
    width: 40,
    height: 40,
    borderRadius: R.control,
    backgroundColor: C.mangoSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
