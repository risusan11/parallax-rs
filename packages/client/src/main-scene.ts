import {
  getVisibleLayers,
  INVISIBLE_COORDINATE_ROOM,
  isPlayerMarkerVisible,
  type ObjectLayer,
  type TextConditionLayer,
  type TileLayer,
} from '@parallax-rs/core';
import type { Room } from 'colyseus.js';
import Phaser from 'phaser';
import { directionToMoveDelta, type MoveDirection } from './movement-input.js';
import { layoutObjects } from './object-map-view.js';
import type { ParallaxRoomState } from './parallax-room-state.js';
import { formatRoomStateLog, isCleared, type PlayerSnapshot } from './room-connection.js';
import { formatResultSummary } from './result-view.js';
import { gridToPixel, layoutTiles, TILE_SIZE } from './tile-map-view.js';
import { layoutConditionTexts } from './text-condition-view.js';

/** キャンバス(640x480)の中心。グリッド座標 (0, 0) をここに描画する。 */
const CANVAS_ORIGIN = { x: 320, y: 240 };
/** 条件テキストレイヤーを表示する開始位置(画面下部)。 */
const CONDITION_TEXT_ORIGIN = { x: 16, y: 420 };
const FLOOR_TILE_COLOR = 0x2a2a3a;
const PLAYER_MARKER_COLOR = 0x38bdf8;
const DEFAULT_OBJECT_COLOR = 0xf59e0b;
const CONDITION_TEXT_COLOR = '#facc15';
const CLEAR_BANNER_COLOR = '#4ade80';
const RESULT_SUMMARY_COLOR = '#e2e8f0';
const RETRY_BUTTON_COLOR = '#38bdf8';
const OBJECT_COLORS: Readonly<Record<string, number>> = {
  device: 0xf472b6,
  axisOrigin: 0xa3e635,
  obstacle: 0xef4444,
};

type WasdKeys = Record<'W' | 'A' | 'S' | 'D', Phaser.Input.Keyboard.Key>;

export interface MainSceneData {
  readonly room: Room<ParallaxRoomState>;
}

/**
 * Phaser + Colyseus のメインシーン。ロビー画面で接続済みの Room を受け取り、
 * ルーム状態をコンソールへ出力しつつ、自分の役職から見えるレイヤー(条件テキストを
 * 含む)とプレイヤー位置マーカーのみを描画し、観測者の移動操作(矢印キー/WASD)を行う。
 * クリア時は役職に関わらず全員にクリア演出を表示する。
 */
export class MainScene extends Phaser.Scene {
  private room: Room<ParallaxRoomState> | undefined;
  private ownRoleId: string | undefined;
  private visibleLayersRendered = false;
  private clearBannerShown = false;
  private readonly clearBannerObjects: Phaser.GameObjects.GameObject[] = [];
  private readonly playerMarkers = new Map<string, Phaser.GameObjects.Rectangle>();
  private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys | undefined;
  private wasdKeys: WasdKeys | undefined;

  constructor() {
    super('main');
  }

