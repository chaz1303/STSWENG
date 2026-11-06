// Flow 4 booking: choose service, tell Manong what happened (with Now or Schedule), choose your Manong.
import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DURATION } from '../mocks/catalog';
import { dateIn, dayLabel, priceOf, requestBooking, weekday, whenText } from '../services/bookings';
import { getRoster, isFree } from '../services/manongs';
import { C, R, SHADOW, peso } from '../theme';
import {
  Avatar,
  Box,
  Btn,
  Canopy,
  Card,
  Chip,
  Chips,
  ErrorText,
  Icon,
  IMG,
  Kv,
  Loader,
  MapView,
  SectionTitle,
  Sub,
  T,
} from '../ui';
import { useTask } from '../useTask';
import type { App, RosterEntry, ServiceType } from '../types';
import { AddressSheet, GcashMark, PaySheet, VoucherSheet } from './Account';

const TIMES = ['9:00 AM', '10:30 AM', '1:00 PM', '3:00 PM', '4:30 PM', '6:00 PM'];
const FULL_TIME = '1:00 PM'; // shortcut: one slot always shows as fully booked, until slots come from the API.
// Today only offers slots at least ~30 minutes ahead; the prototype fixes "now" at 2:03 PM.
const slotsFor = (day: number) =>
  TIMES.filter((t) => day !== 0 || ['3:00 PM', '4:30 PM', '6:00 PM'].includes(t));
const DAYS = Array.from({ length: 12 }, (_, i) => i);

const usePrice = (app: App) => {
  const { draft: d, voucher, catalog } = app.state;
  return priceOf(d.category, d.serviceType, voucher, catalog);
};

function Foot({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView edges={['bottom']} style={s.foot}>
      {children}
    </SafeAreaView>
  );
}

export function Service({ app }: { app: App }) {
  const { draft: d, catalog, addresses, addressIdx, payment, voucher } = app.state;
  const cat = catalog[d.category];
  const a = addresses[addressIdx];
  const price = usePrice(app);
  const [sheet, setSheet] = useState<'address' | 'pay' | 'voucher' | null>(null);
  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <Canopy
        title="Choose Your Service"
        sub="Transparent Manong pricing with no surprise charges."
        pill={cat.name}
        onBack={app.back}
      />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <Card>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={a ? `Service address ${a.title}, change` : 'Add a service address'}
            onPress={() => setSheet('address')}
            style={s.addr}
          >
            <View style={s.addrIc}>
              <Icon name="award" size={18} color={C.goldText} />
            </View>
            <View style={{ flex: 1 }}>
              <T w={700} numberOfLines={1} style={{ fontSize: 16 }}>
                {a?.title ?? 'Add your address'}
              </T>
              {!!a && <Sub numberOfLines={1}>{a.detail}</Sub>}
            </View>
            <Icon name="edit-2" size={18} color={C.ink} />
          </Pressable>
        </Card>
        {(Object.keys(cat.tiers) as ServiceType[]).map((k) => {
          const t = cat.tiers[k];
          const on = d.serviceType === k;
          return (
            <Pressable
              key={k}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              onPress={() => app.setDraft({ serviceType: k })}
              style={[s.tier, on && s.tierOn]}
            >
              <View style={[s.radio, on && s.radioOn]}>{on && <View style={s.radioDot} />}</View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  paddingRight: 30,
                  flexWrap: 'wrap',
                }}
              >
                <T w={800} style={{ fontSize: 18 }}>
                  {t.name}
                </T>
                <View style={s.dur}>
                  <Icon name="clock" size={12} color={C.ink} />
                  <T w={600} style={{ fontSize: 11 }}>
                    {DURATION[k]}
                  </T>
                </View>
              </View>
              <Sub>{t.desc}</Sub>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  marginTop: 6,
                }}
              >
                {t.badge ? (
                  <View style={s.badge}>
                    <Icon name="star" size={11} color={C.ink} />
                    <T w={800} style={{ fontSize: 10 }}>
                      {t.badge}
                    </T>
                  </View>
                ) : (
                  <View />
                )}
                <T>
                  <T w={800} style={{ fontSize: 20 }}>
                    {peso(t.price)}
                    {t.plus ? '+' : ''}
                  </T>
                  <Sub style={{ fontSize: 12 }}> {t.unit}</Sub>
                </T>
              </View>
            </Pressable>
          );
        })}
        <Sub style={{ textAlign: 'center' }}>
          Parts, if needed, are quoted first and billed on an official receipt.
        </Sub>
      </ScrollView>
      <Foot>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Pressable accessibilityRole="button" onPress={() => setSheet('pay')} style={s.payChip}>
            {payment === 'gcash' ? (
              <GcashMark size={26} />
            ) : (
              <Icon name="dollar-sign" size={20} color={C.success} />
            )}
            <View style={{ flex: 1 }}>
              <T w={700} style={{ fontSize: 10, color: C.slate }}>
                PAYMENT
              </T>
              <T w={700} numberOfLines={1} style={{ fontSize: 13 }}>
                {payment === 'gcash' ? 'GCash' : 'Cash'} ({peso(price)})
              </T>
            </View>
            <Icon name="chevron-right" size={16} color={C.ink} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => setSheet('voucher')}
            style={s.payChip}
          >
            <View style={[s.vIc]}>
              <Icon name="tag" size={14} color={C.ink} />
            </View>
            <View style={{ flex: 1 }}>
              <T w={700} style={{ fontSize: 10, color: C.slate }}>
                VOUCHER
              </T>
              <T w={700} numberOfLines={1} style={{ fontSize: 13 }}>
                {voucher ? 'MANONG50 Applied' : 'Add voucher'}
              </T>
            </View>
            <Icon name={voucher ? 'check' : 'plus'} size={16} color={C.ink} />
          </Pressable>
        </View>
        <Btn
          label="Continue booking Manong"
          icon={<Icon name="arrow-right" size={20} color={C.white} />}
          onPress={() => app.go('details')}
          style={{ flexDirection: 'row-reverse' }}
        />
      </Foot>
      <AddressSheet app={app} open={sheet === 'address'} close={() => setSheet(null)} />
      <PaySheet app={app} open={sheet === 'pay'} close={() => setSheet(null)} />
      <VoucherSheet app={app} open={sheet === 'voucher'} close={() => setSheet(null)} />
    </View>
  );
}

