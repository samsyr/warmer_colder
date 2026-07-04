// Voice output — independent of the UI text language (that lives in i18n.js).
// The spoken cue is built from three parts:
//   <trend word>  <number>  <unit>     e.g. "Lämpenee. 305 metriä."

const deviceLocale = Intl.DateTimeFormat().resolvedOptions().locale; // e.g. 'fi-FI'
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
