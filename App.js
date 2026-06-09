import { useState, useCallback } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, StyleSheet } from 'react-native';
import SetupScreen from './src/screens/SetupScreen';
import GameScreen from './src/screens/GameScreen';
import ArrivedScreen from './src/screens/ArrivedScreen';

export default function App() {
  const [phase, setPhase] = useState('setup'); // setup | game | arrived
  const [target, setTarget] = useState(null);

  const startGame = useCallback((coords) => {
    setTarget(coords);
    setPhase('game');
  }, []);

  const arrive = useCallback(() => setPhase('arrived'), []);
  const stopGame = useCallback(() => setPhase('setup'), []);
  const restart = useCallback(() => {
    setTarget(null);
    setPhase('setup');
  }, []);

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="light" />
      {phase === 'setup' && <SetupScreen onStart={startGame} />}
      {phase === 'game' && (
        <GameScreen target={target} onArrive={arrive} onStop={stopGame} />
      )}
      {phase === 'arrived' && (
        <ArrivedScreen target={target} onRestart={restart} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0E0E12' },
});
