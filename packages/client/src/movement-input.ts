import type { Vector2 } from '@parallax-rs/core';

export type MoveDirection = 'up' | 'down' | 'left' | 'right';

const DIRECTION_DELTAS: Readonly<Record<MoveDirection, Vector2>> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

/** 移動方向を、サーバーの `move` メッセージが期待する単位移動ベクトルに変換する。 */
export function directionToMoveDelta(direction: MoveDirection): Vector2 {
  return DIRECTION_DELTAS[direction];
}
