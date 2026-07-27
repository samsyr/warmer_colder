import { formatPoint } from './trackFormat';

describe('formatPoint', () => {
  it('joins timestamp, lat, lon, distance with tabs', () => {
    const line = formatPoint({ latitude: 60.1699, longitude: 24.9384 }, 305);
    const fields = line.split('\t');
    expect(fields).toHaveLength(4);
    expect(fields[1]).toBe('60.169900');
    expect(fields[2]).toBe('24.938400');
    expect(fields[3]).toBe('305');
  });

  it('produces a parseable ISO timestamp as the first field', () => {
    const line = formatPoint({ latitude: 0, longitude: 0 }, 0);
    const [timestamp] = line.split('\t');
    expect(new Date(timestamp).toISOString()).toBe(timestamp);
  });

  it('fixes lat/lon to 6 decimal places regardless of input precision', () => {
    const line = formatPoint({ latitude: 1, longitude: -2.5 }, 10);
    const fields = line.split('\t');
    expect(fields[1]).toBe('1.000000');
    expect(fields[2]).toBe('-2.500000');
  });
});
