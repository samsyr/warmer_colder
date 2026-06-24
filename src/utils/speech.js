// On-device text-to-speech wrapper (spec §6).
// A new utterance cancels any still-playing one so cues never lag reality.
// On first use, picks the highest-quality available voice for the locale.

import * as Speech from 'expo-speech';
import { LANGUAGE, SPEECH_RATE, SPEECH_PITCH, SPEECH_VOICE } from '../config';
import { PHRASES } from '../phrases';

const set = PHRASES[LANGUAGE] || PHRASES.en;

// Voice quality rank: higher = better. iOS exposes 'Default', 'Enhanced', 'Premium'.
const QUALITY_RANK = { Default: 0, Enhanced: 1, Premium: 2 };

let resolvedVoice = SPEECH_VOICE; // null until pickBestVoice() runs (unless overridden in config)
let voiceReady = SPEECH_VOICE !== null; // skip auto-select if config forces a specific voice

async function pickBestVoice() {
  try {
    const voices = await Speech.getAvailableVoicesAsync();
    const localeLang = set.locale.split('-')[0]; // 'en' from 'en-US'

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
  } finally {
    voiceReady = true;
  }
}

// Kick off voice selection immediately so it's ready before the first utterance.
pickBestVoice();

function options() {
  return {
    language: set.locale,
    rate: SPEECH_RATE,
    pitch: SPEECH_PITCH,
    ...(resolvedVoice ? { voice: resolvedVoice } : {}),
  };
}

export function say(text) {
  Speech.stop();
  Speech.speak(text, options());
}

// Like say(), but returns a Promise that resolves when the utterance finishes
// (or is stopped/errors). Use this when the caller must wait for speech to
// complete before proceeding (e.g. the start announcement before the first tick).
export function sayAndWait(text) {
  Speech.stop();
  return new Promise((resolve) => {
    Speech.speak(text, { ...options(), onDone: resolve, onStopped: resolve, onError: resolve });
  });
}
