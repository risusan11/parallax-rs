import { slopeLine } from '../line.js';
import type { Vector2 } from '../vector.js';
import type { StageDefinition } from './schema.js';

const ROOM_MIN = -8;
const ROOM_MAX = 8;

function buildRoomTiles(): ReadonlyArray<{
  readonly x: number;
  readonly y: number;
  readonly type: string;
}> {
  const tiles: Array<{ x: number; y: number; type: string }> = [];
  for (let x = ROOM_MIN; x <= ROOM_MAX; x++) {
    for (let y = ROOM_MIN; y <= ROOM_MAX; y++) {
      tiles.push({ x, y, type: 'floor' });
    }
  }
  return tiles;
}

/** 装置の位置。クリア条件の距離判定はこの点からの距離で行う。 */
export const DEVICE_POSITION: Vector2 = { x: 0, y: -3 };

/** クリア条件で使う直線 y = 2x - 3。 */
export const TARGET_LINE = slopeLine(2, -3);

/** 装置からの目標距離。 */
export const TARGET_DISTANCE = 5;

export const INVISIBLE_COORDINATE_ROOM: StageDefinition = {
  id: 'invisible-coordinate-room',
  name: '見えない座標室',
  layers: [
    { id: 'room', kind: 'tile', tiles: buildRoomTiles() },
    {
      id: 'axes-and-obstacles',
      kind: 'object',
      objects: [
        { id: 'device', type: 'device', position: DEVICE_POSITION },
        { id: 'axis-origin', type: 'axisOrigin', position: { x: 0, y: 0 } },
        { id: 'obstacle-1', type: 'obstacle', position: { x: 1, y: -1 } },
        { id: 'obstacle-2', type: 'obstacle', position: { x: -2, y: 3 } },
      ],
    },
    {
      id: 'condition-text',
      kind: 'textCondition',
      texts: [
        {
          id: 'target-condition',
          content: '直線 y = 2x - 3 上、かつ装置から距離5の地点へ観測者を導け。',
        },
      ],
    },
  ],
  roles: [
    { id: 'observer', name: '観測者', visibleLayerIds: ['room'], tools: ['move'] },
    {
      id: 'surveyor',
      name: '測量士',
      visibleLayerIds: ['axes-and-obstacles', 'condition-text'],
      tools: ['measure'],
    },
  ],
  clearCondition: {
    kind: 'all',
    conditions: [
      { kind: 'onLine', roleId: 'observer', line: TARGET_LINE },
      {
        kind: 'distanceFromPoint',
        roleId: 'observer',
        point: DEVICE_POSITION,
        distance: TARGET_DISTANCE,
      },
    ],
  },
};
