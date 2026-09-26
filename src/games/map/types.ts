export type RegionId = 'europe' | 'americas' | 'africa' | 'asia-oceania';

export interface MapCountry {
  /** ISO 3166-1 alpha-2, upper case. */
  code: string;
  /** SVG path data in the region's viewBox. */
  d: string;
  /** Too small to tap on the region map: asked in the small-countries level instead. */
  small: boolean;
  /** Centre of the country's largest visible polygon. */
  cx: number;
  cy: number;
  /** Larger side of the visible bounding box. */
  size: number;
}

export interface RegionMap {
  /** "0 0 1000 <height>". */
  viewBox: string;
  countries: readonly MapCountry[];
  /** All land that is not a country of this region, as one path. */
  background: string;
}
