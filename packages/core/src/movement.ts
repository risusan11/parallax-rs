import type { Layer } from './stages/schema.js';
import type { Vector2 } from './vector.js';

const OBSTACLE_OBJECT_TYPE = 'obstacle';

function isFloorTileAt(layers: ReadonlyArray<Layer>, position: Vector2): boolean {
  return layers.some(
    (layer) =>
      layer.kind === 'tile' &&
      layer.tiles.some((tile) => tile.x === position.x && tile.y === position.y),
  );
}

function isObstacleAt(layers: ReadonlyArray<Layer>, position: Vector2): boolean {
  return layers.some(
    (layer) =>
      layer.kind === 'object' &&
      layer.objects.some(
        (object) =>
          object.type === OBSTACLE_OBJECT_TYPE &&
          object.position.x === position.x &&
          object.position.y === position.y,
      ),
  );
}

/**
 * 移動先の座標が、タイルレイヤー上のフロアであり、かつ障害物レイヤーの
 * 障害物と重なっていないかを判定する。
 */
export function canMoveTo(layers: ReadonlyArray<Layer>, position: Vector2): boolean {
  return isFloorTileAt(layers, position) && !isObstacleAt(layers, position);
}

/**
 * 現在位置に移動量を加えた移動先が有効ならその位置を、無効なら現在位置を返す。
 * 障害物レイヤーとの衝突判定はここで一元的に行う。
 */
export function resolveMove(
  layers: ReadonlyArray<Layer>,
  from: Vector2,
  delta: Vector2,
): Vector2 {
  const next = { x: from.x + delta.x, y: from.y + delta.y };
  return canMoveTo(layers, next) ? next : from;
}
