import { createGameServer } from './server.js';

export { createGameServer, PARALLAX_ROOM_NAME } from './server.js';
export { ParallaxRoom, ParallaxRoomState, PlayerState } from './rooms/parallax-room.js';
export type { RoomStatus } from './rooms/parallax-room.js';

const DEFAULT_PORT = 2567;

function resolvePort(): number {
  const raw = process.env.PORT;
  if (raw === undefined) return DEFAULT_PORT;
  const parsed = Number(raw);
  return Number.isNaN(parsed) ? DEFAULT_PORT : parsed;
}

async function main(): Promise<void> {
  const server = createGameServer();
  const port = resolvePort();
  await server.listen(port);
  console.log(`parallax-rs server listening on port ${port}`);
}

void main();
