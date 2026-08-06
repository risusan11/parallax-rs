import { INVISIBLE_COORDINATE_ROOM, type TileLayer } from '@parallax-rs/core';
import { Client, type Room } from 'colyseus.js';
import Phaser from 'phaser';
import { directionToMoveDelta, type MoveDirection } from './movement-input.js';
import type { ParallaxRoomState } from './parallax-room-state.js';
import {
  PARALLAX_ROOM_NAME,
  formatRoomStateLog,
  resolveServerUrl,
  type PlayerSnapshot,
} from './room-connection.js';
import { gridToPixel, layoutTiles, TILE_SIZE } from './tile-map-view.js';

/** キャンバス(640x480)の中心。グリッド座標 (0, 0) をここに描画する。 */
const CANVAS_ORIGIN = { x: 320, y: 240 };
const FLOOR_TILE_COLOR = 0x2a2a3a;
const PLAYER_MARKER_COLOR = 0x38bdf8;

type WasdKeys = Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;

/**
 * Phaser + Colyseus のメインシーン。サーバーに接続してルーム状態をコンソールへ
 * 出力しつつ、タイルマップの描画と観測者の移動操作(矢印キー/WASD)を行う。
 */
export class MainScene extends Phaser.Scene {
  private room: Room<ParallaxRoomState> | undefined;
  private playerMarker: Phaser.GameObjects.Rectangle | undefined;
  private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
  private wasdKeys: WasdKeys | undefined;

  constructor() {
    super('main');
  }

  create(): void {
    this.add.text(16, 16, 'PARALLAX-RS: サーバーに接続中…', { color: '#e2e8f0' });
    this.drawFloorTiles();
    this.playerMarker = this.add.rectangle(
      CANVAS_ORIGIN.x,
      CANVAS_ORIGIN.y,
      TILE_SIZE - 8,
      TILE_SIZE - 8,
      PLAYER_MARKER_COLOR,
    );
    this.setUpMovementKeys();
    void this.connectToServer();
  }

  update(): void {
    const direction = this.readJustPressedDirection();
    if (direction !== undefined) {
      this.room?.send('move', directionToMoveDelta(direction));
    }
  }

  private setUpMovementKeys(): void {
    const keyboard = this.input.keyboard;
    if (keyboard === null) return;
    this.cursorKeys = keyboard.createCursorKeys();
    this.wasdKeys = keyboard.addKeys('W,A,S,D') as WasdKeys;
  }

  private readJustPressedDirection(): MoveDirection | undefined {
    const isJustDown = (key: Phaser.Input.Keyboard.Key | undefined): boolean =>
      key !== undefined && Phaser.Input.Keyboard.JustDown(key);

    if (isJustDown(this.cursorKeys?.up) || isJustDown(this.wasdKeys?.W)) return 'up';
    if (isJustDown(this.cursorKeys?.down) || isJustDown(this.wasdKeys?.S)) return 'down';
    if (isJustDown(this.cursorKeys?.left) || isJustDown(this.wasdKeys?.A)) return 'left';
    if (isJustDown(this.cursorKeys?.right) || isJustDown(this.wasdKeys?.D)) return 'right';
    return undefined;
  }

  private drawFloorTiles(): void {
    const roomLayer = INVISIBLE_COORDINATE_ROOM.layers.find(
      (layer): layer is TileLayer => layer.kind === 'tile',
    );
    if (roomLayer === undefined) return;

    for (const tile of layoutTiles(roomLayer, CANVAS_ORIGIN)) {
      this.add.rectangle(tile.pixelX, tile.pixelY, TILE_SIZE - 2, TILE_SIZE - 2, FLOOR_TILE_COLOR);
    }
  }

  private async connectToServer(): Promise<void> {
    const client = new Client(resolveServerUrl(import.meta.env.VITE_SERVER_URL));
    const room = await client.joinOrCreate<ParallaxRoomState>(PARALLAX_ROOM_NAME);
    this.room = room;

    console.log(`ルーム "${room.roomId}" に接続しました(sessionId: ${room.sessionId})`);
    room.onStateChange((state) => {
      const players = collectPlayers(state);
      console.log(formatRoomStateLog({ status: state.status, players }));
      this.updatePlayerMarker(state);
    });
  }

  private updatePlayerMarker(state: ParallaxRoomState): void {
    if (this.room === undefined || this.playerMarker === undefined) return;
    const self = findPlayer(state, this.room.sessionId);
    if (self === undefined) return;

    const pixel = gridToPixel({ x: self.x, y: self.y }, CANVAS_ORIGIN);
    this.playerMarker.setPosition(pixel.x, pixel.y);
  }
}

function collectPlayers(state: ParallaxRoomState): ReadonlyArray<PlayerSnapshot> {
  const players: PlayerSnapshot[] = [];
  state.players.forEach((player) => {
    players.push({ sessionId: player.sessionId, roleId: player.roleId, x: player.x, y: player.y });
  });
  return players;
}

function findPlayer(state: ParallaxRoomState, sessionId: string): PlayerSnapshot | undefined {
  let found: PlayerSnapshot | undefined;
  state.players.forEach((player) => {
    if (player.sessionId === sessionId) {
      found = { sessionId: player.sessionId, roleId: player.roleId, x: player.x, y: player.y };
    }
  });
  return found;
}
