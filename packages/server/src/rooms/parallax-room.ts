import { INVISIBLE_COORDINATE_ROOM, resolveMove } from '@parallax-rs/core';
import { MapSchema, Schema, type } from '@colyseus/schema';
import { Room, type Client } from 'colyseus';

/** 入室順に割り当てる役職ID。ステージ定義の roles 順(観測者→測量士)をそのまま使う。 */
const ROLE_ASSIGNMENT_ORDER: ReadonlyArray<string> = INVISIBLE_COORDINATE_ROOM.roles.map(
  (role) => role.id,
);

/** 移動ツールを持つ役職(観測者)の初期位置。 */
const INITIAL_POSITION = { x: 0, y: 0 };

const MOVE_TOOL_ID = 'move';

interface MoveMessage {
  readonly dx: number;
  readonly dy: number;
}

/** 移動入力が上下左右いずれか1マス分の単位ベクトルであることを検証する。 */
function isMoveMessage(message: unknown): message is MoveMessage {
  if (typeof message !== 'object' || message === null) return false;
  const { dx, dy } = message as Record<string, unknown>;
  if (typeof dx !== 'number' || typeof dy !== 'number') return false;
  const isUnitAxis = (value: number): boolean => value === -1 || value === 0 || value === 1;
  return isUnitAxis(dx) && isUnitAxis(dy) && Math.abs(dx) + Math.abs(dy) === 1;
}

export class PlayerState extends Schema {
  @type('string') sessionId = '';
  @type('string') roleId = '';
  @type('number') x = INITIAL_POSITION.x;
  @type('number') y = INITIAL_POSITION.y;
}

export class ParallaxRoomState extends Schema {
  @type({ map: PlayerState }) players = new MapSchema<PlayerState>();
}

/**
 * 「見えない座標室」のロビー〜プレイを担うルーム。
 * 入室順に観測者→測量士の役職を割り当て、ルーム状態に反映する。
 */
export class ParallaxRoom extends Room<{ state: ParallaxRoomState }> {
  maxClients = ROLE_ASSIGNMENT_ORDER.length;

  onCreate(): void {
    this.setState(new ParallaxRoomState());
    this.onMessage<unknown>('move', (client, message) => this.handleMove(client, message));
  }

  onJoin(client: Client): void {
    const roleId = ROLE_ASSIGNMENT_ORDER[this.state.players.size];
    if (roleId === undefined) {
      throw new Error(`役職を割り当てられません(定員 ${this.maxClients} を超えています)`);
    }
    const player = new PlayerState();
    player.sessionId = client.sessionId;
    player.roleId = roleId;
    this.state.players.set(client.sessionId, player);
  }

  /**
   * 移動ツールを持つ役職(観測者)からの移動入力を受け、障害物レイヤーとの
   * 衝突判定を core の resolveMove で行った上で位置を更新する。
   */
  private handleMove(client: Client, message: unknown): void {
    if (!isMoveMessage(message)) return;

    const player = this.state.players.get(client.sessionId);
    if (player === undefined) return;

    const role = INVISIBLE_COORDINATE_ROOM.roles.find((candidate) => candidate.id === player.roleId);
    if (role === undefined || !role.tools.includes(MOVE_TOOL_ID)) return;

    const next = resolveMove(
      INVISIBLE_COORDINATE_ROOM.layers,
      { x: player.x, y: player.y },
      { x: message.dx, y: message.dy },
    );
    player.x = next.x;
    player.y = next.y;
  }

  onLeave(client: Client): void {
    this.state.players.delete(client.sessionId);
  }
}
