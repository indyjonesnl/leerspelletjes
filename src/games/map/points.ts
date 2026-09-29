/** Hit radius per point: at most `max`, and at most half the distance to the nearest other point, so tap areas never overlap. */
export function hitRadii(points: readonly { x: number; y: number }[], max = 40): number[] {
  return points.map((p, i) => {
    let nearest = Infinity;
    points.forEach((q, j) => {
      if (j !== i) nearest = Math.min(nearest, Math.hypot(q.x - p.x, q.y - p.y));
    });
    return Math.min(max, nearest / 2);
  });
}
