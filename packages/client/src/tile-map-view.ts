import type { TileLayer, Vector2 } from '@parallax-rs/core';

/** タイル1マスのピクセルサイズ。 */
export const TILE_SIZE = 32;

export interface TileRect {
  readonly x: number;
  readonly y: number;
  readonly pixelX: number;
  readonly pixelY: number;
}

/** ゲーム内グリッド座標を、指定した原点基準のピクセル座標(タイル中心)に変換する。 */
export function gridToPixel(position: Vector2, origin: Vector2): Vector2 {
  return {
    x: origin.x + position.x * TILE_SIZE,
    y: origin.y + position.y * TILE_SIZE,
  };
}

/** タイルレイヤーの各マスを、描画用のピクセル座標を付与したリストに変換する。 */
export function layoutTiles(layer: TileLayer, origin: Vector2): ReadonlyArray<TileRect> {
  return layer.tiles.map((tile) => {
    const pixel = gridToPixel(tile, origin);
    return { x: tile.x, y: tile.y, pixelX: pixel.x, pixelY: pixel.y };
  });
}
