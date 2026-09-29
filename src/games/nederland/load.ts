import type { RegionMap } from '../map/types';

export interface NlData {
  map: RegionMap;
  capitals: readonly { code: string; x: number; y: number }[];
}

let loaded: NlData | undefined;

/** Loads the Netherlands map (its own chunk); later calls reuse it. A failed load is not cached, so it can be retried. */
export async function loadNl(): Promise<NlData> {
  if (loaded) return loaded;
  const { MAP, CAPITAL_POINTS } = await import('./data/nl');
  loaded = { map: MAP, capitals: CAPITAL_POINTS };
  return loaded;
}

/** The data loaded earlier with loadNl. */
export function getNl(): NlData {
  if (!loaded) throw new Error('Netherlands map is not loaded');
  return loaded;
}
