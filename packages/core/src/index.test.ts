import { describe, expect, it } from 'vitest';
import { isCoreReady } from './index.js';

describe('isCoreReady', () => {
  it('returns true', () => {
    expect(isCoreReady()).toBe(true);
  });
});
