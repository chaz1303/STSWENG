import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BOOKING_STATES } from '../../src/utils/contract.js';
import { C } from '../theme';
import { Avatar, Icon, Note, Stamp, Sub, T } from '../ui';
import type { App } from '../types';
import { whenOf } from './Book';

export function Home({ app }: { app: App }) {
  const { catalog, address, booking: b } = app.state;
  const active = b && !b.paid;
  return (
    <SafeAreaView edges={['bottom']} style={{ flex: 1, backgroundColor: C.paper }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <SafeAreaView edges={['top']} style={s.band}>
          <Image
            source={require('../assets/wordmark.png')}
            style={{ width: 154, height: 36 }}
            accessibilityLabel="Mang Juan"
          />
          <View style={s.unit}>
            <Icon name="map-pin" size={16} color={C.ink} />
            <T w={500} numberOfLines={1} style={{ flex: 1, fontSize: 13 }}>
              {address ? `${address.unit}, ${address.bldg}` : 'Add your address'}
            </T>
          </View>
          {active ? (
            <Pressable accessibilityRole="button" onPress={() => app.go('status')} style={s.card}>
              <View style={s.between}>
                <View style={{ flex: 1 }}>
                  <T w={700} style={{ fontSize: 17 }}>
                    {catalog[b.category].name}
                  </T>
                  <Sub style={{ fontSize: 13 }}>
                    {catalog[b.category].tiers[b.serviceType].name}
                  </Sub>
                </View>
                <Stamp label={b.status} />
              </View>
              <View style={s.tear} />
              <View style={s.between}>
                <Avatar initial={b.manong.initial} />
                <View style={{ flex: 1 }}>
                  <T w={600}>
                    {b.status === BOOKING_STATES.COMPLETED
                      ? `${b.manong.first} finished the job`
                      : `${b.manong.first} is booked`}
                  </T>
                  <Sub style={{ fontSize: 13 }}>{whenOf(b)}</Sub>
                </View>
                <Icon name="chevron-right" size={20} color={C.ink} />
              </View>
            </Pressable>
          ) : (
            <View style={[s.card, s.between]}>
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
          )}
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
          <Note
            icon="shield"
            text="Every Manong is ID-verified, and you only pay once the job is done."
          />
        </View>
      </ScrollView>
    </SafeAreaView>
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
  unit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: C.mangoSoft,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  card: { backgroundColor: C.white, borderRadius: 16, padding: 16 },
  between: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tear: { height: 1, backgroundColor: C.cloud, marginVertical: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: {
    width: '31%',
    aspectRatio: 1.05,
    backgroundColor: C.white,
    borderRadius: 16,
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
});
