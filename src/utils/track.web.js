// WEB IS A DEV / MANUAL-TESTING TARGET ONLY — not a production platform.
// See the "Running on web (dev/testing only)" section in README.md.
//
// expo-file-system's File/Paths API is not available on web, so there is no
// on-disk track here: control points are kept in memory only and disk I/O is a
// no-op. Metro resolves THIS file for the web platform; native production uses
// track.js. Keep the exported surface identical to track.js.

import { formatPoint } from './trackFormat';

let lines = [];

export function getTrackUri() {
  // No file on disk in the web test build; ArrivedScreen shows this verbatim.
  return '(web test build — track kept in memory, not written to disk)';
}

export function resetTrack() {
  lines = [];
}

/**
 * Append one control point (in memory only on web).
 * @param {{latitude:number, longitude:number}} coords
 * @param {number} distanceM rounded distance to target in metres
 */
export function appendPoint(coords, distanceM) {
  lines.push(formatPoint(coords, distanceM));
}
