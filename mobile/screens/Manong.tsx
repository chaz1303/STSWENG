// Talking to the Manong: chat, the call screen, and the lobby gate pass.
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { sendMessage } from '../services/manongs';
import { C, F, R } from '../theme';
import { Avatar, Btn, ErrorText, Icon, Sheet, SheetTitle, Sub, T } from '../ui';
import type { App, Manong } from '../types';

export function ChatSheet({
  app,
  manong,
  open,
  close,
}: {
  app: App;
  manong: Manong;
  open: boolean;
  close: () => void;
}) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const send = (msg: string) => {
    if (!msg.trim()) return;
    setText('');
    setError(null);
    app.update((st) => ({ chat: [...st.chat, { me: true, text: msg.trim() }] }));
    sendMessage(msg)
      .then((reply) => app.update((st) => ({ chat: [...st.chat, reply] })))
      .catch((e: Error) => setError(`Not delivered: ${e.message}`));
  };
  return (
    <Sheet open={open} onClose={close}>
      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
        <Avatar manong={manong} size={36} />
        <T w={800} style={{ fontSize: 20 }}>
          {manong.name}
        </T>
      </View>
      <View style={{ gap: 8 }}>
        {app.state.chat.map((m, i) => (
          <View key={i} style={[s.bubble, m.me ? s.me : s.them]}>
            <T>{m.text.replace('Clariso', manong.first)}</T>
          </View>
        ))}
      </View>
      <ErrorText text={error} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {["I'm at the lobby", 'Please call when you arrive', 'Gate pass is ready'].map((q) => (
          <Pressable key={q} accessibilityRole="button" onPress={() => send(q)} style={s.quick}>
            <T style={{ fontSize: 13 }}>{q}</T>
          </Pressable>
        ))}
      </View>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TextInput
          accessibilityLabel="Message"
          value={text}
          onChangeText={setText}
          onSubmitEditing={() => send(text)}
          returnKeyType="send"
          placeholder={`Message ${manong.first}`}
          placeholderTextColor={C.muted}
          style={s.input}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Send"
          onPress={() => send(text)}
          style={s.send}
        >
          <Icon name="send" size={18} color={C.mango} />
        </Pressable>
      </View>
    </Sheet>
  );
}

// A fixed pattern that reads as a QR code. TODO(backend): a real signed gate pass from the server.
const QR = Array.from({ length: 21 * 21 }, (_, i) => {
  const x = i % 21;
  const y = Math.floor(i / 21);
  const finder = (a: number, b: number) => x >= a && x < a + 7 && y >= b && y < b + 7;
  const inF = finder(0, 0) || finder(14, 0) || finder(0, 14);
  if (inF) {
    const fx = x % 14 === x ? x : x - 14;
    const fy = y % 14 === y ? y : y - 14;
    return (
      fx === 0 || fx === 6 || fy === 0 || fy === 6 || (fx >= 2 && fx <= 4 && fy >= 2 && fy <= 4)
    );
  }
  return (x * 7 + y * 13 + x * y) % 3 === 0;
});

export function QrSheet({ pin, open, close }: { pin: string; open: boolean; close: () => void }) {
  return (
    <Sheet open={open} onClose={close}>
      <View style={{ alignItems: 'center', gap: 4 }}>
        <T w={800} style={{ fontSize: 20 }}>
          Lobby gate pass
        </T>
        <Sub style={{ fontSize: 14 }}>Show this to Tower 1 security.</Sub>
      </View>
      <View style={s.qr} accessibilityLabel={`QR gate pass, PIN ${pin}`}>
        {QR.map((on, i) => (
          <View
            key={i}
            style={{ width: '4.7619%', aspectRatio: 1, backgroundColor: on ? C.ink : C.white }}
          />
        ))}
      </View>
      <T w={800} style={{ textAlign: 'center', fontSize: 20, letterSpacing: 1.5 }}>
        PIN: {pin}
      </T>
      <Btn label="Done" onPress={close} />
    </Sheet>
  );
}

// TODO(backend): real calls go through the dialer or a masked-number service; the mock shows a call screen.
export function CallScreen({
  manong,
  open,
  close,
}: {
  manong: Manong;
  open: boolean;
  close: () => void;
}) {
  const [secs, setSecs] = useState(0);
  const [mute, setMute] = useState(false);
  const [speaker, setSpeaker] = useState(false);
  useEffect(() => {
    if (!open) return;
    setSecs(0);
    const t = setInterval(() => setSecs((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, [open]);
  return (
    <Modal visible={open} animationType="fade" onRequestClose={close}>
      <SafeAreaView style={s.call}>
        <View style={{ alignItems: 'center', gap: 8, marginTop: 80 }}>
          <Avatar manong={manong} size={110} />
          <T w={700} style={{ fontSize: 24, color: C.white }}>
            {manong.name}
          </T>
          <T
            style={{ color: '#ccc' }}
          >{`${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`}</T>
        </View>
        <View style={s.callRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Mute"
            accessibilityState={{ selected: mute }}
            onPress={() => setMute(!mute)}
            style={[s.callBtn, mute && s.callOn]}
          >
            <Icon name={mute ? 'mic-off' : 'mic'} size={24} color={mute ? C.ink : C.white} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="End call"
            onPress={close}
            style={[s.callBtn, { backgroundColor: C.destructive }]}
          >
            <Icon name="phone-off" size={24} color={C.white} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Speaker"
            accessibilityState={{ selected: speaker }}
            onPress={() => setSpeaker(!speaker)}
            style={[s.callBtn, speaker && s.callOn]}
          >
            <Icon name="volume-2" size={24} color={speaker ? C.ink : C.white} />
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const s = StyleSheet.create({
  bubble: { maxWidth: '82%', borderRadius: R.card, padding: 12 },
  me: { alignSelf: 'flex-end', backgroundColor: C.mangoSoft },
  them: { alignSelf: 'flex-start', backgroundColor: C.cloud },
  quick: {
    borderWidth: 1.5,
    borderColor: C.line,
    borderRadius: R.full,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 36,
  },
  input: {
    flex: 1,
    height: 48,
    borderRadius: R.full,
    backgroundColor: C.cloud,
    paddingHorizontal: 16,
    fontFamily: F[400],
    fontSize: 15,
    color: C.ink,
  },
  send: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: C.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qr: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 210,
    alignSelf: 'center',
    padding: 10,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: C.line,
    borderRadius: R.control,
  },
  call: { flex: 1, backgroundColor: C.ink, justifyContent: 'space-between', paddingBottom: 60 },
  callRow: { flexDirection: 'row', justifyContent: 'center', gap: 28 },
  callBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  callOn: { backgroundColor: C.white },
});
