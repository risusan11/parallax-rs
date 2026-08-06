import { describe, expect, it } from 'vitest';
import { canMoveTo, resolveMove } from './movement.js';
import type { Layer } from './stages/schema.js';

const LAYERS: ReadonlyArray<Layer> = [
  {
    id: 'room',
    kind: 'tile',
    tiles: [
      { x: 0, y: 0, type: 'floor' },
      { x: 1, y: 0, type: 'floor' },
      { x: 0, y: 1, type: 'floor' },
    ],
  },
  {
    id: 'axes-and-obstacles',
    kind: 'object',
    objects: [
      { id: 'obstacle-1', type: 'obstacle', position: { x: 1, y: 0 } },
      { id: 'device', type: 'device', position: { x: 0, y: 1 } },
    ],
  },
];

describe('canMoveTo', () => {
  it('returns true for a floor tile without an obstacle', () => {
    expect(canMoveTo(LAYERS, { x: 0, y: 0 })).toBe(true);
  });

  it('returns false for a position outside every tile layer', () => {
    expect(canMoveTo(LAYERS, { x: 5, y: 5 })).toBe(false);
  });

  it('returns false for a floor tile occupied by an obstacle', () => {
    expect(canMoveTo(LAYERS, { x: 1, y: 0 })).toBe(false);
  });

  it('returns true for a floor tile occupied by a non-obstacle object', () => {
    expect(canMoveTo(LAYERS, { x: 0, y: 1 })).toBe(true);
  });
});

describe('resolveMove', () => {
  it('moves to the destination when it is walkable', () => {
    expect(resolveMove(LAYERS, { x: 0, y: 0 }, { x: 0, y: 1 })).toEqual({ x: 0, y: 1 });
  });

  it('stays in place when the destination has an obstacle', () => {
    expect(resolveMove(LAYERS, { x: 0, y: 0 }, { x: 1, y: 0 })).toEqual({ x: 0, y: 0 });
  });

  it('stays in place when the destination is outside the room', () => {
    expect(resolveMove(LAYERS, { x: 0, y: 0 }, { x: -1, y: 0 })).toEqual({ x: 0, y: 0 });
  });
});
