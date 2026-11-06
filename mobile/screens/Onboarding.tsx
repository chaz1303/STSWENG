import { useState } from 'react';
import { Image, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  logIn,
  logInWithPhone,
  sendPasswordReset,
  signInWithProvider,
  signUp,
  type Provider,
} from '../services/auth';
import { C, FI, R } from '../theme';
import {
  Btn,
  ErrorText,
  FontAwesome,
  Icon,
  IMG,
  InterScope,
  Sheet,
  SheetTitle,
  Sub,
  T,
} from '../ui';
import { useTask } from '../useTask';
import type { App } from '../types';

type SheetKind = 'phone' | 'signup' | 'forgot' | null;

function Social({ app }: { app: App }) {
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
          <Btn
            key={p}
            kind="white"
            label={p}
            style={{ flex: 1 }}
            loading={task.busy && which === p}
            disabled={task.busy && which !== p}
            icon={
              <FontAwesome
                name={p === 'Google' ? 'google' : 'facebook'}
                size={20}
                color={p === 'Google' ? '#4285F4' : '#1877F2'}
              />
            }
            onPress={() => go(p)}
          />
        ))}
      </View>
      <ErrorText text={task.error} />
    </View>
  );
}

const Or = () => (
  <View style={s.or}>
    <View style={s.orLine} />
    <Sub style={{ color: C.goldText, fontSize: 12 }}>or continue with</Sub>
    <View style={s.orLine} />
  </View>
);

const Link = ({ label, onPress }: { label: string; onPress: () => void }) => (
  <T
    w={700}
    accessibilityRole="link"
    onPress={onPress}
    style={{ textDecorationLine: 'underline', fontSize: 14 }}
  >
    {label}
  </T>
);

/** The sign-in sheets Welcome and Log in share. */
function AuthSheets({ app, open, close }: { app: App; open: SheetKind; close: () => void }) {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [email, setEmail] = useState('');
  const task = useTask();
  const shut = () => {
    task.setError(null);
    close();
  };
  return (
    <>
      <Sheet open={open === 'phone'} onClose={shut}>
        <SheetTitle title="Log in with mobile" sub="We'll text a one-time code." />
        <TextInput
          accessibilityLabel="Mobile"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          placeholder="+63 917 555 0142"
          placeholderTextColor={C.muted}
          style={s.sheetIn}
        />
        <ErrorText text={task.error} />
        <Btn
          label="Send code & log in"
          loading={task.busy}
          onPress={() =>
            task.run(async () => app.signIn(await logInWithPhone(phone), 'Code verified'))
          }
        />
      </Sheet>
      <Sheet open={open === 'signup'} onClose={shut}>
        <SheetTitle
          title="Create your account"
          sub="Takes 30 seconds. We'll verify your unit later."
        />
        <TextInput
          accessibilityLabel="Full name"
          value={name}
          onChangeText={setName}
          placeholder="Full name"
          placeholderTextColor={C.muted}
          autoComplete="name"
          style={s.sheetIn}
        />
        <TextInput
          accessibilityLabel="Email or mobile"
          value={id}
          onChangeText={setId}
          placeholder="Email or mobile"
          placeholderTextColor={C.muted}
          autoCapitalize="none"
          style={s.sheetIn}
        />
        <TextInput
          accessibilityLabel="Password"
          value={pw}
          onChangeText={setPw}
          placeholder="Password"
          placeholderTextColor={C.muted}
          secureTextEntry
          autoComplete="new-password"
          style={s.sheetIn}
        />
        <ErrorText text={task.error} />
        <Btn
          label="Create account"
          loading={task.busy}
          onPress={() =>
            task.run(async () => {
              const account = await signUp(name, id, pw);
              app.signIn(account, `Account created. Welcome, ${name.trim().split(' ')[0]}!`);
            })
          }
        />
        <Btn kind="grey" label="Cancel" onPress={shut} />
      </Sheet>
      <Sheet open={open === 'forgot'} onClose={shut}>
        <SheetTitle title="Reset your password" sub="We'll email you a link to set a new one." />
        <TextInput
          accessibilityLabel="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="name@email.com"
          placeholderTextColor={C.muted}
          keyboardType="email-address"
          autoCapitalize="none"
          style={s.sheetIn}
        />
        <ErrorText text={task.error} />
        <Btn
          label="Send reset link"
          loading={task.busy}
          onPress={() =>
            task.run(async () => {
              await sendPasswordReset(email);
              shut();
              app.toast('Reset link sent. Check your inbox.');
            })
          }
        />
      </Sheet>
    </>
  );
}