export function Details({ app }: { app: App }) {
  const { draft: d, catalog } = app.state;
  const cat = catalog[d.category];
  const price = usePrice(app);
  const now = d.bookingType === 'on-demand';
  const slots = slotsFor(d.day);
  const month = dateIn(d.day).toLocaleDateString('en-PH', { month: 'long', year: 'numeric' });
  const toggle = (x: string) =>
    app.setDraft({
      symptoms: d.symptoms.includes(x) ? d.symptoms.filter((y) => y !== x) : [...d.symptoms, x],
    });
  // TODO(backend): real photos (expo-image-picker + storage). The mock adds a sample photo.
  const addPhoto = () => {
    app.setDraft({ photos: d.photos + 1 });
    app.toast('Photo added');
  };
  const pickDay = (day: number) => {
    const ok = slotsFor(day).filter((t) => t !== FULL_TIME);
    app.setDraft({ day, time: ok.includes(d.time) ? d.time : ok[0] });
  };
  const slot = (t: string) => {
    const full = t === FULL_TIME;
    const on = d.time === t;
    return (
      <Pressable
        key={t}
        accessibilityRole="button"
        accessibilityLabel={full ? `${t}, fully booked` : t}
        accessibilityState={{ selected: on, disabled: full }}
        disabled={full}
        onPress={() => app.setDraft({ time: t })}
        style={[
          s.slot,
          on && { backgroundColor: C.mango },
          full && { backgroundColor: 'transparent' },
        ]}
      >
        <T
          w={on ? 700 : 500}
          style={[
            { fontSize: 14 },
            full && { color: '#b5b5b5', textDecorationLine: 'line-through' },
          ]}
        >
          {t}
        </T>
      </Pressable>
    );
  };
  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <Canopy
        title="Tell Manong what happened"
        sub="Quick details mean the right tools on the first trip!"
        pill={cat.name}
        onBack={app.back}
      />
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 12 }}
        keyboardShouldPersistTaps="handled"
      >
        <Card>
          <SectionTitle n={1} title="Problem Description" />
          <Box
            label="Problem description"
            count
            maxLength={300}
            value={d.desc}
            onChangeText={(desc) => app.setDraft({ desc })}
            placeholder="e.g. kitchen pipe"
          />
          <View style={{ flexDirection: 'row', gap: 6, alignItems: 'center', marginVertical: 10 }}>
            <Icon name="mouse-pointer" size={14} color={C.slate} />
            <Sub>Tap to add common symptoms:</Sub>
          </View>
          <Chips>
            {cat.symptoms.map((x) => (
              <Chip key={x} label={x} on={d.symptoms.includes(x)} onPress={() => toggle(x)} />
            ))}
          </Chips>
        </Card>
        <Card>
          <SectionTitle n={2} title="Photos of the Issue" tag={`${d.photos} / 3 Added`} />
          <Sub style={{ marginBottom: 10 }}>
            Add photos (optional, up to 3) to help Manong diagnose faster and bring spare couplings.
          </Sub>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {Array.from({ length: d.photos }, (_, i) => (
              <View key={i} style={s.ptile}>
                <Image
                  source={IMG.pipe}
                  style={StyleSheet.absoluteFill}
                  resizeMode="cover"
                  accessibilityLabel={`Photo ${i + 1}`}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Remove photo"
                  onPress={() => app.setDraft({ photos: d.photos - 1 })}
                  style={s.rm}
                >
                  <Icon name="x" size={14} color={C.white} />
                </Pressable>
                <T w={700} style={s.plab}>
                  Photo {i + 1}
                </T>
              </View>
            ))}
            {d.photos < 3 && (
              <Pressable accessibilityRole="button" onPress={addPhoto} style={[s.ptile, s.padd]}>
                <View style={[s.disc, { backgroundColor: C.mangoSoft }]}>
                  <Icon name="camera" size={18} color={C.ink} />
                </View>
                <T w={600} style={{ fontSize: 13 }}>
                  Take Photo
                </T>
              </Pressable>
            )}
            {d.photos < 2 && (
              <Pressable accessibilityRole="button" onPress={addPhoto} style={[s.ptile, s.padd]}>
                <View style={[s.disc, { backgroundColor: C.grey }]}>
                  <Icon name="image" size={18} color={C.ink} />
                </View>
                <T w={600} style={{ fontSize: 13 }}>
                  Upload
                </T>
              </Pressable>
            )}
          </View>
        </Card>
        <Card>
          <SectionTitle n={3} title="When do you need Manong?" />
          <View style={{ flexDirection: 'row', gap: 10 }} accessibilityRole="tablist">
            {(
              [
                ['on-demand', 'Now'],
                ['scheduled', 'Schedule'],
              ] as const
            ).map(([k, l]) => (
              <Pressable
                key={k}
                accessibilityRole="tab"
                accessibilityState={{ selected: d.bookingType === k }}
                onPress={() => app.setDraft({ bookingType: k })}
                style={[s.whenBtn, d.bookingType === k && { backgroundColor: C.ink }]}
              >
                <T w={700} style={{ color: d.bookingType === k ? C.white : C.ink }}>
                  {l}
                </T>
              </Pressable>
            ))}
          </View>
          {now ? (
            <Sub style={{ marginTop: 10 }}>
              Fastest option. The closest free Manong heads over once he accepts.
            </Sub>
          ) : (
            <View style={{ gap: 10, marginTop: 12 }}>
              <T w={700}>{month}</T>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                {DAYS.map((day) => {
                  const on = d.day === day;
                  return (
                    <Pressable
                      key={day}
                      accessibilityRole="button"
                      accessibilityLabel={dayLabel(day)}
                      accessibilityState={{ selected: on }}
                      onPress={() => pickDay(day)}
                      style={[s.date, on && { backgroundColor: C.mango, borderColor: C.mango }]}
                    >
                      <T w={600} style={{ fontSize: 10, color: on ? C.ink : C.slate }}>
                        {day === 0 ? 'TODAY' : weekday(day).toUpperCase()}
                      </T>
                      <T w={800} style={{ fontSize: 20 }}>
                        {dateIn(day).getDate()}
                      </T>
                    </Pressable>
                  );
                })}
              </ScrollView>
              {slots.some((t) => t.endsWith('AM')) && (
                <>
                  <T w={700} style={s.lab}>
                    MORNING
                  </T>
                  <View style={s.slots}>{slots.filter((t) => t.endsWith('AM')).map(slot)}</View>
                </>
              )}
              <T w={700} style={s.lab}>
                AFTERNOON
              </T>
              <View style={s.slots}>{slots.filter((t) => t.endsWith('PM')).map(slot)}</View>
              <T style={{ textAlign: 'center', marginTop: 4 }}>
                {dayLabel(d.day)} at <T w={800}>{d.time}</T>
              </T>
            </View>
          )}
        </Card>
        <Card>
          <SectionTitle n={4} title="Notes for Manong" tag="Optional" />
          <Box
            label="Notes for Manong"
            value={d.notes}
            onChangeText={(notes) => app.setDraft({ notes })}
            placeholder="e.g. bring a tall ladder"
          />
        </Card>
      </ScrollView>
      <Foot>
        <Btn
          label="Choose your Manong"
          amount={peso(price)}
          onPress={() =>
            d.desc.trim() || d.symptoms.length
              ? app.go('pick')
              : app.toast('Add a description or tap a symptom')
          }
        />
        <Sub style={{ textAlign: 'center', fontSize: 12 }}>
          Need tools or ladder? Mang Juan arrives fully equipped.
        </Sub>
      </Foot>
    </View>
  );
}

