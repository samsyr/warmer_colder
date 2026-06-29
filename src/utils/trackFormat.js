// Shared, platform-agnostic formatting for one track control point (spec §7):
//   <ISO timestamp>\t<lat>\t<lon>\t<distance_m>
//
// Kept separate from track.js so the web testing stub (track.web.js) can reuse
// the exact same line format without pulling in expo-file-system.
export function formatPoint(coords, distanceM) {
  return [
    new Date().toISOString(),
    coords.latitude.toFixed(6),
    coords.longitude.toFixed(6),
    distanceM,
  ].join('\t');
}
