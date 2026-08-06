import type { ObjectLayer, Vector2 } from '@parallax-rs/core';
import { gridToPixel } from './tile-map-view.js';

export interface ObjectRect {
  readonly id: string;
  readonly type: string;
  readonly pixelX: number;
  readonly pixelY: number;
}

/** オブジェクトレイヤーの各オブジェクトを、描画用のピクセル座標を付与したリストに変換する。 */
export function layoutObjects(layer: ObjectLayer, origin: Vector2): ReadonlyArray<ObjectRect> {
  return layer.objects.map((object) => {
    const pixel = gridToPixel(object.position, origin);
    return { id: object.id, type: object.type, pixelX: pixel.x, pixelY: pixel.y };
  });
}
