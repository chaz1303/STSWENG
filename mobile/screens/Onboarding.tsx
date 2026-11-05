import { FontAwesome } from '@expo/vector-icons';
import { useEffect, useRef, useState, type ComponentRef } from 'react';
import { Image, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  logIn,
  sendCode,
  sendPasswordReset,
  signInWithProvider,
  verifyCode,
  type Provider,
} from '../services/auth';
import { C, F, R } from '../theme';
import {
  Btn,
  ErrorText,
  Field,
  H,
  Header,
  Icon,
  Label,
  Note,
  Rows,
  Screen,
  Sheet,
  Sub,
  T,
} from '../ui';
import { useTask } from '../useTask';
import type { Address as AddressT, App } from '../types';

const fmtPhone = (d: string) =>
  d
    .replace(/\D/g, '')
    .replace(/^(\d{3})(\d{3})(\d{0,4}).*/, '$1 $2 $3')
    .trim();

const regHeader = (app: App, step: number) =>
  app.state.regMode === 'login' ? (
    <Header title="Log in" onBack={app.back} />
  ) : (
    <Header title="Create account" step={step} onBack={app.back} />
  );

function Social({ app, outline }: { app: App; outline?: boolean }) {
  const task = useTask();
  const [which, setWhich] = useState<Provider | null>(null);
  const go = (p: Provider) => {
    setWhich(p);
    task.run(async () => app.signIn(await signInWithProvider(p), `Signed in with ${p}`));
  };
  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {(['Google', 'Facebook'] as const).map((p) => (
          <View key={p} style={[{ flex: 1 }, outline && s.outline]}>
            <Btn
              kind="white"
              label={p}
              loading={task.busy && which === p}
              disabled={task.busy && which !== p}
              icon={
                <FontAwesome
                  name={p === 'Google' ? 'google' : 'facebook'}
                  size={18}
                  color={p === 'Google' ? '#4285F4' : '#1877F2'}
                />
              }
              onPress={() => go(p)}
            />
          </View>
        ))}
      </View>
      <ErrorText text={task.error} />
    </View>
  );
}

const Or = () => (
  <View style={s.or}>
    <View style={s.orLine} />
    <Sub style={{ fontSize: 12 }}>or continue with</Sub>
    <View style={s.orLine} />
  </View>
);

const InlineLink = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <T w={700} accessibilityRole="link" onPress={onPress} style={{ textDecorationLine: 'underline' }}>
    {label}
  </T>
);

const startPhone = (app: App, regMode: 'new' | 'login') => {
  app.update({ regMode, user: { ...app.state.user, phone: '' } });
  app.go('phone');
};

export function Welcome({ app }: { app: App }) {
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
        {(
          [
            ['shield', 'Every Manong is ID-verified'],
            ['check', 'Prices you see before booking'],
            ['credit-card', 'Pay after job is done'],
          ] as const
        ).map(([i, t]) => (
          <View key={t} style={s.why}>
            <View style={s.disc}>
              <Icon name={i} size={16} color={C.ink} />
            </View>
            <T style={{ fontSize: 15 }}>{t}</T>
          </View>
        ))}
      </View>
      <SafeAreaView edges={['bottom']} style={s.signin}>
        <Btn
          label="Continue with mobile number"
          icon={<Icon name="phone" size={18} color={C.mango} />}
          onPress={() => startPhone(app, 'new')}
        />
        <Or />
        <Social app={app} />
        <T style={s.center}>
          New here? Create your{' '}
          <InlineLink label="account" onPress={() => startPhone(app, 'new')} />.
        </T>
        <T style={s.center}>
          Have an account? <InlineLink label="Log in" onPress={() => app.go('login')} />
        </T>
      </SafeAreaView>
    </SafeAreaView>
  );
}

