const EARTH_RADIUS_M = 6_371_000;
const TARGET_DISTANCE_M = 1_000;

/**
 * Picks a random destination exactly 1 km from a given origin using the
 * spherical direct (forward) geodesy formula.
 */
export class RandomDestinationPicker {
  constructor(origin) {
    this.origin = origin;
  }

  pick() {
    const bearing = Math.random() * 2 * Math.PI;
    const d = TARGET_DISTANCE_M / EARTH_RADIUS_M;

    const lat1 = (this.origin.latitude * Math.PI) / 180;
    const lon1 = (this.origin.longitude * Math.PI) / 180;

    const lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(d) +
      Math.cos(lat1) * Math.sin(d) * Math.cos(bearing)
    );
    const lon2 =
      lon1 +
      Math.atan2(
        Math.sin(bearing) * Math.sin(d) * Math.cos(lat1),
        Math.cos(d) - Math.sin(lat1) * Math.sin(lat2)
      );

    return {
      latitude: (lat2 * 180) / Math.PI,
      longitude: ((lon2 * 180) / Math.PI + 540) % 360 - 180,
    };
  }
}
