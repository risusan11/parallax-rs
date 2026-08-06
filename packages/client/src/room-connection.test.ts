import { describe, expect, it } from 'vitest';
import { formatRoomStateLog, resolveServerUrl } from './room-connection.js';

describe('resolveServerUrl', () => {
  it('環境変数が設定されていればそれを使う', () => {
    expect(resolveServerUrl('wss://example.com')).toBe('wss://example.com');
  });

  it('未設定ならローカル開発用のデフォルトを使う', () => {
    expect(resolveServerUrl(undefined)).toBe('ws://localhost:2567');
  });

  it('空文字もデフォルトとして扱う', () => {
    expect(resolveServerUrl('')).toBe('ws://localhost:2567');
  });
});

describe('formatRoomStateLog', () => {
  it('status とプレイヤー一覧を1行に整形する', () => {
    const log = formatRoomStateLog({
      status: 'playing',
      players: [
        { sessionId: 'abcdef123', roleId: 'observer', x: 1, y: -2 },
        { sessionId: 'ghijkl456', roleId: 'surveyor', x: 0, y: 0 },
      ],
    });

    expect(log).toBe('[status: playing] observer(abcdef): (1, -2), surveyor(ghijkl): (0, 0)');
  });

  it('プレイヤーがいない場合も status を表示する', () => {
    expect(formatRoomStateLog({ status: 'waiting', players: [] })).toBe('[status: waiting] ');
  });
});
