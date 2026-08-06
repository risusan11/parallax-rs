import { describe, expect, it } from 'vitest';
import { candidatePointsOnLineAtDistance } from '../line.js';
import {
  DEVICE_POSITION,
  INVISIBLE_COORDINATE_ROOM,
  TARGET_DISTANCE,
  TARGET_LINE,
} from './invisible-coordinate-room.js';
import { evaluateClearCondition, validateStageDefinition } from './schema.js';

describe('INVISIBLE_COORDINATE_ROOM', () => {
  it('is a valid stage definition', () => {
    expect(validateStageDefinition(INVISIBLE_COORDINATE_ROOM)).toEqual({ valid: true });
  });

  it('only reveals the room layer to the observer', () => {
    const observer = INVISIBLE_COORDINATE_ROOM.roles.find((role) => role.id === 'observer');
    expect(observer?.visibleLayerIds).toEqual(['room']);
  });

  it('only reveals the axes/obstacles and condition text layers to the surveyor', () => {
    const surveyor = INVISIBLE_COORDINATE_ROOM.roles.find((role) => role.id === 'surveyor');
    expect(surveyor?.visibleLayerIds).toEqual(['axes-and-obstacles', 'condition-text']);
  });

  it('computes candidate points that satisfy the clear condition', () => {
    const candidates = candidatePointsOnLineAtDistance(
      TARGET_LINE,
      DEVICE_POSITION,
      TARGET_DISTANCE,
    );
    expect(candidates).toHaveLength(2);

    for (const candidate of candidates) {
      expect(
        evaluateClearCondition(INVISIBLE_COORDINATE_ROOM.clearCondition, { observer: candidate }),
      ).toBe(true);
    }
  });

  it('does not clear when the observer is on the line but at the wrong distance', () => {
    const onLineWrongDistance = { x: 1, y: -1 };
    expect(
      evaluateClearCondition(INVISIBLE_COORDINATE_ROOM.clearCondition, {
        observer: onLineWrongDistance,
      }),
    ).toBe(false);
  });

  it('does not clear when the observer is at the right distance but off the line', () => {
    const rightDistanceOffLine = { x: DEVICE_POSITION.x + TARGET_DISTANCE, y: DEVICE_POSITION.y };
    expect(
      evaluateClearCondition(INVISIBLE_COORDINATE_ROOM.clearCondition, {
        observer: rightDistanceOffLine,
      }),
    ).toBe(false);
  });

  it('does not clear when only the surveyor is at a candidate point', () => {
    const [candidate] = candidatePointsOnLineAtDistance(
      TARGET_LINE,
      DEVICE_POSITION,
      TARGET_DISTANCE,
    );
    expect(
      evaluateClearCondition(INVISIBLE_COORDINATE_ROOM.clearCondition, { surveyor: candidate! }),
    ).toBe(false);
  });
});
