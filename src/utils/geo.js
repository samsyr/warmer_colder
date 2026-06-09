// Great-circle ("as the crow flies") distance via the haversine formula (spec §8).

const EARTH_RADIUS_M = 6371000;

const toRad = (deg) => (deg * Math.PI) / 180;

/**
 * Distance in metres between two { latitude, longitude } points.
 */
export function haversineMeters(a, b) {
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Basic coordinate validation. Returns null if valid, or an error string.
 */
export function validateCoordinate(latStr, lonStr) {
  const lat = Number(latStr);
  const lon = Number(lonStr);
  if (latStr.trim() === '' || lonStr.trim() === '') {
    return 'Enter both latitude and longitude.';
  }
  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return 'Latitude and longitude must be numbers.';
  }
  if (lat < -90 || lat > 90) {
    return 'Latitude must be between -90 and 90.';
  }
  if (lon < -180 || lon > 180) {
    return 'Longitude must be between -180 and 180.';
  }
  return null;
}
