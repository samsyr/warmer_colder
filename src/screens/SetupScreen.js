import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Location from 'expo-location';
import { validateCoordinate } from '../utils/geo';
import { RandomDestinationPicker } from '../utils/RandomDestinationPicker';

export default function SetupScreen({ onStart }) {
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');
  const [error, setError] = useState(null);
  const [locating, setLocating] = useState(false);
  const [picking, setPicking] = useState(false);

  const useCurrent = async () => {
    setError(null);
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission is required to use your position.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLat(pos.coords.latitude.toFixed(6));
      setLon(pos.coords.longitude.toFixed(6));
    } catch (e) {
      setError('Could not read your current location. Try again outdoors.');
    } finally {
      setLocating(false);
    }
  };

  const pickRandom = async () => {
    setError(null);
    setPicking(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission is required to pick a random destination.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const picker = new RandomDestinationPicker(pos.coords);
      const dest = picker.pick();
      setLat(dest.latitude.toFixed(6));
      setLon(dest.longitude.toFixed(6));
    } catch (e) {
      setError('Could not read your current location. Try again outdoors.');
    } finally {
      setPicking(false);
    }
  };

  const start = () => {
    const err = validateCoordinate(lat, lon);
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    onStart({ latitude: Number(lat), longitude: Number(lon) });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <Text style={styles.eyebrow}>WARMER / COLDER</Text>
        <Text style={styles.title}>Where are we headed?</Text>
        <Text style={styles.subtitle}>
          Enter the target coordinates. From there, the only guidance is warmer
          or colder.
        </Text>

        <Text style={styles.label}>Latitude</Text>
        <TextInput
          style={styles.input}
          value={lat}
          onChangeText={setLat}
          placeholder="60.169857"
          placeholderTextColor="#5A5A66"
          keyboardType="numbers-and-punctuation"
          autoCorrect={false}
        />

        <Text style={styles.label}>Longitude</Text>
        <TextInput
          style={styles.input}
          value={lon}
          onChangeText={setLon}
          placeholder="24.938379"
          placeholderTextColor="#5A5A66"
          keyboardType="numbers-and-punctuation"
          autoCorrect={false}
        />

        <Pressable style={styles.secondary} onPress={useCurrent} disabled={locating || picking}>
          {locating ? (
            <ActivityIndicator color="#F5EFE6" />
          ) : (
            <Text style={styles.secondaryText}>Use my current location</Text>
          )}
        </Pressable>

        <Pressable style={styles.secondary} onPress={pickRandom} disabled={locating || picking}>
          {picking ? (
            <ActivityIndicator color="#F5EFE6" />
          ) : (
            <Text style={styles.secondaryText}>Pick random destination nearby</Text>
          )}
        </Pressable>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={styles.primary} onPress={start}>
          <Text style={styles.primaryText}>Start</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0E0E12' },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
  eyebrow: {
    color: '#FF8A4C',
    fontSize: 13,
    letterSpacing: 3,
    fontWeight: '700',
    marginBottom: 10,
  },
  title: { color: '#F5EFE6', fontSize: 32, fontWeight: '800', marginBottom: 8 },
  subtitle: { color: '#9A9AA6', fontSize: 15, lineHeight: 22, marginBottom: 28 },
  label: {
    color: '#7A7A88',
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#181821',
    color: '#F5EFE6',
    fontSize: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 18,
  },
  secondary: { paddingVertical: 12, alignItems: 'center', marginBottom: 8 },
  secondaryText: { color: '#4DA8FF', fontSize: 15, fontWeight: '600' },
  error: { color: '#FF6B6B', fontSize: 14, marginBottom: 12, textAlign: 'center' },
  primary: {
    backgroundColor: '#FF8A4C',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryText: { color: '#1A0E06', fontSize: 18, fontWeight: '800' },
});
