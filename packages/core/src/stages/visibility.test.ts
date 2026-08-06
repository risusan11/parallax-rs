import { describe, expect, it } from 'vitest';
import { slopeLine } from '../line.js';
import type { StageDefinition } from './schema.js';
import { getVisibleLayers, isPlayerMarkerVisible } from './visibility.js';

function makeStage(): StageDefinition {
  return {
    id: 'invisible-coordinate-room',
    name: '見えない座標室',
    layers: [
      { id: 'room', kind: 'tile', tiles: [{ x: 0, y: 0, type: 'floor' }] },
      {
        id: 'axes',
        kind: 'object',
        objects: [{ id: 'device', type: 'device', position: { x: 0, y: -3 } }],
      },
      {
        id: 'condition-text',
        kind: 'textCondition',
        texts: [{ id: 'hint', content: 'y = 2x - 3' }],
      },
    ],
    roles: [
      { id: 'observer', name: '観測者', visibleLayerIds: ['room'], tools: ['move'] },
      {
        id: 'surveyor',
        name: '測量士',
        visibleLayerIds: ['axes', 'condition-text'],
        tools: ['measure'],
      },
    ],
    clearCondition: { kind: 'onLine', roleId: 'observer', line: slopeLine(2, -3) },
  };
}

describe('getVisibleLayers', () => {
  it('観測者には部屋レイヤーのみ見える', () => {
    const layers = getVisibleLayers(makeStage(), 'observer');
    expect(layers.map((layer) => layer.id)).toEqual(['room']);
  });

  it('測量士には座標軸レイヤーと条件文レイヤーが見える', () => {
    const layers = getVisibleLayers(makeStage(), 'surveyor');
    expect(layers.map((layer) => layer.id)).toEqual(['axes', 'condition-text']);
  });

  it('存在しない役職には何も見えない', () => {
    expect(getVisibleLayers(makeStage(), 'ghost')).toEqual([]);
  });
});

describe('isPlayerMarkerVisible', () => {
  it('自分自身のマーカーは常に見える', () => {
    expect(isPlayerMarkerVisible(makeStage(), 'surveyor', 'surveyor')).toBe(true);
    expect(isPlayerMarkerVisible(makeStage(), 'observer', 'observer')).toBe(true);
  });

  it('移動ツールを持つ役職(観測者)のマーカーは他の役職からも見える', () => {
    expect(isPlayerMarkerVisible(makeStage(), 'surveyor', 'observer')).toBe(true);
  });

  it('移動ツールを持たない役職(測量士)のマーカーは他の役職からは見えない', () => {
    expect(isPlayerMarkerVisible(makeStage(), 'observer', 'surveyor')).toBe(false);
  });

  it('存在しない役職のマーカーは見えない', () => {
    expect(isPlayerMarkerVisible(makeStage(), 'observer', 'ghost')).toBe(false);
  });
});
