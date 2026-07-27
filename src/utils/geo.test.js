import { haversineMeters, parseCoordinateInput, validateCoordinate } from './geo';

describe('haversineMeters', () => {
  it('returns 0 for identical points', () => {
    const p = { latitude: 60.17, longitude: 24.94 };
    expect(haversineMeters(p, p)).toBe(0);
  });

  it('matches a known reference distance (Helsinki ~ Turku, ~150km)', () => {
    const helsinki = { latitude: 60.1699, longitude: 24.9384 };
    const turku = { latitude: 60.4518, longitude: 22.2666 };
    const d = haversineMeters(helsinki, turku);
    expect(d).toBeGreaterThan(140_000);
    expect(d).toBeLessThan(160_000);
  });

  it('is symmetric', () => {
    const a = { latitude: 10, longitude: 10 };
    const b = { latitude: -10, longitude: -20 };
    expect(haversineMeters(a, b)).toBeCloseTo(haversineMeters(b, a), 6);
  });
});

describe('parseCoordinateInput', () => {
  it('parses a plain "lat, lon" string', () => {
    expect(parseCoordinateInput('60.170, 24.938')).toEqual({
      latStr: '60.170',
      lonStr: '24.938',
    });
  });

  it('parses Google Maps-style copy-paste with surrounding text/parens', () => {
    expect(parseCoordinateInput('(60.170, 24.938)')).toEqual({
      latStr: '60.170',
      lonStr: '24.938',
    });
  });

  it('handles negative numbers', () => {
    expect(parseCoordinateInput('-33.87, 151.21')).toEqual({
      latStr: '-33.87',
      lonStr: '151.21',
    });
  });

  it('returns null when fewer than two numbers are present', () => {
    expect(parseCoordinateInput('60.170')).toBeNull();
    expect(parseCoordinateInput('')).toBeNull();
    expect(parseCoordinateInput(null)).toBeNull();
  });
});

describe('validateCoordinate', () => {
  it('accepts valid coordinates', () => {
    expect(validateCoordinate('60.170', '24.938')).toBeNull();
  });

  it('rejects empty fields', () => {
    expect(validateCoordinate('', '24.938')).not.toBeNull();
    expect(validateCoordinate('60.170', ' ')).not.toBeNull();
  });

  it('rejects non-numeric input', () => {
    expect(validateCoordinate('abc', '24.938')).not.toBeNull();
  });

  it('rejects out-of-range latitude', () => {
    expect(validateCoordinate('91', '24.938')).not.toBeNull();
    expect(validateCoordinate('-91', '24.938')).not.toBeNull();
  });

  it('rejects out-of-range longitude', () => {
    expect(validateCoordinate('60.170', '181')).not.toBeNull();
    expect(validateCoordinate('60.170', '-181')).not.toBeNull();
  });

  it('accepts boundary values', () => {
    expect(validateCoordinate('90', '180')).toBeNull();
    expect(validateCoordinate('-90', '-180')).toBeNull();
  });
});
