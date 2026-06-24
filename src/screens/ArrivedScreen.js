import { View, Text, Pressable, StyleSheet, Platform, BackHandler } from 'react-native';
import { getTrackUri } from '../utils/track';
import { UI } from '../i18n';

export default function ArrivedScreen({ target, onRestart }) {
  // The original concept ends with the app closing. A clean self-exit is not
  // portable (iOS forbids it), so this is the canonical end state. On Android
  // we offer a best-effort exit.
  const exit = () => {
    if (Platform.OS === 'android') {
      BackHandler.exitApp();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.badge}>{UI.arrived.badge}</Text>
      <Text style={styles.title}>{UI.arrived.title}</Text>
      <Text style={styles.subtitle}>
        {UI.arrived.subtitle(target.latitude.toFixed(5), target.longitude.toFixed(5))}
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>{UI.arrived.trackLabel}</Text>
        <Text style={styles.cardValue}>{getTrackUri()}</Text>
      </View>

      <Pressable style={styles.primary} onPress={onRestart}>
        <Text style={styles.primaryText}>{UI.arrived.btnStartOver}</Text>
      </Pressable>

      {Platform.OS === 'android' ? (
        <Pressable style={styles.secondary} onPress={exit}>
          <Text style={styles.secondaryText}>{UI.arrived.btnClose}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2A0E06',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  badge: {
    color: '#FF8A4C',
    fontSize: 14,
    letterSpacing: 5,
    fontWeight: '800',
    marginBottom: 12,
  },
  title: { color: '#F5EFE6', fontSize: 30, fontWeight: '800', marginBottom: 8 },
  subtitle: { color: '#C9B7A6', fontSize: 15, lineHeight: 22, marginBottom: 28 },
  card: {
    backgroundColor: '#1C0E08',
    borderRadius: 12,
    padding: 16,
    marginBottom: 28,
  },
  cardLabel: {
    color: '#A8826A',
    fontSize: 11,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  cardValue: { color: '#F5EFE6', fontSize: 13 },
  primary: {
    backgroundColor: '#FF8A4C',
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryText: { color: '#1A0E06', fontSize: 18, fontWeight: '800' },
  secondary: { paddingVertical: 16, alignItems: 'center', marginTop: 4 },
  secondaryText: { color: '#C9B7A6', fontSize: 15, fontWeight: '600' },
});
