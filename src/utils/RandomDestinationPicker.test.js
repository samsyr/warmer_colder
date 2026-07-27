import { RandomDestinationPicker } from './RandomDestinationPicker';
import { haversineMeters } from './geo';

describe('RandomDestinationPicker', () => {
  it('picks a point ~1km from the origin, repeatedly', () => {
    const origin = { latitude: 60.17, longitude: 24.94 };
    const picker = new RandomDestinationPicker(origin);

    for (let i = 0; i < 50; i++) {
      const dest = picker.pick();
      const d = haversineMeters(origin, dest);
      // Forward-geodesy + haversine round-trip; allow a small tolerance.
      expect(d).toBeGreaterThan(995);
      expect(d).toBeLessThan(1005);
    }
  });

  it('returns coordinates within valid lat/lon ranges, including near the antimeridian', () => {
    const origin = { latitude: 10, longitude: 179.999 };
    const picker = new RandomDestinationPicker(origin);

    for (let i = 0; i < 50; i++) {
      const dest = picker.pick();
      expect(dest.latitude).toBeGreaterThanOrEqual(-90);
      expect(dest.latitude).toBeLessThanOrEqual(90);
      expect(dest.longitude).toBeGreaterThanOrEqual(-180);
      expect(dest.longitude).toBeLessThanOrEqual(180);
    }
  });

  it('varies the bearing across picks (not always the same destination)', () => {
    const origin = { latitude: 60.17, longitude: 24.94 };
    const picker = new RandomDestinationPicker(origin);
    const destinations = new Set(
      Array.from({ length: 10 }, () => JSON.stringify(picker.pick()))
    );
    expect(destinations.size).toBeGreaterThan(1);
  });
});
