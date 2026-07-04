import * as Localization from 'expo-localization';

// All tunable parameters live here (spec §9). Change them in one place.

// Time between control points, in milliseconds. Default: 10 seconds.
export const CONTROL_INTERVAL_MS = 10000;

// Arrival radius, in metres. Inside this distance the target is "found".
export const ARRIVAL_RADIUS_M = 50;

// Dead-band, in metres. Distance changes smaller than this are treated as
// "no significant change", which suppresses GPS jitter while standing still.
// Set to 0 for the literal warmer-or-colder behaviour of the original game.
export const MIN_DELTA_M = 3;

// The original game has no "no change" state — every cue is warmer or colder.
// When a reading lands inside the dead-band we fall back to the last status
// (which starts as "warmer", so an opening dead-band reading becomes warmer).
// This flag only controls the VOICE for those dead-band readings:
//   true  → speak the last status aloud (e.g. "Warmer. 305 metres").
//   false → stay silent, but still update the on-screen distance and trend.
export const SPEAK_ON_NO_CHANGE = true;

// Speak device default language, but fall back to English if the app doesn't
// have a phrase set for that language.

export const LANGUAGE = Localization.getLocales()?.[0]?.languageCode ?? 'en';
//export const LANGUAGE = 'fi';

// Name of the plain-text track file (in the app document directory).
export const TRACK_FILENAME = 'track.txt';

// Speech quality tuning (spec §9).
// rate: 0.75 is slower than the OS default of 1.0 — easier to catch outdoors.
// pitch: 1.0 is neutral; lower toward 0.9 for a slightly deeper voice.
// voice: null lets the OS pick its best available voice. Set to a voice identifier
//        string (from Speech.getAvailableVoicesAsync) to force a specific engine.
export const SPEECH_RATE  = 0.75;
export const SPEECH_PITCH = 1.0;
export const SPEECH_VOICE = null;
