import { describe, expect, it } from 'vitest';
import { formatElapsedTime, formatResultSummary } from './result-view.js';

describe('formatElapsedTime', () => {
  it('1分未満は 0:秒(2桁) で表示する', () => {
    expect(formatElapsedTime(0)).toBe('0:00');
    expect(formatElapsedTime(12345)).toBe('0:12');
  });

  it('1分以上は 分:秒 で表示する', () => {
    expect(formatElapsedTime(65000)).toBe('1:05');
  });

  it('端数のミリ秒は切り捨てる', () => {
    expect(formatElapsedTime(999)).toBe('0:00');
    expect(formatElapsedTime(1999)).toBe('0:01');
  });
});

describe('formatResultSummary', () => {
  it('クリア時間・移動距離・リトライ回数を1行ずつに整形する', () => {
    const summary = formatResultSummary({ clearTimeMs: 65000, observerDistance: 8, retryCount: 2 });
    expect(summary).toEqual([
      'クリア時間: 1:05',
      '観測者の移動距離: 8マス',
      'リトライ回数: 2回',
    ]);
  });
});
