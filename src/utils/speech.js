// On-device text-to-speech wrapper (spec §6).
// Voice language follows the device locale, independent of the UI language.
// A new utterance cancels any still-playing one so cues never lag reality.

import * as Speech from 'expo-speech';
import { SPEECH_RATE, SPEECH_PITCH, SPEECH_VOICE } from '../config';
import { deviceTTSLocale } from '../voices';

const OPTIONS = {
  language: deviceTTSLocale,
  rate:     SPEECH_RATE,
  pitch:    SPEECH_PITCH,
  ...(SPEECH_VOICE ? { voice: SPEECH_VOICE } : {}),
};

export function say(text) {
  Speech.stop();
  Speech.speak(text, OPTIONS);
}

// Like say(), but returns a Promise that resolves when the utterance finishes
// (or is stopped/errors). Use when the caller must wait for speech to complete
// before proceeding (e.g. the start announcement before the first tick).
export function sayAndWait(text) {
  Speech.stop();
  return new Promise((resolve) => {
    Speech.speak(text, { ...OPTIONS, onDone: resolve, onStopped: resolve, onError: resolve });
  });
}
