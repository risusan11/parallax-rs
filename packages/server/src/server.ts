import { Server } from 'colyseus';
import { ParallaxRoom } from './rooms/parallax-room.js';

export const PARALLAX_ROOM_NAME = 'parallax';

/** Colyseus サーバーインスタンスを組み立てる。本番エントリポイントとテストの両方から使う。 */
export function createGameServer(): Server {
  const server = new Server();
  server.define(PARALLAX_ROOM_NAME, ParallaxRoom);
  return server;
}
