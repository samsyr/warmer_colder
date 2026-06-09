// On-device text-to-speech wrapper (spec §6).
// A new utterance cancels any still-playing one so cues never lag reality.

import * as Speech from 'expo-speech';
import { LANGUAGE } from '../config';
import { PHRASES } from '../phrases';

const set = PHRASES[LANGUAGE] || PHRASES.en;

export function say(text) {
  Speech.stop();
  Speech.speak(text, { language: set.locale });
}
