import { describe, expect, it } from 'vitest';
import { buildRoomSearch, buildShareUrl, extractRoomId, formatLobbyStatus } from './lobby-url.js';

describe('extractRoomId', () => {
  it('room クエリパラメータの値を返す', () => {
    expect(extractRoomId('?room=abc123')).toBe('abc123');
  });

  it('room パラメータが無ければ undefined を返す', () => {
    expect(extractRoomId('')).toBeUndefined();
    expect(extractRoomId('?other=1')).toBeUndefined();
  });

  it('room パラメータが空文字なら undefined を返す', () => {
    expect(extractRoomId('?room=')).toBeUndefined();
  });
});

describe('buildRoomSearch', () => {
  it('room パラメータを含む検索文字列を組み立てる', () => {
    expect(buildRoomSearch('abc123')).toBe('?room=abc123');
  });
});

describe('buildShareUrl', () => {
  it('origin・pathname・ルームIDから共有URLを組み立てる', () => {
    expect(buildShareUrl('https://example.com', '/', 'abc123')).toBe(
      'https://example.com/?room=abc123',
    );
  });
});

describe('formatLobbyStatus', () => {
  it('人数が定員未満なら招待を促す文言を返す', () => {
    expect(formatLobbyStatus(1, 2)).toBe('参加者 1/2人。URLを共有してもう1人を招待してください。');
  });

  it('定員に達したら開始を知らせる文言を返す', () => {
    expect(formatLobbyStatus(2, 2)).toBe('参加者が揃いました。開始します…');
  });
});
