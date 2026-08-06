import { describe, expect, it } from 'vitest';
import { add, distance, segmentsIntersect, subtract } from './vector.js';

describe('add', () => {
  it('adds two vectors component-wise', () => {
    expect(add({ x: 1, y: 2 }, { x: 3, y: -1 })).toEqual({ x: 4, y: 1 });
  });
});

describe('subtract', () => {
  it('subtracts two vectors component-wise', () => {
    expect(subtract({ x: 5, y: 2 }, { x: 3, y: -1 })).toEqual({ x: 2, y: 3 });
  });
});

describe('distance', () => {
  it('computes euclidean distance between two points', () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
  });

  it('returns 0 for identical points', () => {
    expect(distance({ x: 1, y: 1 }, { x: 1, y: 1 })).toBe(0);
  });
});

describe('segmentsIntersect', () => {
  it('detects a crossing intersection', () => {
    const p1 = { x: 0, y: 0 };
    const p2 = { x: 4, y: 4 };
    const p3 = { x: 0, y: 4 };
    const p4 = { x: 4, y: 0 };
    expect(segmentsIntersect(p1, p2, p3, p4)).toBe(true);
  });

  it('returns false for parallel non-overlapping segments', () => {
    const p1 = { x: 0, y: 0 };
    const p2 = { x: 4, y: 0 };
    const p3 = { x: 0, y: 1 };
    const p4 = { x: 4, y: 1 };
    expect(segmentsIntersect(p1, p2, p3, p4)).toBe(false);
  });

  it('returns false for disjoint segments', () => {
    const p1 = { x: 0, y: 0 };
    const p2 = { x: 1, y: 1 };
    const p3 = { x: 5, y: 5 };
    const p4 = { x: 6, y: 6 };
    expect(segmentsIntersect(p1, p2, p3, p4)).toBe(false);
  });

  it('detects touching at an endpoint', () => {
    const p1 = { x: 0, y: 0 };
    const p2 = { x: 2, y: 2 };
    const p3 = { x: 2, y: 2 };
    const p4 = { x: 4, y: 0 };
    expect(segmentsIntersect(p1, p2, p3, p4)).toBe(true);
  });

  it('detects collinear overlapping segments', () => {
    const p1 = { x: 0, y: 0 };
    const p2 = { x: 2, y: 0 };
    const p3 = { x: 1, y: 0 };
    const p4 = { x: 3, y: 0 };
    expect(segmentsIntersect(p1, p2, p3, p4)).toBe(true);
  });

  it('returns false for collinear disjoint segments', () => {
    const p1 = { x: 0, y: 0 };
    const p2 = { x: 1, y: 0 };
    const p3 = { x: 2, y: 0 };
    const p4 = { x: 3, y: 0 };
    expect(segmentsIntersect(p1, p2, p3, p4)).toBe(false);
  });
});
