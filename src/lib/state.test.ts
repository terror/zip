import { describe, expect, it } from 'bun:test';

import { Cell } from './generator';
import { GameState } from './state';

describe('GameState', () => {
  const testGrid: Cell[][] = [
    [
      { row: 0, col: 0, filled: false, number: 1 },
      { row: 0, col: 1, filled: false },
    ],
    [
      { row: 1, col: 0, filled: false },
      { row: 1, col: 1, filled: false, number: 2 },
    ],
  ];

  it('constructs with default values', () => {
    const state = new GameState(testGrid);
    expect(state.grid).toBe(testGrid);
    expect(state.path).toEqual([]);
    expect(state.currentNumber).toBe(1);
    expect(state.gameStarted).toBe(false);
    expect(state.isComplete).toBe(false);
  });

  it('constructs with custom values', () => {
    const path = [{ row: 0, col: 0 }];
    const state = new GameState(testGrid, path, 2, true, true);
    expect(state.grid).toBe(testGrid);
    expect(state.path).toBe(path);
    expect(state.currentNumber).toBe(2);
    expect(state.gameStarted).toBe(true);
    expect(state.isComplete).toBe(true);
  });

  it('updates with partial values', () => {
    const state = new GameState(testGrid);

    const updatedState = state.update({
      currentNumber: 3,
      gameStarted: true,
    });

    expect(updatedState.grid).toBe(testGrid);
    expect(updatedState.path).toEqual([]);
    expect(updatedState.currentNumber).toBe(3);
    expect(updatedState.gameStarted).toBe(true);
    expect(updatedState.isComplete).toBe(false);
  });

  it('resets to initial values', () => {
    const path = [{ row: 0, col: 0 }];
    const state = new GameState(testGrid, path, 3, true, true);
    const resetState = state.reset();
    expect(resetState.grid).not.toBe(testGrid); // New grid with reset filled states
    expect(resetState.path).toEqual([]);
    expect(resetState.currentNumber).toBe(1);
    expect(resetState.gameStarted).toBe(false);
    expect(resetState.isComplete).toBe(false);
  });

  it('calculates current number from path', () => {
    const path = [
      { row: 0, col: 0 }, // number: 1
      { row: 1, col: 0 }, // no number
      { row: 1, col: 1 }, // number: 2
    ];

    const state = new GameState(testGrid, path);

    expect(state.calculateCurrentNumber()).toBe(2);
  });

  it('calculates current number with empty path', () => {
    const state = new GameState(testGrid, []);
    expect(state.calculateCurrentNumber()).toBe(1);
  });

  it('checks if path can be extended to adjacent cell', () => {
    const state = new GameState(testGrid, [{ row: 0, col: 0 }], 1);

    const targetCell: Cell = { row: 0, col: 1, filled: false };

    expect(state.canExtendPath({ row: 0, col: 1 }, targetCell)).toBe(true);
  });

  it('checks if path can be extended to cell with next expected number', () => {
    const state = new GameState(testGrid, [{ row: 0, col: 0 }], 1);

    const targetCell: Cell = { row: 1, col: 0, filled: false, number: 2 };

    expect(state.canExtendPath({ row: 1, col: 0 }, targetCell)).toBe(true);
  });

  it('rejects extending path to non-adjacent positions', () => {
    const state = new GameState(testGrid, [{ row: 0, col: 0 }], 1);

    const targetCell: Cell = { row: 1, col: 1, filled: false };

    expect(state.canExtendPath({ row: 1, col: 1 }, targetCell)).toBe(false);
  });

  it('rejects extending path when at max number', () => {
    const state = new GameState(testGrid, [{ row: 0, col: 0 }], 2);

    const targetCell: Cell = { row: 0, col: 1, filled: false };

    expect(state.canExtendPath({ row: 0, col: 1 }, targetCell)).toBe(false);
  });

  it('rejects extending empty path', () => {
    const state = new GameState(testGrid, [], 1);

    const targetCell: Cell = { row: 0, col: 1, filled: false };

    expect(state.canExtendPath({ row: 0, col: 1 }, targetCell)).toBe(false);
  });

  it('checks game completion when all cells filled and max number reached', () => {
    const filledGrid: Cell[][] = [
      [
        { row: 0, col: 0, filled: true, number: 1 },
        { row: 0, col: 1, filled: true },
      ],
      [
        { row: 1, col: 0, filled: true },
        { row: 1, col: 1, filled: true, number: 2 },
      ],
    ];

    const state = new GameState(filledGrid, [], 2);

    expect(state.checkGameCompletion()).toBe(true);
  });

  it('checks game completion returns false when not all cells filled', () => {
    const partialGrid: Cell[][] = [
      [
        { row: 0, col: 0, filled: true, number: 1 },
        { row: 0, col: 1, filled: false },
      ],
      [
        { row: 1, col: 0, filled: true },
        { row: 1, col: 1, filled: true, number: 2 },
      ],
    ];

    const state = new GameState(partialGrid, [], 2);

    expect(state.checkGameCompletion()).toBe(false);
  });

  it('checks game completion returns false when max number not reached', () => {
    const filledGrid: Cell[][] = [
      [
        { row: 0, col: 0, filled: true, number: 1 },
        { row: 0, col: 1, filled: true },
      ],
      [
        { row: 1, col: 0, filled: true },
        { row: 1, col: 1, filled: true, number: 2 },
      ],
    ];

    const state = new GameState(filledGrid, [], 1);

    expect(state.checkGameCompletion()).toBe(false);
  });

  it('gets maximum number from grid', () => {
    const state = new GameState(testGrid);
    expect(state.getMaxNumber()).toBe(2);
  });

  it('gets maximum number from grid with no numbers', () => {
    const emptyGrid: Cell[][] = [
      [
        { row: 0, col: 0, filled: false },
        { row: 0, col: 1, filled: false },
      ],
    ];

    const state = new GameState(emptyGrid);

    expect(state.getMaxNumber()).toBe(-Infinity);
  });

  it('resets grid filled states', () => {
    const filledGrid: Cell[][] = [
      [
        { row: 0, col: 0, filled: true, number: 1 },
        { row: 0, col: 1, filled: true },
      ],
      [
        { row: 1, col: 0, filled: false },
        { row: 1, col: 1, filled: true, number: 2 },
      ],
    ];

    const state = new GameState(filledGrid);
    const resetState = state.resetGridFilled();

    expect(resetState.grid[0][0].filled).toBe(false);
    expect(resetState.grid[0][1].filled).toBe(false);
    expect(resetState.grid[1][0].filled).toBe(false);
    expect(resetState.grid[1][1].filled).toBe(false);

    // Preserve other properties
    expect(resetState.grid[0][0].number).toBe(1);
    expect(resetState.grid[1][1].number).toBe(2);
  });

  it('trims path to target position', () => {
    const path = [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 1, col: 1 },
      { row: 1, col: 0 },
    ];

    const state = new GameState(testGrid, path);
    const trimmedState = state.trimPathToPosition(1, 1);

    expect(trimmedState.path).toHaveLength(3);
    expect(trimmedState.path[2]).toEqual({ row: 1, col: 1 });
  });

  it('trims path returns original when position not found', () => {
    const path = [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
    ];

    const state = new GameState(testGrid, path);
    const trimmedState = state.trimPathToPosition(5, 5);

    expect(trimmedState).toBe(state);
  });

  it('trims path to first position', () => {
    const path = [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 1, col: 1 },
    ];

    const state = new GameState(testGrid, path);
    const trimmedState = state.trimPathToPosition(0, 0);

    expect(trimmedState.path).toHaveLength(1);
    expect(trimmedState.path[0]).toEqual({ row: 0, col: 0 });
  });

  it('updates grid with path', () => {
    const path = [
      { row: 0, col: 0 },
      { row: 1, col: 0 },
    ];

    const state = new GameState(testGrid);
    const updatedGrid = state.updateGridWithPath(path);

    expect(updatedGrid[0][0].filled).toBe(true);
    expect(updatedGrid[0][1].filled).toBe(false);
    expect(updatedGrid[1][0].filled).toBe(true);
    expect(updatedGrid[1][1].filled).toBe(false);
  });

  it('updates grid with empty path', () => {
    const filledGrid: Cell[][] = [
      [
        { row: 0, col: 0, filled: true },
        { row: 0, col: 1, filled: true },
      ],
    ];

    const state = new GameState(filledGrid);
    const updatedGrid = state.updateGridWithPath([]);

    expect(updatedGrid[0][0].filled).toBe(false);
    expect(updatedGrid[0][1].filled).toBe(false);
  });

  it('updates grid using instance path when no path provided', () => {
    const path = [{ row: 0, col: 0 }];
    const state = new GameState(testGrid, path);
    const updatedGrid = state.updateGridWithPath();

    expect(updatedGrid[0][0].filled).toBe(true);
    expect(updatedGrid[0][1].filled).toBe(false);
    expect(updatedGrid[1][0].filled).toBe(false);
    expect(updatedGrid[1][1].filled).toBe(false);
  });
});
