import type { Layer, StageDefinition } from './schema.js';

const MOVE_TOOL_ID = 'move';

/**
 * 指定した役職から見えるレイヤーを、役職定義の visibleLayerIds に基づいて絞り込む。
 * 役職が存在しない場合は何も見えないものとして扱う。
 */
export function getVisibleLayers(stage: StageDefinition, roleId: string): ReadonlyArray<Layer> {
  const role = stage.roles.find((candidate) => candidate.id === roleId);
  if (role === undefined) return [];

  const visibleLayerIdSet = new Set(role.visibleLayerIds);
  return stage.layers.filter((layer) => visibleLayerIdSet.has(layer.id));
}

/**
 * 役職 targetRoleId のプレイヤー位置マーカーが、役職 viewerRoleId の視点から
 * 見えるかどうかを判定する。自分自身の位置は常に見える。自分以外は、対象の
 * 役職が移動ツール(move)を持つ場合にのみ見える。移動する役職はプレイヤー
 * 全員が参照する共通の基準点として扱う。
 */
export function isPlayerMarkerVisible(
  stage: StageDefinition,
  viewerRoleId: string,
  targetRoleId: string,
): boolean {
  if (viewerRoleId === targetRoleId) return true;

  const targetRole = stage.roles.find((candidate) => candidate.id === targetRoleId);
  return targetRole !== undefined && targetRole.tools.includes(MOVE_TOOL_ID);
}
