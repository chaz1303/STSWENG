// Flow 4 tab pages: Home, Bookings, Messages, Account, and Notifications.
import { useState, type ReactNode } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CLARISO, RECENT_JOBS } from '../mocks/account';
import { whenText } from '../services/bookings';
import { C, FI, R, SHADOW, peso } from '../theme';
import {
  Avatar,
  Btn,
  Icon,
  IMG,
  InterScope,
  StatusChip,
  Strip,
  Sub,
  T,
  TabBar,
  Top,
  type Tab,
} from '../ui';
import type { App, Booking, PastBooking } from '../types';
import {
  AddressSheet,
  AlertsSheet,
  JobSheet,
  PaySheet,
  ReceiptSheet,
  VoucherSheet,
} from './Account';
import { DevMenu } from './After';
import { ChatSheet } from './Manong';

/** The strip's two lines for each status (prototype stF). */
export function stripText(b: Booking, eta: number, tierName: string): [string, string] {
  const f = b.manong.first;
  switch (b.stage) {
    case 'finding':
      return ['Finding your Manong', `${tierName} • Now`];
    case 'pending':
      return [`Waiting for ${f} to confirm`, whenText(b)];
    case 'confirmed':
      return [`${f} confirmed`, whenText(b)];
    case 'declined':
      return [`${f} can't take it`, 'Tap to choose another Manong'];
    case 'onway':
      return [`${f} is on the way`, `About ${eta} mins away`];
    case 'arrived':
      return [`${f} has arrived`, 'Meet at the lobby'];
    case 'done':
      return ['Job done', 'Review and pay'];
  }
}

/** The Mang Juan wordmark at the top of the tab pages, as on the Var3 home. */
const Logo = () => (
  <Image
    source={IMG.wordmark}
    style={{ width: 154, height: 36 }}
    accessibilityRole="header"
    accessibilityLabel="Mang Juan"
  />
);

/** A tab page: content, then the active-booking strip, then the tab bar. */
function TabPage({ app, on, children }: { app: App; on: Tab; children: ReactNode }) {
  const b = app.state.booking;
  const go = (tab: Tab) => (tab === 'home' ? app.home() : app.go(tab, { reset: true }));
  return (
    <InterScope>
      <View style={{ flex: 1, backgroundColor: on === 'home' ? C.white : C.paper }}>
        <View style={{ flex: 1 }}>{children}</View>
        {b && <Strip manong={b.manong} {...toStrip(app, b)} onPress={() => app.openBooking()} />}
        <TabBar on={on} go={go} dot={!!b} />
      </View>
    </InterScope>
  );
}
const toStrip = (app: App, b: Booking) => {
  const [title, sub] = stripText(
    b,
    app.state.eta,
    app.state.catalog[b.category].tiers[b.serviceType].name,
  );
  return { title, sub };
};

