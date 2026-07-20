import { useState, useEffect } from 'react';
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
import { parseCoordinateInput, validateCoordinate } from '../utils/geo';
import { RandomDestinationPicker } from '../utils/RandomDestinationPicker';
import { getHomeLocation, saveHomeLocation } from '../utils/homeLocation';
import { UI } from '../i18n';

export default function SetupScreen({ onStart }) {
  const [coords, setCoords] = useState('');
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const [picking, setPicking] = useState(false);
  const [settingHome, setSettingHome] = useState(false);
  const [home, setHome] = useState(null);

  useEffect(() => {
    getHomeLocation().then(setHome);
  }, []);

  const useHome = () => {
    if (!home) return;
    setError(null);
    setNotice(null);
    setCoords(`${home.latitude.toFixed(6)}, ${home.longitude.toFixed(6)}`);
  };

  const setCurrentAsHome = async () => {
    setError(null);
    setNotice(null);
    setSettingHome(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError(UI.setup.errPermissionHome);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = pos.coords;
      await saveHomeLocation(latitude, longitude);
      setHome({ latitude, longitude });
      setNotice(UI.setup.homeSet);
    } catch {
      // GPS unavailable — fall back to the manually entered coordinates
      const parsed = parseCoordinateInput(coords);
      const err = parsed ? validateCoordinate(parsed.latStr, parsed.lonStr) : UI.geo.errFormat;
      if (parsed && !err) {
        const latitude = Number(parsed.latStr);
        const longitude = Number(parsed.lonStr);
        await saveHomeLocation(latitude, longitude);
        setHome({ latitude, longitude });
        setNotice(UI.setup.homeSet);
      } else {
        setError(UI.setup.errLocation);
      }
    } finally {
      setSettingHome(false);
    }
  };

  const pickRandom = async () => {
    setError(null);
    setNotice(null);
    setPicking(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError(UI.setup.errPermissionRandom);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const picker = new RandomDestinationPicker(pos.coords);
      const dest = picker.pick();
      setCoords(`${dest.latitude.toFixed(6)}, ${dest.longitude.toFixed(6)}`);
    } catch (e) {
      setError(UI.setup.errLocation);
    } finally {
      setPicking(false);
    }
  };

  const start = () => {
    const parsed = parseCoordinateInput(coords);
    if (!parsed) {
      setError(UI.geo.errFormat);
      return;
    }
    const err = validateCoordinate(parsed.latStr, parsed.lonStr);
    if (err) {
      setError(err);
      setNotice(null);
      return;
    }
    setError(null);
    onStart({ latitude: Number(parsed.latStr), longitude: Number(parsed.lonStr) });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        <Text style={styles.eyebrow}>{UI.setup.eyebrow}</Text>
        <Text style={styles.title}>{UI.setup.title}</Text>
        <Text style={styles.subtitle}>{UI.setup.subtitle}</Text>

        <Text style={styles.label}>{UI.setup.labelCoords}</Text>
        <TextInput
          style={styles.input}
          value={coords}
          onChangeText={setCoords}
          placeholder="60.169857, 24.938379"
          placeholderTextColor="#5A5A66"
          keyboardType="numbers-and-punctuation"
          autoCorrect={false}
          autoCapitalize="none"
        />

        <Pressable style={styles.secondary} onPress={pickRandom} disabled={picking}>
          {picking ? (
            <ActivityIndicator color="#F5EFE6" />
          ) : (
            <Text style={styles.secondaryText}>{UI.setup.btnRandom}</Text>
          )}
        </Pressable>

        <Pressable
          style={[styles.secondary, !home && styles.secondaryDisabled]}
          onPress={useHome}
          disabled={!home || picking || settingHome}
        >
          <Text style={styles.secondaryText}>
            {home
              ? UI.setup.btnHome(home.latitude.toFixed(6), home.longitude.toFixed(6))
              : UI.setup.btnHome('?', '?')}
          </Text>
        </Pressable>

        <Pressable
          style={styles.secondary}
          onPress={setCurrentAsHome}
          disabled={picking || settingHome}
        >
          {settingHome ? (
            <ActivityIndicator color="#F5EFE6" />
          ) : (
            <Text style={styles.secondaryText}>
              {home ? UI.setup.btnChangeHome : UI.setup.btnSetHome}
            </Text>
          )}
        </Pressable>

        {home ? (
          <Text style={styles.homeCoords}>
            {UI.setup.homeDisplay(home.latitude.toFixed(6), home.longitude.toFixed(6))}
          </Text>
        ) : null}

        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Pressable style={styles.primary} onPress={start}>
          <Text style={styles.primaryText}>{UI.setup.btnStart}</Text>
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
  secondaryDisabled: { opacity: 0.35 },
  secondaryText: { color: '#4DA8FF', fontSize: 15, fontWeight: '600' },
  homeCoords: { color: '#7A7A88', fontSize: 13, marginBottom: 8, textAlign: 'center' },
  notice: { color: '#4CAF50', fontSize: 14, marginBottom: 8, textAlign: 'center' },
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