export function Login({ app }: { app: App }) {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [email, setEmail] = useState('');
  const task = useTask();
  const reset = useTask();
  return (
    <Screen>
      <View style={{ paddingTop: 52, gap: 12 }}>
        <Image
          source={require('../assets/badge.png')}
          style={{ width: 120, height: 94 }}
          accessibilityLabel="Mang Juan"
        />
        <Sub style={{ fontSize: 16, marginBottom: 8 }}>
          Welcome back. Log in to book your next repair.
        </Sub>
        <Field
          label="Email or mobile number"
          value={id}
          onChangeText={setId}
          placeholder="name@email.com"
          autoCapitalize="none"
          autoComplete="username"
        />
        <View style={{ gap: 6 }}>
          <Label style={{ marginTop: 0 }}>Password</Label>
          <View style={s.pwRow}>
            <TextInput
              accessibilityLabel="Password"
              value={pw}
              onChangeText={setPw}
              secureTextEntry={!show}
              placeholder="Password"
              placeholderTextColor={C.slate}
              autoComplete="current-password"
              style={[s.input, { flex: 1, backgroundColor: 'transparent' }]}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={show ? 'Hide password' : 'Show password'}
              onPress={() => setShow(!show)}
              style={{ padding: 12 }}
            >
              <Icon name={show ? 'eye' : 'eye-off'} size={20} color={C.ink} />
            </Pressable>
          </View>
        </View>
        <ErrorText text={task.error} />
        <Pressable
          accessibilityRole="button"
          onPress={() => setForgot(true)}
          style={{ alignSelf: 'flex-end' }}
        >
          <T w={600} style={{ color: C.gold, textDecorationLine: 'underline' }}>
            Forgot password?
          </T>
        </Pressable>
        <Btn
          label="Log in"
          loading={task.busy}
          onPress={() => task.run(async () => app.signIn(await logIn(id, pw)))}
        />
        <Or />
        <Social app={app} outline />
        <View style={s.outline}>
          <Btn
            kind="secondary"
            label="Use mobile number instead"
            onPress={() => startPhone(app, 'login')}
          />
        </View>
        <T style={[s.center, { color: C.slate, marginTop: 8 }]}>
          New to Mang Juan? <InlineLink label="Sign up" onPress={() => startPhone(app, 'new')} />
        </T>
      </View>
      <Sheet open={forgot} onClose={() => setForgot(false)}>
        <T w={700} style={{ fontSize: 20 }}>
          Reset your password
        </T>
        <Sub>We'll email you a link to set a new one.</Sub>
        <TextInput
          accessibilityLabel="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="name@email.com"
          placeholderTextColor={C.slate}
          keyboardType="email-address"
          autoCapitalize="none"
          style={s.input}
        />
        <ErrorText text={reset.error} />
        <Btn
          label="Send reset link"
          loading={reset.busy}
          onPress={() =>
            reset.run(async () => {
              await sendPasswordReset(email);
              setForgot(false);
              app.toast('Reset link sent. Check your inbox.');
            })
          }
        />
      </Sheet>
    </Screen>
  );
}

export function Phone({ app }: { app: App }) {
  const [phone, setPhone] = useState(app.state.user.phone);
  const task = useTask();
  const send = () =>
    task.run(async () => {
      await sendCode(phone);
      app.update({ user: { ...app.state.user, phone } });
      app.go('code');
      app.toast('Code sent');
    });
  return (
    <Screen
      header={regHeader(app, 1)}
      footer={
        <>
          {app.state.regMode === 'new' && (
            <Sub style={{ textAlign: 'center', fontSize: 12 }}>
              By continuing, you agree to the Terms of Use and Privacy Policy.
            </Sub>
          )}
          <Btn label="Send code" loading={task.busy} onPress={send} />
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
            task.setError(null);
          }}
          placeholder="917 123 4567"
          placeholderTextColor={C.slate}
          style={[s.input, { flex: 1 }]}
        />
      </View>
      <ErrorText text={task.error} />
      <Note
        icon="shield"
        text="We never share your number. A Manong only sees it after you book him."
      />
    </Screen>
  );
}