  create(data: MainSceneData): void {
    this.add.text(16, 16, 'PARALLAX-RS: ステージを読み込み中…', { color: '#e2e8f0' });
    this.setUpMovementKeys();
    this.bindRoom(data.room);
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

  private drawTileLayer(layer: TileLayer): void {
    for (const tile of layoutTiles(layer, CANVAS_ORIGIN)) {
      this.add.rectangle(tile.pixelX, tile.pixelY, TILE_SIZE - 2, TILE_SIZE - 2, FLOOR_TILE_COLOR);
    }
  }

  private drawObjectLayer(layer: ObjectLayer): void {
    for (const object of layoutObjects(layer, CANVAS_ORIGIN)) {
      const color = OBJECT_COLORS[object.type] ?? DEFAULT_OBJECT_COLOR;
      this.add.rectangle(object.pixelX, object.pixelY, TILE_SIZE - 12, TILE_SIZE - 12, color);
    }
  }

  private drawTextConditionLayer(layer: TextConditionLayer): void {
    for (const line of layoutConditionTexts(layer, CONDITION_TEXT_ORIGIN)) {
      this.add.text(line.pixelX, line.pixelY, line.content, { color: CONDITION_TEXT_COLOR });
    }
  }

  /** 自分の役職が判明したタイミングで、その役職から見えるレイヤーのみを1度だけ描画する。 */
  private renderVisibleLayersIfNeeded(): void {
    if (this.visibleLayersRendered || this.ownRoleId === undefined) return;
    this.visibleLayersRendered = true;

    for (const layer of getVisibleLayers(INVISIBLE_COORDINATE_ROOM, this.ownRoleId)) {
      if (layer.kind === 'tile') this.drawTileLayer(layer);
      else if (layer.kind === 'object') this.drawObjectLayer(layer);
      else if (layer.kind === 'textCondition') this.drawTextConditionLayer(layer);
    }
  }

  /**
   * クリア状態になったタイミングで、役職に関わらず全員へ1度だけクリア演出と
   * リザルト(クリア時間・観測者の移動距離・リトライ回数)、「もう一度プレイする」
   * ボタンを表示する。
   */
  private renderClearBannerIfNeeded(state: ParallaxRoomState): void {
    if (this.clearBannerShown || !isCleared(state.status)) return;
    this.clearBannerShown = true;

    const banner = this.add
      .text(CANVAS_ORIGIN.x, CANVAS_ORIGIN.y - 80, 'クリア!', {
        color: CLEAR_BANNER_COLOR,
        fontSize: '48px',
      })
      .setOrigin(0.5);

    const summaryLines = formatResultSummary({
      clearTimeMs: state.clearTimeMs,
      observerDistance: state.observerDistance,
      retryCount: state.retryCount,
    });
    const summary = this.add
      .text(CANVAS_ORIGIN.x, CANVAS_ORIGIN.y, summaryLines.join('\n'), {
        color: RESULT_SUMMARY_COLOR,
        align: 'center',
      })
      .setOrigin(0.5);

    const retryButton = this.add
      .text(CANVAS_ORIGIN.x, CANVAS_ORIGIN.y + 100, 'もう一度プレイする', {
        color: RETRY_BUTTON_COLOR,
        fontSize: '24px',
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    retryButton.on('pointerdown', () => this.room?.send('retry'));

    this.clearBannerObjects.push(banner, summary, retryButton);
  }

  /** リトライでクリア状態を抜けたら、クリア演出・リザルトを片付けて再表示できるようにする。 */
  private resetClearBannerIfNeeded(status: string): void {
    if (!this.clearBannerShown || isCleared(status)) return;
    this.clearBannerShown = false;
    for (const object of this.clearBannerObjects) object.destroy();
    this.clearBannerObjects.length = 0;
  }

  private bindRoom(room: Room<ParallaxRoomState>): void {
    this.room = room;

    console.log(`ルーム "${room.roomId}" に接続しました(sessionId: ${room.sessionId})`);
    room.onStateChange((state) => {
      const players = collectPlayers(state);
      console.log(formatRoomStateLog({ status: state.status, players }));

      const self = findPlayer(state, room.sessionId);
      if (self !== undefined) this.ownRoleId = self.roleId;

      this.renderVisibleLayersIfNeeded();
      this.updatePlayerMarkers(players);
      this.resetClearBannerIfNeeded(state.status);
      this.renderClearBannerIfNeeded(state);
    });
  }

  /**
   * 役職ごとの可視性(自分自身、または移動ツールを持つ役職)に基づいて
   * プレイヤー位置マーカーを追加・更新・削除する。
   */
  private updatePlayerMarkers(players: ReadonlyArray<PlayerSnapshot>): void {
    if (this.ownRoleId === undefined) return;

    const visibleSessionIds = new Set<string>();
    for (const player of players) {
      if (!isPlayerMarkerVisible(INVISIBLE_COORDINATE_ROOM, this.ownRoleId, player.roleId))
        continue;
      visibleSessionIds.add(player.sessionId);

      const pixel = gridToPixel({ x: player.x, y: player.y }, CANVAS_ORIGIN);
      const existingMarker = this.playerMarkers.get(player.sessionId);
      if (existingMarker === undefined) {
        const marker = this.add.rectangle(
          pixel.x,
          pixel.y,
          TILE_SIZE - 8,
          TILE_SIZE - 8,
          PLAYER_MARKER_COLOR,
        );
        this.playerMarkers.set(player.sessionId, marker);
      } else {
        existingMarker.setPosition(pixel.x, pixel.y);
      }
    }

    for (const [sessionId, marker] of this.playerMarkers) {
      if (visibleSessionIds.has(sessionId)) continue;
      marker.destroy();
      this.playerMarkers.delete(sessionId);
    }
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
