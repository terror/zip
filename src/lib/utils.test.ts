import { describe, expect, it } from 'bun:test';

import {
  arePositionsAdjacent,
  findPositionInPath,
  formatTime,
  isValidGridPosition,
} from './utils';

describe('arePositionsAdjacent', () => {
  it.each([
    {
      pos1: { row: 1, col: 1 },
      pos2: { row: 1, col: 2 },
      expected: true,
      description: 'right adjacent',
    },
    {
      pos1: { row: 1, col: 1 },
      pos2: { row: 2, col: 1 },
      expected: true,
      description: 'down adjacent',
    },
    {
      pos1: { row: 1, col: 1 },
      pos2: { row: 1, col: 0 },
      expected: true,
      description: 'left adjacent',
    },
    {
      pos1: { row: 1, col: 1 },
      pos2: { row: 0, col: 1 },
      expected: true,
      description: 'up adjacent',
    },
    {
      pos1: { row: 1, col: 1 },
      pos2: { row: 1, col: 1 },
      expected: false,
      description: 'same position',
    },
    {
      pos1: { row: 1, col: 1 },
      pos2: { row: 3, col: 1 },
      expected: false,
      description: 'two rows apart',
    },
    {
      pos1: { row: 1, col: 1 },
      pos2: { row: 2, col: 2 },
      expected: false,
      description: 'diagonal',
    },
  ])(
    'returns $expected when positions are $description',
    ({ pos1, pos2, expected }) => {
      expect(arePositionsAdjacent(pos1, pos2)).toBe(expected);
    }
  );
});

describe('findPositionInPath', () => {
  const testPath = [
    { row: 0, col: 0 },
    { row: 0, col: 1 },
    { row: 1, col: 1 },
    { row: 2, col: 1 },
  ];

  it('finds existing positions', () => {
    expect(findPositionInPath(testPath, 0, 0)).toBe(0);
    expect(findPositionInPath(testPath, 1, 1)).toBe(2);
    expect(findPositionInPath(testPath, 2, 1)).toBe(3);
  });

  it('returns -1 for non-existing positions', () => {
    expect(findPositionInPath(testPath, 5, 5)).toBe(-1);
    expect(findPositionInPath(testPath, 0, 2)).toBe(-1);
  });
});

describe('formatTime', () => {
  it('formats milliseconds correctly', () => {
    expect(formatTime(0)).toBe('0:00.00');
    expect(formatTime(1000)).toBe('0:01.00');
    expect(formatTime(60000)).toBe('1:00.00');
    expect(formatTime(61234)).toBe('1:01.23');
    expect(formatTime(3665450)).toBe('61:05.45');
  });
});

describe('isValidGridPosition', () => {
  it('returns true for valid positions', () => {
    expect(isValidGridPosition(0, 0, 5)).toBe(true);
    expect(isValidGridPosition(2, 3, 5)).toBe(true);
    expect(isValidGridPosition(4, 4, 5)).toBe(true);
  });

  it('returns false for invalid positions', () => {
    expect(isValidGridPosition(-1, 0, 5)).toBe(false);
    expect(isValidGridPosition(0, -1, 5)).toBe(false);
    expect(isValidGridPosition(5, 0, 5)).toBe(false);
    expect(isValidGridPosition(0, 5, 5)).toBe(false);
    expect(isValidGridPosition(5, 5, 5)).toBe(false);
  });
});
