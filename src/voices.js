// Voice output — independent of the UI text language (that lives in i18n.js).
// The spoken cue is built from three parts:
//   <trend word>  <number>  <unit>     e.g. "Lämpenee. 305 metriä."

import * as Localization from 'expo-localization';

// Prefer the app's own preferred-language detection (same source config.js
// uses for the UI text) over Intl.DateTimeFormat's resolved locale: Intl reads
// the OS/ICU default locale, which tracks the device's system language and can
// disagree with the app's preferred language — e.g. an iPhone with only
// Finnish added to the app's supported languages shows Finnish UI text (via
// Localization.getLocales()) while Intl still resolves to the system default
// (often English). Falling back to Intl only if expo-localization has nothing.
const deviceLocale =
  Localization.getLocales()?.[0]?.languageTag ??
  Intl.DateTimeFormat().resolvedOptions().locale; // e.g. 'fi-FI'
export const deviceTTSLocale = deviceLocale;

const voiceLang = deviceLocale.split('-')[0].toLowerCase(); // 'fi' from 'fi-FI'

// All locale-specific words in one table. Falls back to English.
const LOCALE_WORDS = {
  en: { warmer: 'Warmer', colder: 'Colder', unit: 'meters' },
  fi: { warmer: 'Lämpenee', colder: 'Kylmenee', unit: 'metriä' },
};
const words = LOCALE_WORDS[voiceLang] ?? LOCALE_WORDS.en;

// Format the number in the device locale, then append the explicit unit word
// so the platform never auto-scales meters to kilometers.
function distance(m) {
  const num = new Intl.NumberFormat(deviceLocale, {
    maximumFractionDigits: 0,
  }).format(m);
  return `${num} ${words.unit}`;
}

export const voicePhrases = {
  start:   null,                                       // silence — user just tapped start
  first:   (m) => distance(m),                         // no trend yet → number + unit only
  warmer:  (m) => `${words.warmer}. ${distance(m)}`,
  colder:  (m) => `${words.colder}. ${distance(m)}`,
  arrived: null,                                       // silence — screen transition is the feedback
};
