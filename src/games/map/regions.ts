import type { RegionId, RegionMap } from './types';

/** One dynamic import per region, so Vite emits one chunk per map. */
const LOADERS: Record<RegionId, () => Promise<{ MAP: RegionMap }>> = {
  europe: () => import('./data/europe'),
  americas: () => import('./data/americas'),
  africa: () => import('./data/africa'),
  'asia-oceania': () => import('./data/asia-oceania'),
};

const loaded = new Map<RegionId, RegionMap>();

/** Loads a region's map data; later calls reuse it. A failed load is not cached, so it can be retried. */
export async function loadRegion(id: RegionId): Promise<RegionMap> {
  const cached = loaded.get(id);
  if (cached) return cached;
  const { MAP } = await LOADERS[id]();
  loaded.set(id, MAP);
  return MAP;
}

/** A region loaded earlier with loadRegion. */
export function getRegion(id: RegionId): RegionMap {
  const map = loaded.get(id);
  if (!map) throw new Error(`Map region ${id} is not loaded`);
  return map;
}

export function viewSize(map: RegionMap): { width: number; height: number } {
  const [, , width, height] = map.viewBox.split(' ').map(Number);
  return { width, height };
}
