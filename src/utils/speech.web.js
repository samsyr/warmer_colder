// WEB DEV / MANUAL-TESTING speech (see README "Running on web").
// Native production uses speech.js (expo-speech); Metro resolves this file for
// web. Same exported surface: say() and sayAndWait().
//
// The browser Web Speech API has three quirks the native path doesn't:
//   1. Voices load asynchronously — getVoices() is empty until 'voiceschanged'.
//   2. Audio is gated until the first user gesture (autoplay policy), so
//      timer-driven cues stay silent unless the engine was "unlocked" by a tap.
//   3. cancel() called immediately before speak() can swallow the new utterance
//      (a long-standing Chrome bug).
// This wrapper handles all three, and never blocks the game loop if the browser
// has no voices at all.

import { SPEECH_RATE, SPEECH_PITCH } from '../config';
import { deviceTTSLocale } from '../voices';

const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;

// --- (1) keep a populated voice list -------------------------------------
let voices = [];
function loadVoices() {
  if (synth) voices = synth.getVoices() || [];
}
if (synth) {
  loadVoices();
  synth.addEventListener?.('voiceschanged', loadVoices);
}

function pickVoice() {
  if (!voices.length) return null;
  const lang = deviceTTSLocale.toLowerCase();
  const short = lang.split('-')[0];
  return (
    voices.find((v) => v.lang?.toLowerCase() === lang) ||
    voices.find((v) => v.lang?.toLowerCase().startsWith(short)) ||
    voices.find((v) => v.default) ||
    voices[0]
  );
}

// --- (2) unlock the engine on the first user gesture ---------------------
let unlocked = false;
function unlock() {
  if (unlocked || !synth) return;
  unlocked = true;
  try {
    // A near-silent utterance fired inside the gesture primes the engine so
    // later timer-driven cues are allowed to play.
    const primer = new SpeechSynthesisUtterance(' ');
    primer.volume = 0;
    synth.speak(primer);
  } catch {}
}
if (typeof window !== 'undefined') {
  const opts = { once: true, capture: true };
  window.addEventListener('pointerdown', unlock, opts);
  window.addEventListener('keydown', unlock, opts);
}

function build(text) {
  const u = new SpeechSynthesisUtterance(text);
  u.lang = deviceTTSLocale;
  u.rate = SPEECH_RATE;
  u.pitch = SPEECH_PITCH;
  const v = pickVoice();
  // Setting .voice throws if the object isn't a real SpeechSynthesisVoice; never
  // let that drop a cue — fall back to the engine's default voice.
  if (v) {
    try {
      u.voice = v;
    } catch {}
  }
  return u;
}

// --- (3) speak, deferring past cancel() to dodge the Chrome race ----------
export function say(text) {
  if (!synth) return;
  synth.cancel();
  setTimeout(() => synth.speak(build(text)), 0);
}

export function sayAndWait(text) {
  if (!synth) return Promise.resolve();
  synth.cancel();
  return new Promise((resolve) => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      resolve();
    };
    setTimeout(() => {
      const u = build(text);
      u.onend = finish;
      u.onerror = finish;
      synth.speak(u);
    }, 0);
    // Safety net: never stall the loop if the engine never reports back
    // (e.g. a browser/OS with no speech voices installed).
    setTimeout(finish, 6000);
  });
}
