const DEFAULT_SERVER_URL = 'ws://localhost:2567';

/** Colyseus ルームサーバーの名前。server パッケージの PARALLAX_ROOM_NAME と一致させる。 */
export const PARALLAX_ROOM_NAME = 'parallax';

export interface PlayerSnapshot {
  readonly sessionId: string;
  readonly roleId: string;
  readonly x: number;
  readonly y: number;
}

export interface RoomStateSnapshot {
  readonly status: string;
  readonly players: ReadonlyArray<PlayerSnapshot>;
}

/** VITE_SERVER_URL が未設定・空文字の場合はローカル開発用のデフォルトに倒す。 */
export function resolveServerUrl(configuredUrl: string | undefined): string {
  return configuredUrl === undefined || configuredUrl === '' ? DEFAULT_SERVER_URL : configuredUrl;
}

/** ルーム状態をコンソール表示用の1行文字列に整形する。 */
export function formatRoomStateLog(snapshot: RoomStateSnapshot): string {
  const players = snapshot.players
    .map((player) => `${player.roleId}(${player.sessionId.slice(0, 6)}): (${player.x}, ${player.y})`)
    .join(', ');
  return `[status: ${snapshot.status}] ${players}`;
}
