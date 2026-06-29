// On-device text-to-speech wrapper (spec §6).
// Voice language follows the device locale, independent of the UI language.
// A new utterance cancels any still-playing one so cues never lag reality.
// On first use, picks the highest-quality available voice for the locale.

import * as Speech from 'expo-speech';
import { SPEECH_RATE, SPEECH_PITCH, SPEECH_VOICE } from '../config';
import { deviceTTSLocale } from '../voices';

// Voice quality rank: higher = better. iOS exposes 'Default', 'Enhanced', 'Premium'.
const QUALITY_RANK = { Default: 0, Enhanced: 1, Premium: 2 };

let resolvedVoice = SPEECH_VOICE; // null until pickBestVoice() runs (unless overridden in config)

async function pickBestVoice() {
  if (SPEECH_VOICE !== null) return; // skip auto-select if config forces a specific voice
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    const localeLang = deviceTTSLocale.split('-')[0]; // 'en' from 'en-US'

    const candidates = voices.filter(
      (v) => v.language && v.language.toLowerCase().startsWith(localeLang.toLowerCase())
    );

    if (candidates.length === 0) return;

    candidates.sort((a, b) => {
      const qa = QUALITY_RANK[a.quality] ?? -1;
      const qb = QUALITY_RANK[b.quality] ?? -1;
      return qb - qa;
    });

    resolvedVoice = candidates[0].identifier;
  } catch {
    // Leave resolvedVoice as null — OS picks a default.
  }
}

// Kick off voice selection immediately so it's ready before the first utterance.
pickBestVoice();

function options() {
  return {
    language: deviceTTSLocale,
    rate: SPEECH_RATE,
    pitch: SPEECH_PITCH,
    ...(resolvedVoice ? { voice: resolvedVoice } : {}),
  };
}

export function say(text) {
  if (!text) return;
  Speech.stop();
  Speech.speak(text, options());
}

// Like say(), but returns a Promise that resolves when the utterance finishes
// (or is stopped/errors). Resolves immediately for null/empty text.
export function sayAndWait(text) {
  if (!text) return Promise.resolve();
  Speech.stop();
  return new Promise((resolve) => {
    Speech.speak(text, { ...options(), onDone: resolve, onStopped: resolve, onError: resolve });
  });
}
