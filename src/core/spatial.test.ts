import { describe, it, expect } from 'vitest';
import { nearestInDirection } from './spatial';

const origin = { x: 0, y: 0 };
const cross = [{ x: 10, y: 0 }, { x: 0, y: 10 }, { x: -10, y: 0 }, { x: 0, y: -10 }];

describe('nearestInDirection', () => {
  it('finds the neighbour in each direction (y grows downwards)', () => {
    expect(nearestInDirection(origin, cross, 'right')).toBe(0);
    expect(nearestInDirection(origin, cross, 'down')).toBe(1);
    expect(nearestInDirection(origin, cross, 'left')).toBe(2);
    expect(nearestInDirection(origin, cross, 'up')).toBe(3);
  });

  it('prefers points in line with the arrow', () => {
    expect(nearestInDirection(origin, [{ x: 10, y: 8 }, { x: 15, y: 0 }], 'right')).toBe(1);
  });

  it('returns -1 when nothing lies in that direction', () => {
    expect(nearestInDirection(origin, [{ x: -5, y: 0 }], 'right')).toBe(-1);
    expect(nearestInDirection(origin, [], 'up')).toBe(-1);
  });
});
