import { isPointOnLine, type Line } from '../line.js';
import { distance, type Vector2 } from '../vector.js';

/**
 * タイル1マスの配置。type はステージデータ側で自由に定義する識別子。
 */
export interface TileLayer {
  readonly id: string;
  readonly kind: 'tile';
  readonly tiles: ReadonlyArray<{ readonly x: number; readonly y: number; readonly type: string }>;
}

/**
 * 座標軸・障害物・装置などのゲームオブジェクトを配置するレイヤー。
 */
export interface ObjectLayer {
  readonly id: string;
  readonly kind: 'object';
  readonly objects: ReadonlyArray<{
    readonly id: string;
    readonly type: string;
    readonly position: Vector2;
  }>;
}

/**
 * 特定役職にのみ見える条件文などのテキストを配置するレイヤー。
 */
export interface TextConditionLayer {
  readonly id: string;
  readonly kind: 'textCondition';
  readonly texts: ReadonlyArray<{ readonly id: string; readonly content: string }>;
}

export type Layer = TileLayer | ObjectLayer | TextConditionLayer;

/**
 * 役職 = 可視レイヤーの集合 + 使用可能ツールの集合。
 */
export interface Role {
  readonly id: string;
  readonly name: string;
  readonly visibleLayerIds: ReadonlyArray<string>;
  readonly tools: ReadonlyArray<string>;
}

/**
 * クリア条件。役職のプレイヤー位置に対する幾何条件と、その論理結合をデータで表現する。
 */
export type ClearCondition =
  | {
      readonly kind: 'onLine';
      readonly roleId: string;
      readonly line: Line;
      readonly epsilon?: number;
    }
  | {
      readonly kind: 'distanceFromPoint';
      readonly roleId: string;
      readonly point: Vector2;
      readonly distance: number;
      readonly epsilon?: number;
    }
  | { readonly kind: 'all'; readonly conditions: ReadonlyArray<ClearCondition> }
  | { readonly kind: 'any'; readonly conditions: ReadonlyArray<ClearCondition> };

export interface StageDefinition {
  readonly id: string;
  readonly name: string;
  readonly layers: ReadonlyArray<Layer>;
  readonly roles: ReadonlyArray<Role>;
  readonly clearCondition: ClearCondition;
}

export type ValidationResult =
  { readonly valid: true } | { readonly valid: false; readonly errors: ReadonlyArray<string> };

function findDuplicates(ids: ReadonlyArray<string>): ReadonlyArray<string> {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) {
      duplicates.add(id);
    }
    seen.add(id);
  }
  return [...duplicates];
}

function collectRoleIds(condition: ClearCondition): ReadonlyArray<string> {
  switch (condition.kind) {
    case 'onLine':
    case 'distanceFromPoint':
      return [condition.roleId];
    case 'all':
    case 'any':
      return condition.conditions.flatMap(collectRoleIds);
  }
}

function validateClearCondition(condition: ClearCondition, errors: string[]): void {
  switch (condition.kind) {
    case 'onLine':
    case 'distanceFromPoint':
      return;
    case 'all':
    case 'any':
      if (condition.conditions.length === 0) {
        errors.push(`クリア条件 "${condition.kind}" の conditions が空です`);
      }
      for (const child of condition.conditions) {
        validateClearCondition(child, errors);
      }
      return;
  }
}

/**
 * ステージ定義の整合性を検証する。
 * - レイヤーID・役職IDの重複
 * - 役職が参照する visibleLayerIds の存在
 * - クリア条件が参照する roleId の存在
 * - all/any 条件の子要素が空でないこと
 */
export function validateStageDefinition(stage: StageDefinition): ValidationResult {
  const errors: string[] = [];

  if (stage.layers.length === 0) {
    errors.push('layers が空です');
  }
  if (stage.roles.length === 0) {
    errors.push('roles が空です');
  }

  const layerIds = stage.layers.map((layer) => layer.id);
  for (const duplicate of findDuplicates(layerIds)) {
    errors.push(`レイヤーID "${duplicate}" が重複しています`);
  }

  const roleIds = stage.roles.map((role) => role.id);
  for (const duplicate of findDuplicates(roleIds)) {
    errors.push(`役職ID "${duplicate}" が重複しています`);
  }

  const layerIdSet = new Set(layerIds);
  for (const role of stage.roles) {
    for (const visibleLayerId of role.visibleLayerIds) {
      if (!layerIdSet.has(visibleLayerId)) {
        errors.push(`役職 "${role.id}" が存在しないレイヤー "${visibleLayerId}" を参照しています`);
      }
    }
  }

  const roleIdSet = new Set(roleIds);
  for (const referencedRoleId of collectRoleIds(stage.clearCondition)) {
    if (!roleIdSet.has(referencedRoleId)) {
      errors.push(`クリア条件が存在しない役職 "${referencedRoleId}" を参照しています`);
    }
  }

  validateClearCondition(stage.clearCondition, errors);

  return errors.length === 0 ? { valid: true } : { valid: false, errors };
}

/**
 * クリア条件を、役職IDごとの現在位置に対して評価し到達済みかどうかを判定する。
 * 該当役職の位置が渡されていない場合は未到達として扱う。
 */
export function evaluateClearCondition(
  condition: ClearCondition,
  positions: Readonly<Record<string, Vector2>>,
): boolean {
  switch (condition.kind) {
    case 'onLine': {
      const position = positions[condition.roleId];
      return position !== undefined && isPointOnLine(position, condition.line, condition.epsilon);
    }
    case 'distanceFromPoint': {
      const position = positions[condition.roleId];
      if (position === undefined) return false;
      const epsilon = condition.epsilon ?? 1e-9;
      return Math.abs(distance(position, condition.point) - condition.distance) <= epsilon;
    }
    case 'all':
      return condition.conditions.every((child) => evaluateClearCondition(child, positions));
    case 'any':
      return condition.conditions.some((child) => evaluateClearCondition(child, positions));
  }
}
