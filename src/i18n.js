import { LANGUAGE } from './config';

const strings = {
  en: {
    setup: {
      eyebrow:           'WARMER / COLDER',
      title:             'Where are we headed?',
      subtitle:          'Enter the target coordinates. From there, the only guidance is warmer or colder.',
      labelLat:          'Latitude',
      labelLon:          'Longitude',
      btnCurrentLocation:'Use my current location',
      btnRandom:         'Pick random destination nearby',
      btnStart:          'Start',
      errPermission:     'Location permission is required to use your position.',
      errPermissionRandom:'Location permission is required to pick a random destination.',
      errLocation:       'Could not read your current location. Try again outdoors.',
    },
    game: {
      warmer:    'WARMER',
      colder:    'COLDER',
      noChange:  'NO CHANGE',
      error:     'ERROR',
      unit:      'metres to go · as the crow flies',
      reading:   'reading',
      readings:  'readings',
      interval:  '· every 10 s',
      btnStop:   'Stop',
    },
    arrived: {
      badge:       'FOUND IT',
      title:       'You reached the target.',
      subtitle:    (lat, lon) => `Within 100 metres of ${lat}, ${lon}.`,
      trackLabel:  'TRACK SAVED TO',
      btnStartOver:'Start over',
      btnClose:    'Close app',
    },
    hook: {
      errPermission: 'Location permission is required. Enable it in settings and try again.',
      noticeSkipped: 'Skipped a reading (no GPS fix). Trying again.',
    },
    geo: {
      errBothRequired: 'Enter both latitude and longitude.',
      errNotNumbers:   'Latitude and longitude must be numbers.',
      errLatRange:     'Latitude must be between -90 and 90.',
      errLonRange:     'Longitude must be between -180 and 180.',
    },
  },

  fi: {
    setup: {
      eyebrow:            'LÄMPIMÄMPI / KYLMEMPI',
      title:              'Minne mennään?',
      subtitle:           'Syötä kohteen koordinaatit. Ainoa opastus matkan varrella on lämpenee tai kylmenee.',
      labelLat:           'Leveysaste',
      labelLon:           'Pituusaste',
      btnCurrentLocation: 'Käytä sijaintiani',
      btnRandom:          'Arvo satunnainen kohde läheltä',
      btnStart:           'Aloita',
      errPermission:      'Sijaintilupa vaaditaan sijainnin käyttämiseen.',
      errPermissionRandom:'Sijaintilupa vaaditaan kohteen arvontaan.',
      errLocation:        'Sijaintia ei voitu lukea. Kokeile ulkona.',
    },
    game: {
      warmer:   'LÄMPENEE',
      colder:   'KYLMENEE',
      noChange: 'EI MUUTOSTA',
      error:    'VIRHE',
      unit:     'metriä jäljellä · linnuntietä',
      reading:  'mittaus',
      readings: 'mittausta',
      interval: '· 10 s välein',
      btnStop:  'Lopeta',
    },
    arrived: {
      badge:       'LÖYSIT SEN',
      title:       'Saavuit kohteeseen.',
      subtitle:    (lat, lon) => `Alle 100 metrin päässä pisteestä ${lat}, ${lon}.`,
      trackLabel:  'REITTI TALLENNETTU',
      btnStartOver:'Aloita alusta',
      btnClose:    'Sulje sovellus',
    },
    hook: {
      errPermission: 'Sijaintilupa vaaditaan. Ota se käyttöön asetuksista.',
      noticeSkipped: 'Mittaus ohitettu (ei GPS-signaalia). Yritetään uudelleen.',
    },
    geo: {
      errBothRequired: 'Syötä sekä leveys- että pituusaste.',
      errNotNumbers:   'Leveys- ja pituusasteen on oltava lukuja.',
      errLatRange:     'Leveysasteen on oltava välillä -90 ja 90.',
      errLonRange:     'Pituusasteen on oltava välillä -180 ja 180.',
    },
  },
};

export const UI = strings[LANGUAGE] ?? strings.en;
