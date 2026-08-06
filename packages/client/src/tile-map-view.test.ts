import type { TileLayer } from '@parallax-rs/core';
import { describe, expect, it } from 'vitest';
import { gridToPixel, layoutTiles, TILE_SIZE } from './tile-map-view.js';

describe('gridToPixel', () => {
  it('原点からグリッド座標×タイルサイズ分オフセットする', () => {
    expect(gridToPixel({ x: 1, y: -1 }, { x: 100, y: 100 })).toEqual({
      x: 100 + TILE_SIZE,
      y: 100 - TILE_SIZE,
    });
  });

  it('原点そのままなら (0, 0) は原点と一致する', () => {
    expect(gridToPixel({ x: 0, y: 0 }, { x: 320, y: 240 })).toEqual({ x: 320, y: 240 });
  });
});

describe('layoutTiles', () => {
  it('各タイルにピクセル座標を付与する', () => {
    const layer: TileLayer = {
      id: 'room',
      kind: 'tile',
      tiles: [
        { x: 0, y: 0, type: 'floor' },
        { x: 1, y: 0, type: 'floor' },
      ],
    };

    expect(layoutTiles(layer, { x: 0, y: 0 })).toEqual([
      { x: 0, y: 0, pixelX: 0, pixelY: 0 },
      { x: 1, y: 0, pixelX: TILE_SIZE, pixelY: 0 },
    ]);
  });
});
