import { useState } from 'react';
import { Image, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sendCode, verifyCode } from '../api.js';
import { C, F } from '../theme.js';
import { Btn, Field, H, Header, Icon, Label, Note, Rows, Screen, Sub, T } from '../ui.js';

const fmtPhone = (d) =>
  d
    .replace(/\D/g, '')
    .replace(/^(\d{3})(\d{3})(\d{0,4}).*/, '$1 $2 $3')
    .trim();
const Err = ({ text }) => !!text && <T style={{ color: C.destructive, fontSize: 13 }}>{text}</T>;
const regHeader = (app, step) => <Header title="Create account" step={step} onBack={app.back} />;

export function Welcome({ app }) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.white }} edges={['top']}>
      <View style={{ flex: 1, padding: 20, paddingTop: 72, gap: 18 }}>
        <Image
          source={require('../assets/badge.png')}
          style={{ width: 168, height: 131 }}
          accessibilityLabel="Mang Juan"
        />
        <Sub style={{ fontSize: 16, lineHeight: 24 }}>
          Book a trusted Manong for repairs, cleaning, locks and moving.
        </Sub>
        {[
          ['shield', 'Every Manong is ID-verified'],
          ['check', 'Prices you see before booking'],
          ['credit-card', 'Pay after job is done'],
        ].map(([i, t]) => (
          <View key={t} style={s.why}>
            <View style={s.disc}>
              <Icon name={i} size={16} color={C.ink} />
            </View>
            <T style={{ fontSize: 15 }}>{t}</T>
          </View>
        ))}
      </View>
      <SafeAreaView edges={['bottom']} style={s.signin}>
        <Btn label="Continue with mobile number" icon="phone" onPress={() => app.go('phone')} />
        <Btn kind="link" label="Have an account? Log in" onPress={() => app.go('phone')} />
      </SafeAreaView>
    </SafeAreaView>
  );
}

export function Phone({ app }) {
  const [phone, setPhone] = useState(app.state.user.phone);
  const [err, setErr] = useState('');
  async function send() {
    try {
      await sendCode(phone);
      app.setUser({ phone });
      app.go('code');
    } catch (e) {
      setErr(e.message);
    }
  }
  return (
    <Screen
      header={regHeader(app, 1)}
      footer={
        <>
          <Sub style={{ textAlign: 'center', fontSize: 12 }}>
            By continuing, you agree to the Terms of Use and Privacy Policy.
          </Sub>
          <Btn label="Send code" onPress={send} />
        </>
      }
    >
      <H>What's your mobile number?</H>
      <Sub>We'll text you a 6-digit code to confirm it's you.</Sub>
      <Label>Mobile number</Label>
      <View style={s.phoneRow}>
        <T w={600}>PH +63</T>
        <TextInput
          accessibilityLabel="Mobile number"
          keyboardType="number-pad"
          maxLength={12}
          value={fmtPhone(phone)}
          onChangeText={(v) => {
            setPhone(v);
            setErr('');
          }}
          placeholder="917 123 4567"
          placeholderTextColor={C.slate}
          style={[s.input, { flex: 1 }]}
        />
      </View>
      <Err text={err} />
      <Note
        icon="shield"
        text="We never share your number. A Manong only sees it after you book him."
      />
    </Screen>
  );
}

export function Code({ app }) {
  const [code, setCode] = useState('');
  const [err, setErr] = useState('');
  async function verify() {
    try {
      await verifyCode(app.state.user.phone, code);
      app.go('name');
    } catch (e) {
      setErr(e.message);
      setCode('');
    }
  }
  return (
    <Screen
      header={regHeader(app, 2)}
      footer={<Btn label="Verify" disabled={code.length !== 6} onPress={verify} />}
    >
      <H>Enter the code</H>
      <Sub>Sent to +63 {fmtPhone(app.state.user.phone)}.</Sub>
      <TextInput
        accessibilityLabel="6-digit code"
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={6}
        value={code}
        onChangeText={(v) => {
          setCode(v.replace(/\D/g, ''));
          setErr('');
        }}
        placeholder="••••••"
        placeholderTextColor={C.slate}
        style={[s.input, s.otp, !!err && { borderColor: C.destructive, borderWidth: 2 }]}
      />
      <Err text={err} />
      <Sub style={{ fontSize: 12 }}>
        Mock: any 6 digits work, 000000 shows the wrong-code state.
      </Sub>
    </Screen>
  );
}