const RESEND_S = 24;

export function Code({ app }: { app: App }) {
  const [code, setCode] = useState('');
  const [wrong, setWrong] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(RESEND_S);
  const input = useRef<ComponentRef<typeof TextInput>>(null);
  const task = useTask();
  const phone = app.state.user.phone;

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn(resendIn - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const verify = () =>
    task.run(async () => {
      try {
        const account = await verifyCode(phone, code);
        if (app.state.regMode === 'login')
          return app.signIn({
            ...account,
            user: { ...account.user, phone: `+63 ${fmtPhone(phone)}` },
          });
        app.go('name');
      } catch (e) {
        setWrong((e as Error).message);
      }
    });
  const resend = () => {
    setCode('');
    setWrong(null);
    setResendIn(RESEND_S);
    app.toast('New code sent');
  };

  return (
    <Screen
      header={regHeader(app, 2)}
      footer={
        wrong ? (
          <Btn
            label="Try again"
            onPress={() => {
              setCode('');
              setWrong(null);
              input.current?.focus();
            }}
          />
        ) : (
          <Btn label="Verify" loading={task.busy} disabled={code.length !== 6} onPress={verify} />
        )
      }
    >
      <H>Enter the code</H>
      <T style={{ color: C.slate }}>
        Sent to +63 {fmtPhone(phone)}.{' '}
        {!wrong && <InlineLink label="Change number" onPress={app.back} />}
      </T>
      {/* One hidden input drives six boxes, so paste and SMS autofill still work. */}
      <Pressable accessibilityRole="none" onPress={() => input.current?.focus()} style={s.otpRow}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <View
            key={i}
            style={[
              s.otpBox,
              !!wrong && { borderColor: C.destructive },
              code.length === i && !wrong && { borderColor: C.ink },
            ]}
          >
            <T w={700} style={{ fontSize: 22 }}>
              {code[i] ?? ''}
            </T>
          </View>
        ))}
        <TextInput
          ref={input}
          accessibilityLabel="6-digit code"
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          autoComplete="sms-otp"
          maxLength={6}
          autoFocus
          editable={!wrong}
          value={code}
          onChangeText={(v) => setCode(v.replace(/\D/g, ''))}
          style={s.otpHidden}
        />
      </Pressable>
      {wrong ? (
        <>
          <ErrorText text={wrong} />
          <Btn kind="link" label="Resend code" onPress={resend} />
        </>
      ) : (
        <Sub style={{ fontSize: 13 }}>
          Didn't get it?{' '}
          {resendIn > 0 ? (
            `Resend code in 0:${String(resendIn).padStart(2, '0')}`
          ) : (
            <InlineLink label="Resend code" onPress={resend} />
          )}
        </Sub>
      )}
      <ErrorText text={task.error} />
    </Screen>
  );
}

export function Name({ app }: { app: App }) {
  const { first, last } = app.state.user;
  const setUser = (patch: Partial<App['state']['user']>) =>
    app.update({ user: { ...app.state.user, ...patch } });
  return (
    <Screen
      header={regHeader(app, 3)}
      footer={
        <Btn
          label="Continue"
          onPress={() => (first.trim() ? app.go('address') : app.toast('Enter your first name'))}
        />
      }
    >
      <H>What should Manong call you?</H>
      <Field
        label="First name"
        value={first}
        onChangeText={(first) => setUser({ first })}
        placeholder="First name"
        autoComplete="given-name"
      />
      <Field
        label="Last name"
        value={last}
        onChangeText={(last) => setUser({ last })}
        placeholder="Last name"
        autoComplete="family-name"
      />
    </Screen>
  );
}

