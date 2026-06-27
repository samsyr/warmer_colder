// Minimal spoken phrase sets keyed by BCP-47 primary language tag.
// Numbers are passed as digits — the TTS engine reads them in the active language.
// Add an entry here to support a new language; no other file needs changing.

export const VOICES = {
  en: {
    start:   'Go.',
    first:   (m) => `${m} metres.`,
    warmer:  (m) => `Warmer. ${m} metres.`,
    colder:  (m) => `Colder. ${m} metres.`,
    same:    (m) => `${m} metres.`,
    arrived: 'Here.',
  },
  fi: {
    start:   'Aloitettu.',
    first:   (m) => `${m} metriä.`,
    warmer:  (m) => `Lämpenee. ${m} metriä.`,
    colder:  (m) => `Kylmenee. ${m} metriä.`,
    same:    (m) => `${m} metriä.`,
    arrived: 'Kohde.',
  },
};

const FALLBACK_LANG = 'en';

// Primary language tag from the device locale (e.g. 'fi-FI' → 'fi').
const deviceLocale = Intl.DateTimeFormat().resolvedOptions().locale;
export const deviceTTSLocale = deviceLocale;

const deviceLang = deviceLocale.split('-')[0].toLowerCase();
export const voicePhrases = VOICES[deviceLang] || VOICES[FALLBACK_LANG];
