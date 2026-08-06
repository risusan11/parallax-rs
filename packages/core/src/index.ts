export function isCoreReady(): boolean {
  return true;
}

export type { Vector2 } from './vector.js';
export { add, subtract, distance, segmentsIntersect } from './vector.js';

export type { Line } from './line.js';
export {
  slopeLine,
  verticalLine,
  distanceToLine,
  isPointOnLine,
  candidatePointsOnLineAtDistance,
} from './line.js';

export { canMoveTo, resolveMove } from './movement.js';

export type {
  Layer,
  TileLayer,
  ObjectLayer,
  TextConditionLayer,
  Role,
  ClearCondition,
  StageDefinition,
  ValidationResult,
} from './stages/schema.js';
export { validateStageDefinition, evaluateClearCondition } from './stages/schema.js';

export {
  INVISIBLE_COORDINATE_ROOM,
  DEVICE_POSITION,
  TARGET_LINE,
  TARGET_DISTANCE,
} from './stages/invisible-coordinate-room.js';
