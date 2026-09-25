import { describe, it, expect } from 'vitest';
import { handAngles, clockFace, digitalClock } from './ClockFace';

describe('handAngles', () => {
  it('moves the hour hand proportionally', () => {
    expect(handAngles(3, 30)).toEqual({ hour: 105, minute: 180 });
    expect(handAngles(12, 0)).toEqual({ hour: 0, minute: 0 });
    expect(handAngles(15, 45)).toEqual({ hour: 112.5, minute: 270 });
  });
});

describe('clockFace', () => {
  it('draws 12 numbers and two rotated hands', () => {
    const svg = clockFace(3, 30);
    expect(svg.querySelectorAll('.clock-number')).toHaveLength(12);
    expect(svg.querySelector('.hand-hour')!.getAttribute('transform')).toBe('rotate(105 100 100)');
    expect(svg.querySelector('.hand-minute')!.getAttribute('transform')).toBe('rotate(180 100 100)');
  });
});

describe('digitalClock', () => {
  it('shows the padded time', () => {
    expect(digitalClock(9, 5).textContent).toBe('09:05');
  });
});