export function Welcome({ app }: { app: App }) {
  const [sheet, setSheet] = useState<SheetKind>(null);
  return (
    <InterScope>
      <SafeAreaView style={s.auth}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Image
            source={IMG.wordmark}
            style={{ width: 223, height: 52 }}
            accessibilityLabel="mang juan"
          />
        </View>
        <View style={{ gap: 14 }}>
          <Btn
            label="Continue with mobile number"
            icon={<Icon name="phone" size={18} color={C.mango} />}
            onPress={() => setSheet('phone')}
          />
          <Or />
          <Social app={app} />
          <T style={s.center}>
            Have an account? <Link label="Log in with email" onPress={() => app.go('login')} />
          </T>
        </View>
        <AuthSheets app={app} open={sheet} close={() => setSheet(null)} />
      </SafeAreaView>
    </InterScope>
  );
}

export function Login({ app }: { app: App }) {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [show, setShow] = useState(false);
  const [sheet, setSheet] = useState<SheetKind>(null);
  const task = useTask();
  return (
    <InterScope>
      <SafeAreaView style={s.auth}>
        <View style={{ alignItems: 'center', marginTop: 70, gap: 10 }}>
          <Image
            source={IMG.wordmark}
            style={{ width: 189, height: 44 }}
            accessibilityLabel="mang juan"
          />
          <T style={{ color: C.goldText }}>Log in to book your next repair.</T>
        </View>
        <View style={{ marginTop: 22, gap: 6 }}>
          <T w={600} style={s.lab}>
            Email or mobile number
          </T>
          <TextInput
            accessibilityLabel="Email or mobile number"
            value={id}
            onChangeText={setId}
            placeholder="name@email.com"
            placeholderTextColor={C.muted}
            autoCapitalize="none"
            autoComplete="username"
            style={s.in}
          />
          <T w={600} style={[s.lab, { marginTop: 10 }]}>
            Password
          </T>
          <View style={[s.in, { flexDirection: 'row', alignItems: 'center', paddingRight: 0 }]}>
            <TextInput
              accessibilityLabel="Password"
              value={pw}
              onChangeText={setPw}
              secureTextEntry={!show}
              placeholder="Password"
              placeholderTextColor={C.muted}
              autoComplete="current-password"
              style={{ flex: 1, fontFamily: FI[400], fontSize: 15, color: C.ink, height: 52 }}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={show ? 'Hide password' : 'Show password'}
              onPress={() => setShow(!show)}
              style={{ padding: 14 }}
            >
              <Icon name={show ? 'eye' : 'eye-off'} size={20} color={C.ink} />
            </Pressable>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => setSheet('forgot')}
          style={{ alignSelf: 'flex-end', paddingVertical: 10 }}
        >
          <T w={700} style={{ textDecorationLine: 'underline', fontSize: 14 }}>
            Forgot password?
          </T>
        </Pressable>
        <ErrorText text={task.error} />
        <View style={{ gap: 14 }}>
          <Btn
            label="Log in"
            loading={task.busy}
            onPress={() => task.run(async () => app.signIn(await logIn(id, pw)))}
          />
          <Or />
          <Social app={app} />
          <Btn
            kind="white"
            label="Use mobile number instead"
            onPress={() => setSheet('phone')}
            style={s.ghost}
          />
        </View>
        <T style={[s.center, { marginTop: 'auto' }]}>
          New to Mang Juan? <Link label="Sign up" onPress={() => setSheet('signup')} />
        </T>
        <AuthSheets app={app} open={sheet} close={() => setSheet(null)} />
      </SafeAreaView>
    </InterScope>
  );
}

const s = StyleSheet.create({
  auth: { flex: 1, backgroundColor: C.mangoAuth, paddingHorizontal: 24, paddingBottom: 28 },
  center: { textAlign: 'center', fontSize: 14 },
  or: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  orLine: { flex: 1, height: 1, backgroundColor: 'rgba(90,67,0,0.3)' },
  lab: { fontSize: 13, color: C.goldText },
  in: {
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderRadius: R.control,
    paddingHorizontal: 14,
    height: 52,
    fontFamily: FI[400],
    fontSize: 15,
    color: C.ink,
  },
  ghost: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: 'rgba(90,67,0,0.55)' },
  sheetIn: {
    backgroundColor: C.cloud,
    borderRadius: R.control,
    paddingHorizontal: 14,
    height: 52,
    fontSize: 15,
    color: C.ink,
  },
});
