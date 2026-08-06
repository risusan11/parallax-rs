import type { Vector2 } from './vector.js';

/**
 * y = a * x + b の斜め直線、または x = c の垂直直線を表す。
 */
export type Line =
  | { readonly kind: 'slope'; readonly a: number; readonly b: number }
  | { readonly kind: 'vertical'; readonly x: number };

export function slopeLine(a: number, b: number): Line {
  return { kind: 'slope', a, b };
}

export function verticalLine(x: number): Line {
  return { kind: 'vertical', x };
}

export function distanceToLine(point: Vector2, line: Line): number {
  if (line.kind === 'vertical') {
    return Math.abs(point.x - line.x);
  }
  // 直線 a*x - y + b = 0 と点の距離: |a*px - py + b| / sqrt(a^2 + 1)
  return Math.abs(line.a * point.x - point.y + line.b) / Math.hypot(line.a, 1);
}

export function isPointOnLine(point: Vector2, line: Line, epsilon = 1e-9): boolean {
  return distanceToLine(point, line) <= epsilon;
}
