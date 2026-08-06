import type { TextConditionLayer } from '@parallax-rs/core';
import { describe, expect, it } from 'vitest';
import { layoutConditionTexts } from './text-condition-view.js';

describe('layoutConditionTexts', () => {
  it('各テキストに origin から縦積みのピクセル座標を付与する', () => {
    const layer: TextConditionLayer = {
      id: 'condition-text',
      kind: 'textCondition',
      texts: [
        { id: 'a', content: '直線 y = 2x - 3 上、かつ装置から距離5の地点へ観測者を導け。' },
        { id: 'b', content: '2つ目のヒント' },
      ],
    };

    expect(layoutConditionTexts(layer, { x: 16, y: 420 })).toEqual([
      { id: 'a', content: '直線 y = 2x - 3 上、かつ装置から距離5の地点へ観測者を導け。', pixelX: 16, pixelY: 420 },
      { id: 'b', content: '2つ目のヒント', pixelX: 16, pixelY: 440 },
    ]);
  });

  it('テキストが無ければ空配列を返す', () => {
    const layer: TextConditionLayer = { id: 'empty', kind: 'textCondition', texts: [] };
    expect(layoutConditionTexts(layer, { x: 0, y: 0 })).toEqual([]);
  });
});