export function Pick({ app }: { app: App }) {
  const { draft: d, catalog, addresses, addressIdx } = app.state;
  const tier = catalog[d.category].tiers[d.serviceType];
  const price = usePrice(app);
  const a = addresses[addressIdx];
  const now = d.bookingType === 'on-demand';
  const [roster, setRoster] = useState<RosterEntry[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [sheet, setSheet] = useState(false);
  const task = useTask();
  useEffect(() => {
    getRoster(d.category)
      .then(setRoster)
      .catch((e: Error) => setLoadError(e.message));
  }, [d.category]);
  const free = (roster ?? []).filter((r) => isFree(r, d) && r.manong.key !== d.avoidKey);
  const busy = (roster ?? []).filter((r) => !free.includes(r));
  const picked = free.find((r) => r.manong.key === d.manongKey);

  const confirm = (manongKey: string | null) =>
    task.run(async () => {
      if (!roster) return;
      const booking = await requestBooking({ ...d, manongKey }, a, roster);
      if (booking.stage === 'finding') {
        app.update({ booking, eta: 10 });
        return app.go('finding', { reset: true });
      }
      app.update((st) => ({
        booking,
        notifications: [
          {
            group: 'Today',
            text: `Request sent to ${booking.manong.first}. We'll tell you when he confirms.`,
            time: 'Now',
            unread: true,
            act: 'bookings',
          },
          ...st.notifications,
        ],
      }));
      app.go('pending', { reset: true });
    });

  const row = (r: RosterEntry, on: boolean) => {
    const sel = picked?.manong.key === r.manong.key;
    return (
      <Pressable
        key={r.manong.key}
        accessibilityRole="radio"
        accessibilityState={{ checked: sel, disabled: !on }}
        disabled={!on}
        onPress={() => app.setDraft({ manongKey: r.manong.key })}
        style={[s.lvl, sel && { borderColor: C.ink, borderWidth: 2 }, !on && { opacity: 0.5 }]}
      >
        <Avatar manong={r.manong} />
        <View style={{ flex: 1 }}>
          <T w={700} style={{ fontSize: 16 }}>
            {r.manong.name}
          </T>
          <Sub style={{ fontSize: 12 }}>
            {r.manong.skills} • {r.manong.rating}★ ({r.manong.jobs} jobs)
          </Sub>
        </View>
        <View style={{ alignItems: 'flex-end', maxWidth: 110 }}>
          {on ? (
            <>
              <T w={800}>{now ? `${r.km} km` : d.time.replace(' ', '')}</T>
              <Sub style={{ fontSize: 11 }}>
                {now ? `~${Math.round(r.km * 5 + 4)} mins away` : 'Free'}
              </Sub>
            </>
          ) : (
            <Sub style={{ fontSize: 11, textAlign: 'right' }}>
              {r.manong.key === d.avoidKey
                ? "Can't take this time"
                : now
                  ? String(r.now)
                  : `Booked at ${d.time}`}
            </Sub>
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.paper }}>
      <Canopy
        title="Choose Your Manong"
        sub="Review your booking, then book or pick someone."
        pill={catalog[d.category].name}
        onBack={app.back}
      />
      <View style={{ marginTop: -28 }}>
        <MapView building={a?.title.split(',')[0] ?? 'Your building'} height={240} />
      </View>
      <View style={s.bsheet}>
        <View style={s.grab} />
        <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
          <Kv
            rows={[
              ['Service', `${tier.name}, ${DURATION[d.serviceType]}`],
              ['When', whenText({ bookingType: d.bookingType, day: d.day, time: d.time })],
              [
                'Where',
                <Pressable
                  key="where"
                  accessibilityRole="button"
                  accessibilityLabel={`Address ${a?.short ?? 'not set'}, change`}
                  onPress={() => setSheet(true)}
                  style={{ flexDirection: 'row', gap: 6, alignItems: 'center' }}
                >
                  <T w={600}>{a?.short ?? 'Add address'}</T>
                  <Icon name="edit-2" size={14} color="#777" />
                </Pressable>,
              ],
              [
                'Estimate',
                <T key="est" w={800}>
                  {peso(price)}
                </T>,
              ],
            ]}
          />
          {!roster && !loadError && <Loader label="Finding who's free…" />}
          <ErrorText text={loadError ?? task.error} />
          {roster && (
            <>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ disabled: !free.length || task.busy }}
                disabled={!free.length || task.busy}
                accessibilityLabel={`Book nearest Manong, ${peso(price)}`}
                onPress={() => confirm(null)}
                style={s.quick}
              >
                <View style={{ flex: 1 }}>
                  <T w={700} style={{ fontSize: 11, color: C.mango }}>
                    RECOMMENDED
                  </T>
                  <T w={800} style={{ color: C.white, fontSize: 17 }}>
                    Book nearest Manong
                  </T>
                  {!free.length && (
                    <T
                      style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, fontStyle: 'italic' }}
                    >
                      Nobody is free then. Try another time.
                    </T>
                  )}
                </View>
                <T w={800} style={{ color: C.mango, fontSize: 17 }}>
                  {peso(price)}
                </T>
                <Icon name="arrow-right" size={20} color={C.mango} />
              </Pressable>
              <Sub style={{ textAlign: 'center' }}>or choose a Manong</Sub>
              <View style={{ gap: 10 }} accessibilityRole="radiogroup">
                {free.map((r) => row(r, true))}
                {busy.map((r) => row(r, false))}
              </View>
            </>
          )}
        </ScrollView>
        {picked && (
          <SafeAreaView edges={['bottom']} style={{ paddingTop: 8 }}>
            <Btn
              label={`Confirm ${picked.manong.first}`}
              amount={peso(price)}
              loading={task.busy}
              onPress={() => confirm(picked.manong.key)}
            />
          </SafeAreaView>
        )}
      </View>
      <AddressSheet app={app} open={sheet} close={() => setSheet(false)} />
    </View>
  );
}

