import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { STEPS } from '../src/client/steps.js';
import { BOOKING_TYPES } from '../src/utils/contract.js';
import { createBooking, getServices } from './api.js';

function Choice({ label, selected, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.choice, selected && styles.choiceSelected]}
    >
      <Text style={selected && styles.choiceTextSelected}>{label}</Text>
    </Pressable>
  );
}

// shortcut: one index instead of a navigator; move to Expo Router once screens are ported from prototype/.
export default function App() {
  const [index, setIndex] = useState(-1);
  const [services, setServices] = useState([]);
  const [draft, setDraft] = useState({ serviceType: null, bookingType: null, problem: '' });
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    getServices().then(setServices);
  }, []);

  const step = STEPS[index];
  const set = (field) => (value) => setDraft((d) => ({ ...d, [field]: value }));

  async function next() {
    if (step.path === 'review') setBooking(await createBooking(draft));
    setIndex(index + 1);
  }

  function body() {
    switch (step.path) {
      case 'service':
        return services.map((s) => (
          <Choice
            key={s.id}
            label={s.label}
            selected={draft.serviceType === s.id}
            onPress={() => set('serviceType')(s.id)}
          />
        ));
      case 'describe':
        return (
          <TextInput
            accessibilityLabel="Describe the problem"
            multiline
            value={draft.problem}
            onChangeText={set('problem')}
            style={styles.input}
          />
        );
      case 'when':
        return Object.values(BOOKING_TYPES).map((t) => (
          <Choice
            key={t}
            label={t}
            selected={draft.bookingType === t}
            onPress={() => set('bookingType')(t)}
          />
        ));
      case 'review':
        return <Text>{JSON.stringify(draft, null, 2)}</Text>;
      case 'status':
        return <Text>Status: {booking?.status ?? 'No booking yet'}</Text>;
      default:
        return <Text>Placeholder for {step.story}.</Text>;
    }
  }

  // Review can't confirm a booking without the choices the contract needs.
  const blocked = step?.path === 'review' && !(draft.serviceType && draft.bookingType);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.h1}>Mang Juan</Text>
          {step ? (
            <View style={styles.gap}>
              <Text style={styles.h2}>{step.title}</Text>
              {body()}
              <View style={styles.row}>
                <Choice label="Back" onPress={() => setIndex(index - 1)} />
                {index < STEPS.length - 1 && !blocked && <Choice label="Next" onPress={next} />}
              </View>
            </View>
          ) : (
            <View style={styles.gap}>
              {STEPS.map((s, i) => (
                <Choice key={s.path} label={`${i + 1}. ${s.title}`} onPress={() => setIndex(i)} />
              ))}
            </View>
          )}
        </ScrollView>
        <StatusBar style="auto" />
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 16, gap: 16 },
  gap: { gap: 8 },
  row: { flexDirection: 'row', gap: 8 },
  h1: { fontSize: 24, fontWeight: '700' },
  h2: { fontSize: 18, fontWeight: '600' },
  choice: { padding: 12, borderWidth: 1, borderColor: '#ccc', borderRadius: 8 },
  choiceSelected: { backgroundColor: '#222', borderColor: '#222' },
  choiceTextSelected: { color: '#fff' },
  input: { minHeight: 96, padding: 12, borderWidth: 1, borderColor: '#ccc', borderRadius: 8 },
});