export function Home({ app }: { app: App }) {
  const { catalog, addresses, addressIdx, notifications, past } = app.state;
  const [q, setQ] = useState('');
  const [sheet, setSheet] = useState<'address' | null>(null);
  const [job, setJob] = useState<(typeof RECENT_JOBS)[number] | null>(null);
  const a = addresses[addressIdx];
  const unread = notifications.some((n) => n.unread);
  const list = Object.entries(catalog).filter(
    ([, c]) => !q.trim() || c.label.toLowerCase().includes(q.trim().toLowerCase()),
  );
  const last = past[0];
  return (
    <TabPage app={app} on="home">
      <SafeAreaView edges={['top']} style={s.hh}>
        <View style={s.row}>
          <Logo />
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
        <View style={[s.row, { marginTop: 12 }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              a
                ? `Service address: ${a.short}, ${a.title.split(',')[0]}. Tap to change`
                : 'Add a service address'
            }
            onPress={() => setSheet('address')}
            style={[s.row, { flex: 1, gap: 8 }]}
          >
            <Icon name="map-pin" size={20} color={C.ink} />
            <View style={{ flex: 1 }}>
              <T style={{ fontSize: 11, color: C.goldText }}>Service address</T>
              <T w={800} numberOfLines={1} style={{ fontSize: 15 }}>
                {a ? `${a.short}, ${a.title.split(',')[0]}` : 'Add your address'}
              </T>
            </View>
            <Icon name="chevron-down" size={18} color={C.ink} />
          </Pressable>
        </View>
      </SafeAreaView>
      <View style={s.search}>
        <Icon name="search" size={20} color={C.ink} />
        <TextInput
          accessibilityLabel="Search services"
          value={q}
          onChangeText={setQ}
          placeholder="What needs fixing?"
          placeholderTextColor={C.muted}
          style={s.searchIn}
        />
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 8, gap: 12 }}>
        <T w={800} style={s.h}>
          Services
        </T>
        {list.length ? (
          <View style={s.list}>
            {list.map(([k, c], i) => (
              <Pressable
                key={k}
                accessibilityRole="button"
                onPress={() => app.startBooking(k)}
                style={[s.svc, i > 0 && s.divider]}
              >
                <Icon name={c.icon} size={24} color={C.ink} />
                <View style={{ flex: 1 }}>
                  <T w={700} style={{ fontSize: 16 }}>
                    {c.label}
                  </T>
                  <Sub>{c.blurb}</Sub>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Sub style={{ fontSize: 11 }}>from</Sub>
                  <T w={800}>{peso(c.tiers.CHECKUP.price)}</T>
                </View>
                <Icon name="chevron-right" size={18} color="#aaa" />
              </Pressable>
            ))}
          </View>
        ) : (
          <Sub style={{ textAlign: 'center', padding: 20 }}>No service matches "{q}"</Sub>
        )}
        {last && !q.trim() && (
          <>
            <T w={800} style={s.h}>
              Book again
            </T>
            <View style={[s.list, s.svc]}>
              <Avatar manong={last.manong} />
              <View style={{ flex: 1 }}>
                <T w={700} style={{ fontSize: 16 }}>
                  {last.manong.name}
                </T>
                <Sub>
                  {catalog[last.category].name} • {last.date}
                </Sub>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Book ${last.manong.first} again`}
                onPress={() => {
                  app.startBooking(last.category, {
                    manongKey: last.manong.key,
                    serviceType: last.serviceType,
                  });
                  if (!app.state.booking) app.toast(`Requesting ${last.manong.first} again`);
                }}
                style={s.bookPill}
              >
                <T w={700} style={{ fontSize: 13 }}>
                  Book
                </T>
              </Pressable>
            </View>
          </>
        )}
        {!q.trim() && (
          <>
            <T w={800} style={s.h}>
              Recent jobs in your building
            </T>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {RECENT_JOBS.map((j) => (
                <Pressable
                  key={j.title}
                  accessibilityRole="button"
                  onPress={() => setJob(j)}
                  style={s.job}
                >
                  <Image
                    source={IMG[j.photo]}
                    style={s.jobImg}
                    resizeMode="cover"
                    accessibilityIgnoresInvertColors
                  />
                  <T w={700} numberOfLines={1}>
                    {j.title}
                  </T>
                  <Sub style={{ fontSize: 12 }}>{j.sub}</Sub>
                </Pressable>
              ))}
            </View>
          </>
        )}
      </ScrollView>
      <AddressSheet app={app} open={sheet === 'address'} close={() => setSheet(null)} />
      <JobSheet job={job} close={() => setJob(null)} />
    </TabPage>
  );
}

export function Bookings({ app }: { app: App }) {
  const { booking: b, past, catalog } = app.state;
  const [tab, setTab] = useState<'active' | 'past'>('active');
  const [receipt, setReceipt] = useState<PastBooking | null>(null);
  const title = (category: string, serviceType: Booking['serviceType']) =>
    `${catalog[category].name}, ${catalog[category].tiers[serviceType].name.toLowerCase()}`;
  return (
    <TabPage app={app} on="bookings">
      <Top title="Bookings" />
      <View style={s.seg} accessibilityRole="tablist">
        {(
          [
            ['active', 'Active'],
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
      <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
        {tab === 'active' ? (
          b ? (
            <Pressable accessibilityRole="button" onPress={() => app.openBooking()} style={s.row2}>
              <Avatar manong={b.manong} />
              <View style={{ flex: 1, gap: 2 }}>
                <T w={700}>{title(b.category, b.serviceType)}</T>
                <Sub>{whenText(b)}</Sub>
                <View style={{ alignSelf: 'flex-start', marginTop: 4 }}>
                  <StatusChip stage={b.stage} />
                </View>
              </View>
              <Icon name="chevron-right" size={18} color="#aaa" />
            </Pressable>
          ) : (
            <View style={{ alignItems: 'center', gap: 8, paddingTop: 30 }}>
              <Image source={IMG.illo} style={{ width: 140, height: 140 }} resizeMode="contain" />
              <T w={800} style={{ fontSize: 18 }}>
                Nothing booked yet
              </T>
              <Sub style={{ fontSize: 14 }}>Your active Manong jobs will show up here.</Sub>
              <Btn
                label="Book a Manong"
                onPress={app.home}
                style={{ alignSelf: 'stretch', marginTop: 8 }}
              />
            </View>
          )
        ) : (
          past.map((p) => (
            <Pressable
              key={p.id}
              accessibilityRole="button"
              onPress={() => setReceipt(p)}
              style={s.row2}
            >
              <Avatar manong={p.manong} />
              <View style={{ flex: 1 }}>
                <T w={700}>{title(p.category, p.serviceType)}</T>
                <Sub>
                  {p.date} • {p.manong.name}
                </Sub>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <T w={800}>{peso(p.total)}</T>
                <Sub style={{ fontSize: 11 }}>Paid</Sub>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
      <ReceiptSheet app={app} past={receipt} close={() => setReceipt(null)} />
    </TabPage>
  );
}

export function Messages({ app }: { app: App }) {
  const { booking, past, chat } = app.state;
  const m = booking?.manong ?? past[0]?.manong ?? CLARISO;
  const [open, setOpen] = useState(false);
  return (
    <TabPage app={app} on="messages">
      <Top title="Messages" />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
        <Pressable accessibilityRole="button" onPress={() => setOpen(true)} style={s.row2}>
          <Avatar manong={m} size={48} />
          <View style={{ flex: 1 }}>
            <T w={700}>{m.name}</T>
            <Sub numberOfLines={2}>{chat[chat.length - 1]?.text.replace('Clariso', m.first)}</Sub>
          </View>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          onPress={() => app.toast('Mang Juan support replies within 5 minutes')}
          style={s.row2}
        >
          <Image
            source={IMG.badge}
            style={{ width: 48, height: 48, borderRadius: 24 }}
            resizeMode="contain"
            accessibilityLabel="Mang Juan"
          />
          <View style={{ flex: 1 }}>
            <T w={700}>Mang Juan Support</T>
            <Sub>How can we help you today?</Sub>
          </View>
        </Pressable>
      </ScrollView>
      <ChatSheet app={app} manong={m} open={open} close={() => setOpen(false)} />
    </TabPage>
  );
}

export function Account({ app }: { app: App }) {
  const { user, addresses, payment, voucher, past, booking } = app.state;
  const [sheet, setSheet] = useState<'address' | 'pay' | 'voucher' | 'alerts' | null>(null);
  const jobs = past.length + (booking ? 1 : 0);
  const tile = (
    icon: 'map-pin' | 'credit-card' | 'tag' | 'file-text',
    label: string,
    val: string,
    onPress: () => void,
  ) => (
    <Pressable key={label} accessibilityRole="button" onPress={onPress} style={s.tile}>
      <Icon name={icon} size={26} color={C.ink} />
      <View>
        <T w={800} style={{ fontSize: 16 }}>
          {label}
        </T>
        <Sub style={{ fontSize: 12.5, color: C.muted }}>{val}</Sub>
      </View>
    </Pressable>
  );
  const line = (label: string, onPress: () => void, val?: string) => (
    <Pressable key={label} accessibilityRole="button" onPress={onPress} style={s.line}>
      <T style={{ flex: 1, fontSize: 16 }}>{label}</T>
      {!!val && <Sub style={{ fontSize: 14 }}>{val}</Sub>}
      <Icon name="chevron-right" size={18} color="#aaa" />
    </Pressable>
  );
  return (
    <TabPage app={app} on="account">
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <SafeAreaView edges={['top']} style={s.me}>
          <Logo />
          <View style={[s.row, { gap: 14, marginTop: 14 }]}>
            <View style={s.meAv}>
              <T w={800} style={{ color: C.white, fontSize: 20 }}>
                {user.initials}
              </T>
            </View>
            <View style={{ flex: 1 }}>
              <T w={800} style={{ fontSize: 22 }}>
                {user.name}
              </T>
              <T style={{ fontSize: 13, color: C.goldText }}>
                {user.phone} · {user.email}
              </T>
            </View>
            <Pressable
              accessibilityRole="button"
              onPress={() => app.toast('Profile editing is coming soon')}
              style={s.edit}
            >
              <T w={700}>Edit</T>
            </Pressable>
          </View>
        </SafeAreaView>
        <View style={{ padding: 16, gap: 12 }}>
          <View style={s.tiles}>
            {tile('map-pin', 'Addresses', `${addresses.length} saved`, () => setSheet('address'))}
            {tile('credit-card', 'Payment', payment === 'gcash' ? 'GCash' : 'Cash', () =>
              setSheet('pay'),
            )}
            {tile('tag', 'Vouchers', voucher ? '1 available' : 'None yet', () =>
              setSheet('voucher'),
            )}
            {tile('file-text', 'Bookings', `${jobs} job${jobs === 1 ? '' : 's'}`, () =>
              app.go('bookings', { reset: true }),
            )}
          </View>
          <Pressable
            accessibilityRole="button"
            onPress={() => app.toast('Invite a neighbor: share your code MANONG50')}
            style={s.promo}
          >
            <View style={{ flex: 1 }}>
              <T style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12 }}>Invite a neighbor</T>
              <T w={800} style={{ color: C.white, fontSize: 17 }}>
                Both get ₱50 off
              </T>
            </View>
            <View style={s.code}>
              <T w={800} style={{ color: C.mango, letterSpacing: 1 }}>
                MANONG50
              </T>
            </View>
          </Pressable>
          <T w={700} style={s.cap}>
            SETTINGS
          </T>
          <View style={s.list}>
            {line('Notifications', () => setSheet('alerts'))}
            {line('Language', () => app.toast('English is the only language for now'), 'English')}
          </View>
          <T w={700} style={s.cap}>
            SUPPORT
          </T>
          <View style={s.list}>
            {line('Help and support', () =>
              app.toast('Mang Juan support replies within 5 minutes'),
            )}
            {line('Terms and privacy', () => app.toast('Terms and privacy open in your browser'))}
          </View>
          <Btn
            kind="white"
            label="Log out"
            onPress={app.logOut}
            style={{ borderWidth: 1.5, borderColor: C.line }}
          />
          <Sub style={{ textAlign: 'center', fontSize: 12, color: '#999' }}>Mang Juan v0.5</Sub>
        </View>
      </ScrollView>
      <AddressSheet app={app} open={sheet === 'address'} close={() => setSheet(null)} />
      <PaySheet app={app} open={sheet === 'pay'} close={() => setSheet(null)} />
      <VoucherSheet app={app} open={sheet === 'voucher'} close={() => setSheet(null)} />
      <AlertsSheet app={app} open={sheet === 'alerts'} close={() => setSheet(null)} />
    </TabPage>
  );
}

export function Notifications({ app }: { app: App }) {
  const { notifications } = app.state;
  const unread = notifications.some((n) => n.unread);
  const open = (i: number) => {
    const n = notifications[i];
    app.update({
      notifications: notifications.map((x, j) => (j === i ? { ...x, unread: false } : x)),
    });
    if (n.act === 'bookings') app.go('bookings', { reset: true });
    else app.home();
  };
  return (
    <InterScope>
      <View style={{ flex: 1, backgroundColor: C.paper }}>
        <Top
          title="Notifications"
          onBack={app.back}
          right={
            unread ? (
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  app.update({ notifications: notifications.map((n) => ({ ...n, unread: false })) })
                }
                style={{ padding: 8 }}
              >
                <T w={700} style={{ fontSize: 14, textDecorationLine: 'underline' }}>
                  Mark all read
                </T>
              </Pressable>
            ) : null
          }
        />
        <ScrollView contentContainerStyle={{ padding: 16, gap: 8 }}>
          {!notifications.length && <Sub>No notifications yet.</Sub>}
          {(['Today', 'Earlier'] as const).map((g) =>
            notifications.some((n) => n.group === g) ? (
              <View key={g} style={{ gap: 8 }}>
                <T w={700} style={s.cap}>
                  {g.toUpperCase()}
                </T>
                <View style={s.list}>
                  {notifications.map((n, i) =>
                    n.group === g ? (
                      <Pressable
                        key={i}
                        accessibilityRole="button"
                        accessibilityLabel={`${n.unread ? 'Unread: ' : ''}${n.text}`}
                        onPress={() => open(i)}
                        style={[s.line, { gap: 10 }]}
                      >
                        <View style={[s.ndot, !n.unread && { opacity: 0 }]} />
                        <View style={{ flex: 1 }}>
                          <T w={700}>{n.text}</T>
                          <Sub>{n.time}</Sub>
                        </View>
                        <Icon name="chevron-right" size={18} color="#aaa" />
                      </Pressable>
                    ) : null,
                  )}
                </View>
              </View>
            ) : null,
          )}
        </ScrollView>
      </View>
    </InterScope>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  hh: {
    backgroundColor: C.mango,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 36,
    borderBottomLeftRadius: R.canopy,
    borderBottomRightRadius: R.canopy,
  },
  bell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: C.mangoSoft,
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
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: -26,
    marginHorizontal: 16,
    paddingHorizontal: 16,
    height: 52,
    borderRadius: R.full,
    backgroundColor: C.white,
    ...SHADOW.card,
  },
  searchIn: { flex: 1, fontFamily: FI[400], fontSize: 16, color: C.ink, height: 52 },
  h: { fontSize: 20, marginTop: 8 },
  list: {
    backgroundColor: C.white,
    borderRadius: R.card,
    borderWidth: 1,
    borderColor: C.grey,
    overflow: 'hidden',
  },
  svc: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, minHeight: 64 },
  divider: { borderTopWidth: 1, borderTopColor: C.grey },
  bookPill: {
    backgroundColor: C.mango,
    borderRadius: R.full,
    paddingHorizontal: 18,
    paddingVertical: 8,
    minHeight: 36,
    justifyContent: 'center',
  },
  job: { flex: 1, gap: 4 },
  jobImg: { width: '100%', aspectRatio: 1.4, borderRadius: R.tile, marginBottom: 4 },
  seg: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: C.grey,
    borderRadius: R.full,
    padding: 4,
  },
  segBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: R.full },
  segOn: { backgroundColor: C.white },
  row2: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.white,
    borderRadius: R.card,
    padding: 14,
    borderWidth: 1,
    borderColor: C.grey,
  },
  me: {
    backgroundColor: C.mango,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 22,
    borderBottomLeftRadius: R.canopy,
    borderBottomRightRadius: R.canopy,
  },
  meAv: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: C.goldText,
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
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: {
    width: '47%',
    flexGrow: 1,
    minHeight: 104,
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: C.line,
    borderRadius: R.card,
  },
  promo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.ink,
    borderRadius: R.card,
    padding: 16,
  },
  code: {
    borderWidth: 1.5,
    borderColor: C.mango,
    borderRadius: R.stamp,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  cap: { fontSize: 12, color: C.muted, letterSpacing: 1, marginTop: 8 },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 52,
    borderBottomWidth: 1,
    borderBottomColor: C.grey,
  },
  ndot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.unread },
});
