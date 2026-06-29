// Voice output — independent of the UI text language (that lives in i18n.js).
// The spoken cue is built from three parts:
//   <trend word>  <number>  <unit>     e.g. "Lämpenee. 305 metriä."
//
// Two of the three parts need NO per-language configuration:
//   • the number  — the TTS engine reads digits in the device language.
//   • the unit     — Intl.NumberFormat renders the localized unit word
//                     ("metriä", "meters", "mètres", "Meter"…) offline.
// Only the trend word (warmer/colder) cannot be auto-translated, so it comes
// from a minimal 2-word table. Add a language with two lines; everything else
// stays automatic.

const deviceLocale = Intl.DateTimeFormat().resolvedOptions().locale; // e.g. 'fi-FI'
export const deviceTTSLocale = deviceLocale;

const voiceLang = deviceLocale.split('-')[0].toLowerCase(); // 'fi' from 'fi-FI'

// The only words that require translation. Falls back to English.
const TREND_WORDS = {
  en: { warmer: 'Warmer', colder: 'Colder' },
  fi: { warmer: 'Lämpenee', colder: 'Kylmenee' },
};
const words = TREND_WORDS[voiceLang] ?? TREND_WORDS.en;

// "305 metriä" / "305 meters" — localized unit, zero config, offline.
// Falls back to the bare number if the engine lacks Intl unit support.
function distance(m) {
  try {
    return new Intl.NumberFormat(deviceLocale, {
      style: 'unit',
      unit: 'meter',
      unitDisplay: 'long',
      maximumFractionDigits: 0,
    }).format(m);
  } catch {
    return `${m}`;
  }
}

export const voicePhrases = {
  start:   null,                                       // silence — user just tapped start
  first:   (m) => distance(m),                         // no trend yet → number + unit only
  warmer:  (m) => `${words.warmer}. ${distance(m)}`,
  colder:  (m) => `${words.colder}. ${distance(m)}`,
  arrived: null,                                       // silence — screen transition is the feedback
};
