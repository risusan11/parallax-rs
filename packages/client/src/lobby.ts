import { Client, type Room } from '@colyseus/sdk';
import { INVISIBLE_COORDINATE_ROOM } from '@parallax-rs/core';
import { buildShareUrl, extractRoomId, formatLobbyStatus } from './lobby-url.js';
import type { ParallaxRoomState } from './parallax-room-state.js';
import { PARALLAX_ROOM_NAME, resolveServerUrl } from './room-connection.js';

/** ステージの役職数(=定員)。ステージデータから導出するので役職数が変わっても追従する。 */
const MAX_CLIENTS = INVISIBLE_COORDINATE_ROOM.roles.length;

/**
 * ロビー画面(ルーム作成 → URL共有 → 合流 → 2人揃ったら開始)を container に描画する。
 * URLに room クエリパラメータがあればそのルームへ合流し、無ければ「ルームを作成」
 * ボタンを表示する。定員が揃いプレイ中へ遷移したら、接続済みの Room を解決して返す。
 */
export function runLobby(container: HTMLElement): Promise<Room<ParallaxRoomState>> {
  return new Promise((resolve, reject) => {
    const client = new Client(resolveServerUrl(import.meta.env.VITE_SERVER_URL));
    const roomIdFromUrl = extractRoomId(window.location.search);

    const statusEl = document.createElement('p');

    const showError = (message: string, error: unknown): void => {
      statusEl.textContent = message;
      container.replaceChildren(statusEl);
      reject(error instanceof Error ? error : new Error(String(error)));
    };

    const onConnected = (room: Room<ParallaxRoomState>): void => {
      const shareUrl = buildShareUrl(window.location.origin, window.location.pathname, room.roomId);
      window.history.replaceState(null, '', shareUrl);

      const linkEl = document.createElement('p');
      linkEl.textContent = `このURLを共有してもう1人を招待してください: ${shareUrl}`;
      container.replaceChildren(linkEl, statusEl);

      room.onStateChange((state) => {
        statusEl.textContent = formatLobbyStatus(state.players.size, MAX_CLIENTS);
        if (state.status !== 'waiting') {
          container.replaceChildren();
          resolve(room);
        }
      });
    };

    if (roomIdFromUrl !== undefined) {
      statusEl.textContent = 'ルームに参加しています…';
      container.replaceChildren(statusEl);
      client
        .joinById<ParallaxRoomState>(roomIdFromUrl)
        .then(onConnected)
        .catch((error: unknown) =>
          showError('ルームへの参加に失敗しました。URLを確認してください。', error),
        );
      return;
    }

    const createButton = document.createElement('button');
    createButton.textContent = 'ルームを作成';
    createButton.addEventListener('click', () => {
      createButton.disabled = true;
      statusEl.textContent = 'ルームを作成しています…';
      client
        .create<ParallaxRoomState>(PARALLAX_ROOM_NAME)
        .then(onConnected)
        .catch((error: unknown) => showError('ルームの作成に失敗しました。', error));
    });
    container.replaceChildren(createButton, statusEl);
  });
}
