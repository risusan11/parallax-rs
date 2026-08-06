import { describe, expect, it } from 'vitest';
import { directionToMoveDelta } from './movement-input.js';

describe('directionToMoveDelta', () => {
  it('up は y を -1 する', () => {
    expect(directionToMoveDelta('up')).toEqual({ x: 0, y: -1 });
  });

  it('down は y を +1 する', () => {
    expect(directionToMoveDelta('down')).toEqual({ x: 0, y: 1 });
  });

  it('left は x を -1 する', () => {
    expect(directionToMoveDelta('left')).toEqual({ x: -1, y: 0 });
  });

  it('right は x を +1 する', () => {
    expect(directionToMoveDelta('right')).toEqual({ x: 1, y: 0 });
  });
});
