export type Direction = 'left' | 'right' | 'up' | 'down';

export interface Point {
  x: number;
  y: number;
}

/** Index of the point closest to `from` in direction `dir` (screen coordinates, y down), or -1 if none.
 *  Sideways distance counts double, so the pick stays roughly in line with the arrow. */
export function nearestInDirection(from: Point, points: readonly Point[], dir: Direction): number {
  let best = -1;
  let bestScore = Infinity;
  points.forEach((p, i) => {
    const dx = p.x - from.x;
    const dy = p.y - from.y;
    const ahead = dir === 'right' ? dx : dir === 'left' ? -dx : dir === 'down' ? dy : -dy;
    if (ahead <= 0) return;
    const aside = dir === 'left' || dir === 'right' ? Math.abs(dy) : Math.abs(dx);
    const score = ahead + 2 * aside;
    if (score < bestScore) {
      bestScore = score;
      best = i;
    }
  });
  return best;
}
