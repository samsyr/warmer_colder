// Plain-text track logging (spec §7).
// One control point per line, tab-separated:
//   <ISO timestamp>\t<lat>\t<lon>\t<distance_m>
//
// expo-file-system has no native append, so we keep the lines in memory and
// rewrite the file each tick. Fine for a PoC-length session.

import { Platform } from 'react-native';
import { File, Paths } from 'expo-file-system';
import { TRACK_FILENAME } from '../config';

// expo-file-system's File/Paths API is not supported on web. Degrade to an
// in-memory-only track there, and create the file lazily so importing this
// module never throws during web bundle evaluation.
const fileSupported = Platform.OS !== 'web';
let file = null;
function getFile() {
  if (fileSupported && !file) file = new File(Paths.document, TRACK_FILENAME);
  return file;
}

let lines = [];

export function getTrackUri() {
  return getFile()?.uri ?? null;
}

export function resetTrack() {
  lines = [];
  getFile()?.write('');
}

/**
 * Append one control point.
 * @param {{latitude:number, longitude:number}} coords
 * @param {number} distanceM rounded distance to target in metres
 */
export function appendPoint(coords, distanceM) {
  const line = [
    new Date().toISOString(),
    coords.latitude.toFixed(6),
    coords.longitude.toFixed(6),
    distanceM,
  ].join('\t');

  lines.push(line);
  getFile()?.write(lines.join('\n') + '\n');
}
