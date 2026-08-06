/** ロビーの合流URLで使うクエリパラメータ名。 */
export const ROOM_QUERY_PARAM = 'room';

/** URLのクエリ文字列(location.search)から合流先のルームIDを取り出す。未指定・空文字なら undefined。 */
export function extractRoomId(search: string): string | undefined {
  const roomId = new URLSearchParams(search).get(ROOM_QUERY_PARAM);
  return roomId === null || roomId === '' ? undefined : roomId;
}

/** ルームIDをクエリパラメータとして含む検索文字列(`?room=...`)を組み立てる。 */
export function buildRoomSearch(roomId: string): string {
  return `?${new URLSearchParams({ [ROOM_QUERY_PARAM]: roomId }).toString()}`;
}

/** 合流先を共有するための絶対URLを組み立てる。 */
export function buildShareUrl(origin: string, pathname: string, roomId: string): string {
  return `${origin}${pathname}${buildRoomSearch(roomId)}`;
}

/** ロビー画面に表示する、現在の参加人数の案内文を組み立てる。 */
export function formatLobbyStatus(playerCount: number, maxClients: number): string {
  if (playerCount >= maxClients) return '参加者が揃いました。開始します…';
  return `参加者 ${playerCount}/${maxClients}人。URLを共有してもう1人を招待してください。`;
}