export function Name({ app }) {
  const { first, last } = app.state.user;
  return (
    <Screen
      header={regHeader(app, 3)}
      footer={<Btn label="Continue" disabled={!first.trim()} onPress={() => app.go('address')} />}
    >
      <H>What should Manong call you?</H>
      <Field
        label="First name"
        value={first}
        onChangeText={(first) => app.setUser({ first })}
        placeholder="First name"
        autoComplete="given-name"
      />
      <Field
        label="Last name"
        value={last}
        onChangeText={(last) => app.setUser({ last })}
        placeholder="Last name"
        autoComplete="family-name"
      />
    </Screen>
  );
}

export function Address({ app }) {
  const [a, setA] = useState(app.state.address ?? { bldg: '', unit: '', note: '' });
  const set = (k) => (v) => setA({ ...a, [k]: v });
  return (
    <Screen
      header={regHeader(app, 4)}
      footer={
        <>
          <Btn
            label="Save address"
            disabled={!a.bldg.trim() || !a.unit.trim()}
            onPress={() => {
              app.setAddress(a);
              app.go('allset');
            }}
          />
          <Btn
            kind="link"
            label="Skip for now"
            onPress={() => {
              app.setAddress(null);
              app.go('allset');
            }}
          />
        </>
      }
    >
      <H>Where should Manong go?</H>
      <Field
        label="Building or street"
        value={a.bldg}
        onChangeText={set('bldg')}
        placeholder="e.g. Green Residences, Malate"
      />
      <Field
        label="Unit and tower"
        value={a.unit}
        onChangeText={set('unit')}
        placeholder="e.g. Unit 12B, Tower 1"
      />
      <Field
        label="Note for the guard"
        optional
        value={a.note}
        onChangeText={set('note')}
        placeholder="e.g. Leave your ID at the lobby"
      />
    </Screen>
  );
}

export function AllSet({ app }) {
  const { user, address } = app.state;
  return (
    <Screen
      footer={
        <>
          <Btn label="Book your first Manong" onPress={() => app.startBooking('plumbing')} />
          <Btn kind="link" label="Go to home" onPress={app.home} />
        </>
      }
    >
      <View style={{ paddingTop: 110, gap: 12 }}>
        <View style={s.mark}>
          <Image source={require('../assets/mark.png')} style={{ width: 46, height: 42 }} />
        </View>
        <H>Ayos, {user.first}! You're all set.</H>
        <Sub>
          {address
            ? `Your home at ${address.unit}, ${address.bldg} is saved. Booking a Manong now takes a few taps.`
            : 'You can add your home address any time from Profile.'}
        </Sub>
        <View style={s.sum}>
          <Rows
            big
            rows={[
              ['Name', `${user.first} ${user.last}`.trim()],
              ['Mobile', `+63 ${fmtPhone(user.phone)}`],
              ['Home', address?.unit],
            ]}
          />
        </View>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  why: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  disc: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.mangoSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signin: {
    backgroundColor: C.mango,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 20,
    gap: 8,
  },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  input: {
    backgroundColor: C.cloud,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    fontFamily: F[400],
    fontSize: 16,
    color: C.ink,
  },
  otp: { fontSize: 24, letterSpacing: 12, textAlign: 'center', fontFamily: F[700] },
  mark: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: C.mango,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sum: { backgroundColor: C.white, borderRadius: 16, padding: 16, marginTop: 10 },
});
