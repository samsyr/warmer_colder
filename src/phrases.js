// Spoken phrase sets (spec §6). One entry per language.
// Each builder takes the rounded remaining distance in metres.

export const PHRASES = {
  en: {
    locale: 'en-US',
    start: 'Tracking started. Start moving.',
    first: (m) => `${m} metres to go.`,
    warmer: (m) => `Warmer. ${m} metres to go.`,
    colder: (m) => `Colder. ${m} metres to go.`,
    same: (m) => `No change. ${m} metres to go.`,
    arrived: 'You found it. Congratulations!',
  },
  fi: {
    locale: 'fi-FI',
    start: 'Seuranta alkoi. Lähde liikkeelle.',
    first: (m) => `Matkaa jäljellä ${m} metriä.`,
    warmer: (m) => `Lämpenee. Matkaa jäljellä ${m} metriä.`,
    colder: (m) => `Kylmenee. Matkaa jäljellä ${m} metriä.`,
    same: (m) => `Ei muutosta. Matkaa jäljellä ${m} metriä.`,
    arrived: 'Löysit kohteen. Onnittelut!',
  },
};