const s = StyleSheet.create({
  foot: {
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 8,
    backgroundColor: C.white,
    borderTopLeftRadius: R.canopy,
    borderTopRightRadius: R.canopy,
    ...SHADOW.sheet,
  },
  addr: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  addrIc: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.mangoSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tier: {
    backgroundColor: C.white,
    borderRadius: R.card,
    padding: 16,
    gap: 4,
    borderWidth: 2,
    borderColor: 'transparent',
    ...SHADOW.card,
  },
  tierOn: { borderColor: C.mango, backgroundColor: C.mangoPale },
  radio: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOn: { borderColor: C.ink, backgroundColor: C.ink },
  radioDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: C.white },
  dur: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: R.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badge: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
    backgroundColor: C.mango,
    borderRadius: R.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  payChip: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: C.line,
    borderRadius: R.control,
    padding: 10,
    minHeight: 52,
  },
  vIc: {
    width: 26,
    height: 26,
    borderRadius: 7,
    backgroundColor: C.mango,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ptile: { width: 96, height: 96, borderRadius: R.control, overflow: 'hidden' },
  padd: { backgroundColor: C.cloud, alignItems: 'center', justifyContent: 'center', gap: 6 },
  disc: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  rm: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plab: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    color: C.white,
    fontSize: 11,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  whenBtn: {
    flex: 1,
    height: 46,
    borderRadius: R.full,
    backgroundColor: C.grey,
    alignItems: 'center',
    justifyContent: 'center',
  },
  date: {
    width: 56,
    height: 64,
    borderRadius: R.control,
    borderWidth: 1.5,
    borderColor: C.line,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lab: { fontSize: 11, color: C.slate, letterSpacing: 1 },
  slots: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slot: {
    width: '31%',
    height: 40,
    borderRadius: 10,
    backgroundColor: C.cloud,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  quick: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    backgroundColor: C.ink,
    borderRadius: R.card,
    padding: 16,
  },
  lvl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: C.cloud,
    borderRadius: R.card,
    padding: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
});
