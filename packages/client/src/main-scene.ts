import { Client } from 'colyseus.js';
import Phaser from 'phaser';
import type { ParallaxRoomState } from './parallax-room-state.js';
import {
  PARALLAX_ROOM_NAME,
  formatRoomStateLog,
  resolveServerUrl,
  type PlayerSnapshot,
} from './room-connection.js';

/**
 * Phaser + Colyseus の雛形シーン。起動時にサーバーへ接続し、ルーム状態が
 * 変化するたびにコンソールへ出力する。描画はまだ行わない。
 */
export class MainScene extends Phaser.Scene {
  constructor() {
    super('main');
  }

  create(): void {
    this.add.text(16, 16, 'PARALLAX-RS: サーバーに接続中…', { color: '#e2e8f0' });
    void this.connectToServer();
  }

  private async connectToServer(): Promise<void> {
    const client = new Client(resolveServerUrl(import.meta.env.VITE_SERVER_URL));
    const room = await client.joinOrCreate<ParallaxRoomState>(PARALLAX_ROOM_NAME);

    console.log(`ルーム "${room.roomId}" に接続しました(sessionId: ${room.sessionId})`);
    room.onStateChange((state) => {
      const players = collectPlayers(state);
      console.log(formatRoomStateLog({ status: state.status, players }));
    });
  }
}

function collectPlayers(state: ParallaxRoomState): ReadonlyArray<PlayerSnapshot> {
  const players: PlayerSnapshot[] = [];
  state.players.forEach((player) => {
    players.push({ sessionId: player.sessionId, roleId: player.roleId, x: player.x, y: player.y });
  });
  return players;
}
