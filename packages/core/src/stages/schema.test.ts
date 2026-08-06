import { describe, expect, it } from 'vitest';
import { slopeLine } from '../line.js';
import type { StageDefinition } from './schema.js';
import { evaluateClearCondition, validateStageDefinition } from './schema.js';

function makeValidStage(): StageDefinition {
  return {
    id: 'invisible-coordinate-room',
    name: '見えない座標室',
    layers: [
      { id: 'room', kind: 'tile', tiles: [{ x: 0, y: 0, type: 'floor' }] },
      {
        id: 'axes',
        kind: 'object',
        objects: [{ id: 'device', type: 'device', position: { x: 0, y: -3 } }],
      },
      {
        id: 'condition-text',
        kind: 'textCondition',
        texts: [{ id: 'hint', content: 'y = 2x - 3' }],
      },
    ],
    roles: [
      { id: 'observer', name: '観測者', visibleLayerIds: ['room'], tools: ['move'] },
      {
        id: 'surveyor',
        name: '測量士',
        visibleLayerIds: ['axes', 'condition-text'],
        tools: ['measure'],
      },
    ],
    clearCondition: {
      kind: 'all',
      conditions: [
        { kind: 'onLine', roleId: 'observer', line: slopeLine(2, -3) },
        { kind: 'distanceFromPoint', roleId: 'observer', point: { x: 0, y: -3 }, distance: 5 },
      ],
    },
  };
}

describe('validateStageDefinition', () => {
  it('accepts a well-formed stage definition', () => {
    const result = validateStageDefinition(makeValidStage());
    expect(result).toEqual({ valid: true });
  });

  it('rejects a stage with no layers', () => {
    const stage: StageDefinition = { ...makeValidStage(), layers: [] };
    const result = validateStageDefinition(stage);
    expect(result.valid).toBe(false);
    expect(!result.valid && result.errors).toContain('layers が空です');
  });

  it('rejects a stage with no roles', () => {
    const stage: StageDefinition = { ...makeValidStage(), roles: [] };
    const result = validateStageDefinition(stage);
    expect(result.valid).toBe(false);
    expect(!result.valid && result.errors).toContain('roles が空です');
  });

  it('rejects duplicate layer ids', () => {
    const base = makeValidStage();
    const stage: StageDefinition = { ...base, layers: [...base.layers, base.layers[0]!] };
    const result = validateStageDefinition(stage);
    expect(result.valid).toBe(false);
    expect(!result.valid && result.errors.some((e) => e.includes('room'))).toBe(true);
  });

  it('rejects duplicate role ids', () => {
    const base = makeValidStage();
    const stage: StageDefinition = { ...base, roles: [...base.roles, base.roles[0]!] };
    const result = validateStageDefinition(stage);
    expect(result.valid).toBe(false);
    expect(!result.valid && result.errors.some((e) => e.includes('observer'))).toBe(true);
  });

  it('rejects a role referencing an unknown layer id', () => {
    const base = makeValidStage();
    const stage: StageDefinition = {
      ...base,
      roles: [{ ...base.roles[0]!, visibleLayerIds: ['does-not-exist'] }, base.roles[1]!],
    };
    const result = validateStageDefinition(stage);
    expect(result.valid).toBe(false);
    expect(!result.valid && result.errors.some((e) => e.includes('does-not-exist'))).toBe(true);
  });

  it('rejects a clear condition referencing an unknown role id', () => {
    const base = makeValidStage();
    const stage: StageDefinition = {
      ...base,
      clearCondition: { kind: 'onLine', roleId: 'ghost', line: slopeLine(1, 0) },
    };
    const result = validateStageDefinition(stage);
    expect(result.valid).toBe(false);
    expect(!result.valid && result.errors.some((e) => e.includes('ghost'))).toBe(true);
  });

  it('rejects an empty all/any condition list', () => {
    const base = makeValidStage();
    const stage: StageDefinition = { ...base, clearCondition: { kind: 'any', conditions: [] } };
    const result = validateStageDefinition(stage);
    expect(result.valid).toBe(false);
    expect(!result.valid && result.errors.some((e) => e.includes('any'))).toBe(true);
  });

  it('accepts nested all/any conditions', () => {
    const base = makeValidStage();
    const stage: StageDefinition = {
      ...base,
      clearCondition: {
        kind: 'any',
        conditions: [
          { kind: 'onLine', roleId: 'observer', line: slopeLine(2, -3) },
          {
            kind: 'all',
            conditions: [
              { kind: 'onLine', roleId: 'observer', line: slopeLine(1, 0) },
              { kind: 'distanceFromPoint', roleId: 'observer', point: { x: 0, y: 0 }, distance: 1 },
            ],
          },
        ],
      },
    };
    const result = validateStageDefinition(stage);
    expect(result).toEqual({ valid: true });
  });
});

describe('evaluateClearCondition', () => {
  it('returns true when the role is on the line', () => {
    const condition = { kind: 'onLine' as const, roleId: 'observer', line: slopeLine(2, -3) };
    expect(evaluateClearCondition(condition, { observer: { x: 1, y: -1 } })).toBe(true);
  });

  it('returns false when the role is off the line', () => {
    const condition = { kind: 'onLine' as const, roleId: 'observer', line: slopeLine(2, -3) };
    expect(evaluateClearCondition(condition, { observer: { x: 1, y: 0 } })).toBe(false);
  });

  it('returns false when the role position is missing', () => {
    const condition = { kind: 'onLine' as const, roleId: 'observer', line: slopeLine(2, -3) };
    expect(evaluateClearCondition(condition, {})).toBe(false);
  });

  it('returns true when the role is at the given distance from a point', () => {
    const condition = {
      kind: 'distanceFromPoint' as const,
      roleId: 'observer',
      point: { x: 0, y: 0 },
      distance: 5,
    };
    expect(evaluateClearCondition(condition, { observer: { x: 3, y: 4 } })).toBe(true);
  });

  it('returns false when the role is not at the given distance from a point', () => {
    const condition = {
      kind: 'distanceFromPoint' as const,
      roleId: 'observer',
      point: { x: 0, y: 0 },
      distance: 5,
    };
    expect(evaluateClearCondition(condition, { observer: { x: 1, y: 1 } })).toBe(false);
  });

  it('requires every condition to hold for "all"', () => {
    const condition = {
      kind: 'all' as const,
      conditions: [
        { kind: 'onLine' as const, roleId: 'observer', line: slopeLine(2, -3) },
        {
          kind: 'distanceFromPoint' as const,
          roleId: 'observer',
          point: { x: 0, y: -3 },
          distance: 5,
        },
      ],
    };
    expect(evaluateClearCondition(condition, { observer: { x: 1, y: -1 } })).toBe(false);

    const onLineAndAtDistance = { x: 0 + Math.sqrt(5), y: -3 + 2 * Math.sqrt(5) };
    expect(evaluateClearCondition(condition, { observer: onLineAndAtDistance })).toBe(true);
  });

  it('requires only one condition to hold for "any"', () => {
    const condition = {
      kind: 'any' as const,
      conditions: [
        { kind: 'onLine' as const, roleId: 'observer', line: slopeLine(2, -3) },
        {
          kind: 'distanceFromPoint' as const,
          roleId: 'observer',
          point: { x: 100, y: 100 },
          distance: 5,
        },
      ],
    };
    expect(evaluateClearCondition(condition, { observer: { x: 1, y: -1 } })).toBe(true);
  });
});
