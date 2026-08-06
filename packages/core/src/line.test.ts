import { describe, expect, it } from 'vitest';
import { distanceToLine, isPointOnLine, slopeLine, verticalLine } from './line.js';

describe('distanceToLine', () => {
  it('computes distance to a slope line y = a*x + b', () => {
    // y = x (a=1, b=0), point (0, 2) -> distance = 2 / sqrt(2)
    const line = slopeLine(1, 0);
    expect(distanceToLine({ x: 0, y: 2 }, line)).toBeCloseTo(Math.SQRT2);
  });

  it('returns 0 for a point on the slope line', () => {
    const line = slopeLine(2, -3);
    expect(distanceToLine({ x: 1, y: -1 }, line)).toBeCloseTo(0);
  });

  it('computes distance to a horizontal line', () => {
    const line = slopeLine(0, 5);
    expect(distanceToLine({ x: 10, y: 0 }, line)).toBeCloseTo(5);
  });

  it('computes distance to a vertical line x = c', () => {
    const line = verticalLine(3);
    expect(distanceToLine({ x: 7, y: 100 }, line)).toBe(4);
  });

  it('returns 0 for a point on the vertical line', () => {
    const line = verticalLine(3);
    expect(distanceToLine({ x: 3, y: -42 }, line)).toBe(0);
  });
});

describe('isPointOnLine', () => {
  it('returns true for a point exactly on the slope line', () => {
    const line = slopeLine(2, -3);
    expect(isPointOnLine({ x: 5, y: 7 }, line)).toBe(true);
  });

  it('returns false for a point off the slope line', () => {
    const line = slopeLine(2, -3);
    expect(isPointOnLine({ x: 5, y: 8 }, line)).toBe(false);
  });

  it('returns true within epsilon tolerance', () => {
    const line = slopeLine(1, 0);
    expect(isPointOnLine({ x: 1, y: 1 + 1e-10 }, line)).toBe(true);
  });

  it('returns true for a point exactly on the vertical line', () => {
    const line = verticalLine(-2);
    expect(isPointOnLine({ x: -2, y: 999 }, line)).toBe(true);
  });

  it('returns false for a point off the vertical line', () => {
    const line = verticalLine(-2);
    expect(isPointOnLine({ x: -1.99, y: 999 }, line)).toBe(false);
  });
});
