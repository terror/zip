import { describe, expect, it } from 'bun:test';

import {
  addNumbersToGrid,
  createEmptyGrid,
  generateRandomPath,
  shuffleArray,
} from './generator';

describe('addNumbersToGrid', () => {
  it('adds numbers at correct positions', () => {
    const grid = createEmptyGrid(3);

    const path = [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
      { row: 1, col: 2 },
      { row: 2, col: 2 },
      { row: 2, col: 1 },
      { row: 2, col: 0 },
      { row: 1, col: 0 },
      { row: 1, col: 1 },
    ];

    const numberedGrid = addNumbersToGrid(grid, path);

    expect(numberedGrid[0][0].number).toBe(1);
    expect(numberedGrid[1][2].number).toBe(2);
    expect(numberedGrid[2][0].number).toBe(3);
    expect(numberedGrid[1][1].number).toBe(4);
  });

  it('preserves original grid structure', () => {
    const grid = createEmptyGrid(2);

    const path = [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 1, col: 1 },
      { row: 1, col: 0 },
    ];

    const numberedGrid = addNumbersToGrid(grid, path);

    expect(numberedGrid[0][0].row).toBe(0);
    expect(numberedGrid[0][0].col).toBe(0);
    expect(numberedGrid[0][0].filled).toBe(false);
  });
});

describe('createEmptyGrid', () => {
  it('creates a grid of the correct size', () => {
    const grid = createEmptyGrid(3);

    expect(grid).toHaveLength(3);
    expect(grid[0]).toHaveLength(3);
    expect(grid[2]).toHaveLength(3);
  });

  it('creates cells with correct initial properties', () => {
    const grid = createEmptyGrid(2);

    expect(grid[0][0]).toEqual({
      row: 0,
      col: 0,
      filled: false,
    });

    expect(grid[1][1]).toEqual({
      row: 1,
      col: 1,
      filled: false,
    });
  });
});

describe('generateRandomPath', () => {
  it('generates path covering all cells', () => {
    const size = 3;
    const path = generateRandomPath(size);
    expect(path).toHaveLength(size * size);
  });

  it('generates path with valid positions', () => {
    const size = 3;

    const path = generateRandomPath(size);

    for (const pos of path) {
      expect(pos.row).toBeGreaterThanOrEqual(0);
      expect(pos.row).toBeLessThan(size);
      expect(pos.col).toBeGreaterThanOrEqual(0);
      expect(pos.col).toBeLessThan(size);
    }
  });

  it('generates path with unique positions', () => {
    const size = 3;
    const path = generateRandomPath(size);
    const uniquePositions = new Set(path.map((p) => `${p.row}-${p.col}`));
    expect(uniquePositions.size).toBe(path.length);
  });

  it('generates connected path', () => {
    const size = 3;

    const path = generateRandomPath(size);

    for (let i = 1; i < path.length; i++) {
      const prev = path[i - 1];

      const curr = path[i];

      const distance =
        Math.abs(curr.row - prev.row) + Math.abs(curr.col - prev.col);

      expect(distance).toBe(1);
    }
  });
});

describe('shuffleArray', () => {
  it('returns array of same length', () => {
    const original = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(original);
    expect(shuffled).toHaveLength(5);
  });

  it('contains same elements', () => {
    const original = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(original);
    expect(shuffled.sort()).toEqual([1, 2, 3, 4, 5]);
  });

  it('does not modify original array', () => {
    const original = [1, 2, 3, 4, 5];
    const originalCopy = [...original];
    shuffleArray(original);
    expect(original).toEqual(originalCopy);
  });
});
