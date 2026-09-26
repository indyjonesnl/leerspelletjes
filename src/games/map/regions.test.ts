import { describe, it, expect } from 'vitest';
import { getRegion, loadRegion, viewSize } from './regions';

describe('regions', () => {
  it('throws for a region that was not loaded', () => {
    expect(() => getRegion('africa')).toThrow('africa');
  });

  it('loads a region once and reuses it', async () => {
    const map = await loadRegion('europe');
    expect(await loadRegion('europe')).toBe(map);
    expect(getRegion('europe')).toBe(map);
  });

  it('reads the size from the viewBox', () => {
    expect(viewSize({ viewBox: '0 0 1000 716', countries: [], background: '' })).toEqual({ width: 1000, height: 716 });
  });
});
