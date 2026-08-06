export function isCoreReady(): boolean {
  return true;
}

export type { Vector2 } from './vector.js';
export { add, subtract, distance, segmentsIntersect } from './vector.js';

export type { Line } from './line.js';
export { slopeLine, verticalLine, distanceToLine, isPointOnLine } from './line.js';
