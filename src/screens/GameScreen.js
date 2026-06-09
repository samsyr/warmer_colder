import { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useWarmerColder } from '../hooks/useWarmerColder';

// Signature element (frontend-design): the whole screen takes on the
// temperature of the feedback — ember-warm when warmer, slate-cold when colder.
const THEME = {
  warmer: { bg: '#2A0E06', accent: '#FF8A4C', word: 'WARMER' },
  colder: { bg: '#06121F', accent: '#4DA8FF', word: 'COLDER' },
  same: { bg: '#15151C', accent: '#9A9AA6', word: 'NO CHANGE' },
  idle: { bg: '#0E0E12', accent: '#9A9AA6', word: '—' },
};

export default function GameScreen({ target, onArrive, onStop }) {
  const { status, distance, trend, pointCount, notice, error, start, stop } =
    useWarmerColder(target, onArrive);

  // Auto-start once on mount.
  useEffect(() => {
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const theme = THEME[trend] || THEME.idle;

  const stopNow = () => {
    stop();
    onStop();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={styles.top}>
        <Text style={[styles.trendWord, { color: theme.accent }]}>
          {error ? 'ERROR' : theme.word}
        </Text>
      </View>

      <View style={styles.center}>
        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <>
            <Text style={[styles.distance, { color: theme.accent }]}>
              {distance == null ? '···' : distance}
            </Text>
            <Text style={styles.unit}>metres to go · as the crow flies</Text>
          </>
        )}
      </View>

      <View style={styles.bottom}>
        <Text style={styles.meta}>
          {pointCount} {pointCount === 1 ? 'reading' : 'readings'} · every 10 s
        </Text>
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
        <Pressable style={styles.stop} onPress={stopNow}>
          <Text style={styles.stopText}>Stop</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 28, paddingVertical: 40 },
  top: { alignItems: 'center', paddingTop: 24 },
  trendWord: { fontSize: 18, letterSpacing: 6, fontWeight: '800' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  distance: { fontSize: 120, fontWeight: '900', letterSpacing: -4 },
  unit: { color: '#9A9AA6', fontSize: 14, letterSpacing: 1, marginTop: 4 },
  bottom: { alignItems: 'center' },
  meta: { color: '#7A7A88', fontSize: 13, letterSpacing: 1, marginBottom: 6 },
  notice: { color: '#FFB454', fontSize: 13, marginBottom: 10, textAlign: 'center' },
  error: { color: '#FF6B6B', fontSize: 16, textAlign: 'center', lineHeight: 24 },
  stop: {
    borderWidth: 1.5,
    borderColor: '#3A3A46',
    paddingVertical: 14,
    paddingHorizontal: 48,
    borderRadius: 14,
    marginTop: 8,
  },
  stopText: { color: '#F5EFE6', fontSize: 16, fontWeight: '700' },
});
