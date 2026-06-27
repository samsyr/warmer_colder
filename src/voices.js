// Universal voice cues — distance as a bare number only.
// Digits are rendered in the device language by the TTS engine automatically,
// so no per-language translation is ever needed.
// Trend and arrival feedback are handled by the visual UI.

const deviceLocale = Intl.DateTimeFormat().resolvedOptions().locale;
export const deviceTTSLocale = deviceLocale;

export const voicePhrases = {
  start:   null,              // silence — user just tapped start
  first:   (m) => `${m}`,
  warmer:  (m) => `${m}`,
  colder:  (m) => `${m}`,
  same:    (m) => `${m}`,
  arrived: null,              // silence — screen transition is the feedback
};
