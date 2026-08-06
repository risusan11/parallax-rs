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

/**
 * 直線上にあり、かつ指定した点から指定距離にある候補点を算出する
 * (直線と、その点を中心とした円の交点)。交点がなければ空配列、
 * 接する場合は1点、それ以外は2点を返す。
 */
export function candidatePointsOnLineAtDistance(
  line: Line,
  center: Vector2,
  distance: number,
): ReadonlyArray<Vector2> {
  if (line.kind === 'vertical') {
    const dx = line.x - center.x;
    const discriminant = distance * distance - dx * dx;
    if (discriminant < 0) return [];
    if (discriminant === 0) return [{ x: line.x, y: center.y }];
    const dy = Math.sqrt(discriminant);
    return [
      { x: line.x, y: center.y + dy },
      { x: line.x, y: center.y - dy },
    ];
  }

  // y = a*x + b を (x-cx)^2 + (y-cy)^2 = distance^2 に代入し、
  // A*x^2 + B*x + C = 0 の形に整理して解く。
  const { a, b } = line;
  const k = b - center.y;
  const coeffA = 1 + a * a;
  const coeffB = 2 * (a * k - center.x);
  const coeffC = center.x * center.x + k * k - distance * distance;
  const discriminant = coeffB * coeffB - 4 * coeffA * coeffC;
  if (discriminant < 0) return [];
  if (discriminant === 0) {
    const x = -coeffB / (2 * coeffA);
    return [{ x, y: a * x + b }];
  }
  const sqrtDiscriminant = Math.sqrt(discriminant);
  const x1 = (-coeffB + sqrtDiscriminant) / (2 * coeffA);
  const x2 = (-coeffB - sqrtDiscriminant) / (2 * coeffA);
  return [
    { x: x1, y: a * x1 + b },
    { x: x2, y: a * x2 + b },
  ];
}