export function Address({ app }: { app: App }) {
  const [a, setA] = useState<AddressT>(
    app.state.addresses[0] ?? { label: 'Home', bldg: '', unit: '', city: '', note: '' },
  );
  const set = (k: keyof AddressT) => (v: string) => setA({ ...a, [k]: v });
  return (
    <Screen
      header={regHeader(app, 4)}
      footer={
        <>
          <Btn
            label="Save address"
            onPress={() => {
              if (!a.bldg.trim() || !a.unit.trim()) return app.toast('Add your building and unit');
              app.update({
                addresses: [
                  { ...a, bldg: a.bldg.trim(), unit: a.unit.trim(), note: a.note.trim() },
                ],
              });
              app.go('allset');
            }}
          />
          <Btn
            kind="link"
            label="Skip for now"
            onPress={() => {
              app.update({ addresses: [] });
              app.go('allset');
            }}
          />
        </>
      }
    >
      <H>Where should Manong go?</H>
      <AddressFields a={a} set={set} />
    </Screen>
  );
}

export function AddressFields({
  a,
  set,
  withLabel,
}: {
  a: AddressT;
  set: (k: keyof AddressT) => (v: string) => void;
  withLabel?: boolean;
}) {
  return (
    <>
      {withLabel && (
        <Field
          label="Label"
          value={a.label}
          onChangeText={set('label')}
          placeholder="e.g. Home, Office"
        />
      )}
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
    </>
  );
}

export function AllSet({ app }: { app: App }) {
  const { user, addresses } = app.state;
  const home = addresses[0];
  // A brand-new resident starts with no history.
  const finish = (book: boolean) => {
    app.signIn({
      user: {
        first: user.first.trim() || 'Bruce',
        last: user.last.trim(),
        phone: `+63 ${fmtPhone(user.phone)}`,
      },
      addresses,
      payment: 'gcash',
      past: [],
      upcoming: [],
      chat: [],
      notifications: [
        {
          group: 'Today',
          icon: 'shield',
          text: 'Welcome to Mang Juan! Every Manong is ID-verified.',
          time: 'Now',
          unread: true,
          act: '',
        },
      ],
    });
    if (book) app.toast('Pick what needs fixing to start');
  };
  return (
    <Screen
      footer={
        <>
          <Btn label="Book your first Manong" onPress={() => finish(true)} />
          <Btn kind="link" label="Go to home" onPress={() => finish(false)} />
        </>
      }
    >
      <View style={{ paddingTop: 110, gap: 12 }}>
        <View style={s.mark}>
          <Image source={require('../assets/mark.png')} style={{ width: 46, height: 42 }} />
        </View>
        <H>Ayos, {user.first || 'Bruce'}! You're all set.</H>
        <Sub>
          {home
            ? `Your home at ${home.unit}, ${home.bldg} is saved. Booking a Manong now takes a few taps.`
            : 'You can add your home address any time from Profile.'}
        </Sub>
        <View style={s.sum}>
          <Rows
            big
            rows={[
              ['Name', `${user.first} ${user.last}`.trim()],
              ['Mobile', `+63 ${fmtPhone(user.phone)}`],
              ['Home', home?.unit],
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
    gap: 10,
  },
  center: { textAlign: 'center', fontSize: 14 },
  or: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  orLine: { flex: 1, height: 1, backgroundColor: 'rgba(0,0,0,0.15)' },
  outline: { borderWidth: 1.5, borderColor: C.ink, borderRadius: R.full },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pwRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.cloud,
    borderRadius: R.control,
  },
  input: {
    backgroundColor: C.cloud,
    borderRadius: R.control,
    paddingHorizontal: 14,
    height: 52,
    fontFamily: F[400],
    fontSize: 16,
    color: C.ink,
  },
  otpRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  otpBox: {
    flex: 1,
    height: 56,
    borderRadius: R.control,
    borderWidth: 1.5,
    borderColor: C.line,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpHidden: { position: 'absolute', width: 1, height: 1, opacity: 0 },
  mark: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: C.mango,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sum: { backgroundColor: C.white, borderRadius: R.card, padding: 16, marginTop: 10 },
});
