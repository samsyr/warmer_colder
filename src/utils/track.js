// Plain-text track logging (spec §7).
// One control point per line, tab-separated:
//   <ISO timestamp>\t<lat>\t<lon>\t<distance_m>
//
// expo-file-system has no native append, so we keep the lines in memory and
// rewrite the file each tick. Fine for a PoC-length session.
//
// This is the production (native) implementation. The web dev/testing target
// uses track.web.js instead — Metro resolves that automatically for web.

import { File, Paths } from 'expo-file-system';
import { TRACK_FILENAME } from '../config';
import { formatPoint } from './trackFormat';

const file = new File(Paths.document, TRACK_FILENAME);
let lines = [];

export function getTrackUri() {
  return file.uri;
}

export function resetTrack() {
  lines = [];
  file.write('');
}

/**
 * Append one control point.
 * @param {{latitude:number, longitude:number}} coords
 * @param {number} distanceM rounded distance to target in metres
 */
export function appendPoint(coords, distanceM) {
  lines.push(formatPoint(coords, distanceM));
  file.write(lines.join('\n') + '\n');
}
