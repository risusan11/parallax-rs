import { INVISIBLE_COORDINATE_ROOM } from '@parallax-rs/core';
import { MapSchema, Schema, type } from '@colyseus/schema';
import { Room, type Client } from 'colyseus';

/** 入室順に割り当てる役職ID。ステージ定義の roles 順(観測者→測量士)をそのまま使う。 */
const ROLE_ASSIGNMENT_ORDER: ReadonlyArray<string> = INVISIBLE_COORDINATE_ROOM.roles.map(
  (role) => role.id,
);

export class PlayerState extends Schema {
  @type('string') sessionId = '';
  @type('string') roleId = '';
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

  onLeave(client: Client): void {
    this.state.players.delete(client.sessionId);
  }
}
