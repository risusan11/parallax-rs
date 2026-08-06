import type { ObjectLayer } from '@parallax-rs/core';
import { describe, expect, it } from 'vitest';
import { layoutObjects } from './object-map-view.js';
import { TILE_SIZE } from './tile-map-view.js';

describe('layoutObjects', () => {
  it('各オブジェクトにピクセル座標を付与する', () => {
    const layer: ObjectLayer = {
      id: 'axes-and-obstacles',
      kind: 'object',
      objects: [
        { id: 'device', type: 'device', position: { x: 0, y: -3 } },
        { id: 'obstacle-1', type: 'obstacle', position: { x: 1, y: -1 } },
      ],
    };

    expect(layoutObjects(layer, { x: 0, y: 0 })).toEqual([
      { id: 'device', type: 'device', pixelX: 0, pixelY: -3 * TILE_SIZE },
      { id: 'obstacle-1', type: 'obstacle', pixelX: TILE_SIZE, pixelY: -TILE_SIZE },
    ]);
  });

  it('オブジェクトが無ければ空配列を返す', () => {
    const layer: ObjectLayer = { id: 'empty', kind: 'object', objects: [] };
    expect(layoutObjects(layer, { x: 320, y: 240 })).toEqual([]);
  });
});
