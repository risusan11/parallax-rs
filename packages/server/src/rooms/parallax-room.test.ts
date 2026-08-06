import { type ColyseusTestServer, boot } from '@colyseus/testing';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PARALLAX_ROOM_NAME, createGameServer } from '../server.js';

describe('ParallaxRoom', () => {
  let testServer: ColyseusTestServer;

  beforeAll(async () => {
    testServer = await boot(createGameServer());
  });

  afterAll(async () => {
    await testServer.shutdown();
  });

  it('入室順に観測者→測量士の役職を割り当てる', async () => {
    const room = await testServer.createRoom(PARALLAX_ROOM_NAME, {});
    const observerClient = await testServer.connectTo(room);
    const surveyorClient = await testServer.connectTo(room);

    expect(room.state.players.get(observerClient.sessionId)?.roleId).toBe('observer');
    expect(room.state.players.get(surveyorClient.sessionId)?.roleId).toBe('surveyor');

    await observerClient.leave();
    await surveyorClient.leave();
  });

  it('同じルームIDでの合流(joinById)ができる', async () => {
    const room = await testServer.createRoom(PARALLAX_ROOM_NAME, {});
    const firstClient = await testServer.connectTo(room);
    const secondClient = await testServer.connectTo(room);

    expect(firstClient.roomId).toBe(room.roomId);
    expect(secondClient.roomId).toBe(room.roomId);
    expect(room.state.players.size).toBe(2);

    await firstClient.leave();
    await secondClient.leave();
  });

  it('退室するとルーム状態から取り除かれる', async () => {
    const room = await testServer.createRoom(PARALLAX_ROOM_NAME, {});
    const observerClient = await testServer.connectTo(room);
    const surveyorClient = await testServer.connectTo(room);

    await observerClient.leave();
    await room.waitForNextPatch();

    expect(room.state.players.has(observerClient.sessionId)).toBe(false);
    expect(room.state.players.size).toBe(1);

    await surveyorClient.leave();
  });

  it('定員(2人)を超えて入室しようとするとルームがロックされる', async () => {
    const room = await testServer.createRoom(PARALLAX_ROOM_NAME, {});
    const observerClient = await testServer.connectTo(room);
    const surveyorClient = await testServer.connectTo(room);

    expect(room.locked).toBe(true);

    await observerClient.leave();
    await surveyorClient.leave();
  });

  it('観測者の移動入力で位置が更新され、全クライアントに同期される', async () => {
    const room = await testServer.createRoom(PARALLAX_ROOM_NAME, {});
    const observerClient = await testServer.connectTo(room);
    const surveyorClient = await testServer.connectTo(room);

    observerClient.send('move', { dx: 1, dy: 0 });
    await room.waitForNextPatch();

    const observerState = room.state.players.get(observerClient.sessionId);
    expect(observerState?.x).toBe(1);
    expect(observerState?.y).toBe(0);
    expect(surveyorClient.state.players.get(observerClient.sessionId)?.x).toBe(1);

    await observerClient.leave();
    await surveyorClient.leave();
  });

  it('障害物のあるマスへの移動は無視され、位置が変わらない', async () => {
    const room = await testServer.createRoom(PARALLAX_ROOM_NAME, {});
    const observerClient = await testServer.connectTo(room);
    const surveyorClient = await testServer.connectTo(room);

    observerClient.send('move', { dx: 0, dy: -1 });
    await room.waitForNextPatch();
    observerClient.send('move', { dx: 1, dy: 0 });
    await room.waitForNextPatch();

    const observerState = room.state.players.get(observerClient.sessionId);
    expect(observerState?.x).toBe(0);
    expect(observerState?.y).toBe(-1);

    await observerClient.leave();
    await surveyorClient.leave();
  });

  it('部屋の外へ出る移動は無視される', async () => {
    const room = await testServer.createRoom(PARALLAX_ROOM_NAME, {});
    const observerClient = await testServer.connectTo(room);
    const surveyorClient = await testServer.connectTo(room);

    for (let i = 0; i < 9; i++) {
      observerClient.send('move', { dx: -1, dy: 0 });
      await room.waitForNextPatch();
    }

    const observerState = room.state.players.get(observerClient.sessionId);
    expect(observerState?.x).toBe(-8);

    await observerClient.leave();
    await surveyorClient.leave();
  });

  it('移動ツールを持たない測量士の移動入力は無視される', async () => {
    const room = await testServer.createRoom(PARALLAX_ROOM_NAME, {});
    const observerClient = await testServer.connectTo(room);
    const surveyorClient = await testServer.connectTo(room);

    surveyorClient.send('move', { dx: 1, dy: 0 });
    await room.waitForNextPatch();

    const surveyorState = room.state.players.get(surveyorClient.sessionId);
    expect(surveyorState?.x).toBe(0);
    expect(surveyorState?.y).toBe(0);

    await observerClient.leave();
    await surveyorClient.leave();
  });
});
