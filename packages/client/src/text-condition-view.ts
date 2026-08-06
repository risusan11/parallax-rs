import type { TextConditionLayer, Vector2 } from '@parallax-rs/core';

export interface ConditionTextLine {
  readonly id: string;
  readonly content: string;
  readonly pixelX: number;
  readonly pixelY: number;
}

const LINE_HEIGHT = 20;

/** 条件テキストレイヤーの各テキストに、origin を起点に縦積みで表示するためのピクセル座標を付与する。 */
export function layoutConditionTexts(
  layer: TextConditionLayer,
  origin: Vector2,
): ReadonlyArray<ConditionTextLine> {
  return layer.texts.map((text, index) => ({
    id: text.id,
    content: text.content,
    pixelX: origin.x,
    pixelY: origin.y + index * LINE_HEIGHT,
  }));
}
