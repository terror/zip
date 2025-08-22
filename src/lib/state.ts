import { Cell } from './generator';

export class GameState {
  public grid: Cell[][];
  public path: Array<{ row: number; col: number }>;
  public currentNumber: number;
  public isComplete: boolean;
  public gameStarted: boolean;

  constructor(
    grid: Cell[][],
    path: Array<{ row: number; col: number }> = [],
    currentNumber = 1,
    isComplete = false,
    gameStarted = false
  ) {
    this.grid = grid;
    this.path = path;
    this.currentNumber = currentNumber;
    this.isComplete = isComplete;
    this.gameStarted = gameStarted;
  }

  /**
   * Calculates the current number based on the highest numbered cell in the path.
   * Returns 1 if no numbered cells are found in the path.
   *
   * @returns The highest number encountered in the path
   */
  public calculateCurrentNumber(): number {
    let maxNumber = 1;

    for (const pathCell of this.path) {
      if (
        pathCell.row >= 0 &&
        pathCell.row < this.grid.length &&
        pathCell.col >= 0 &&
        pathCell.col < this.grid[0].length
      ) {
        const cellData = this.grid[pathCell.row][pathCell.col];

        if (cellData.number && cellData.number > maxNumber) {
          maxNumber = cellData.number;
        }
      }
    }

    return maxNumber;
  }

  /**
   * Determines if the path can be extended from the last position to a target position.
   * Checks adjacency, game completion status, and number sequence validity.
   *
   * @param targetPosition - The position to extend to
   * @param targetCell - The cell being targeted for extension
   * @returns True if the path can be legally extended
   */
  public canExtendPath(
    targetPosition: { row: number; col: number },
    targetCell: Cell
  ): boolean {
    if (this.path.length === 0) {
      return false;
    }

    const lastPosition = this.path[this.path.length - 1];

    const maxNumber = this.getMaxNumber();

    const isAdjacent =
      Math.abs(targetPosition.row - lastPosition.row) +
        Math.abs(targetPosition.col - lastPosition.col) ===
      1;

    if (!isAdjacent) {
      return false;
    }

    if (this.currentNumber === maxNumber) {
      return false;
    }

    const nextExpectedNumber = this.currentNumber + 1;

    return !targetCell.number || targetCell.number === nextExpectedNumber;
  }

  /**
   * Checks if the game is complete by verifying all cells are filled and the maximum number is reached.
   *
   * @returns True if the game is complete
   */
  public checkGameCompletion(): boolean {
    const allCellsFilled = this.grid.every((row) =>
      row.every((cell) => cell.filled)
    );

    const maxNumber = this.getMaxNumber();

    return allCellsFilled && this.currentNumber === maxNumber;
  }

  /**
   * Gets the maximum number present in the grid.
   *
   * @returns The maximum number found, or -Infinity if no numbers exist
   */
  public getMaxNumber(): number {
    const numbers = this.grid
      .flat()
      .map((cell) => cell.number)
      .filter((num): num is number => num !== undefined);

    return numbers.length > 0 ? Math.max(...numbers) : -Infinity;
  }

  /**
   * Resets all cells in the grid to unfilled state while preserving other properties.
   *
   * @returns A new GameState with all cells marked as unfilled
   */
  public resetGridFilled(): GameState {
    const newGrid = this.grid.map((row) =>
      row.map((cell) => ({ ...cell, filled: false }))
    );

    return new GameState(
      newGrid,
      this.path,
      this.currentNumber,
      this.isComplete,
      this.gameStarted
    );
  }

  /**
   * Trims the path to end at a specific position, removing all subsequent positions.
   * Returns a new GameState with the updated path and grid.
   *
   * @param targetRow - The row of the target position
   * @param targetCol - The column of the target position
   * @returns A new GameState with the trimmed path
   */
  public trimPathToPosition(targetRow: number, targetCol: number): GameState {
    const targetIndex = this.path.findIndex(
      (p) => p.row === targetRow && p.col === targetCol
    );

    if (targetIndex === -1) {
      return this;
    }

    const newPath = this.path.slice(0, targetIndex + 1);

    const newGrid = this.updateGridWithPath(newPath);

    const newCurrentNumber = this.calculateCurrentNumberForPath(
      newGrid,
      newPath
    );

    return new GameState(
      newGrid,
      newPath,
      newCurrentNumber,
      this.isComplete,
      this.gameStarted
    );
  }

  /**
   * Updates the grid to reflect a path by marking path cells as filled.
   * All other cells are marked as unfilled.
   *
   * @param path - The path to mark as filled (optional, uses instance path if not provided)
   * @returns The updated grid
   */
  public updateGridWithPath(
    path?: Array<{ row: number; col: number }>
  ): Cell[][] {
    const pathToUse = path ?? this.path;

    const newGrid = this.grid.map((r) => r.map((c) => ({ ...c })));

    for (let r = 0; r < newGrid.length; r++) {
      for (let c = 0; c < newGrid[r].length; c++) {
        newGrid[r][c].filled = false;
      }
    }

    for (const pathCell of pathToUse) {
      if (
        pathCell.row >= 0 &&
        pathCell.row < newGrid.length &&
        pathCell.col >= 0 &&
        pathCell.col < newGrid[0].length
      ) {
        newGrid[pathCell.row][pathCell.col].filled = true;
      }
    }

    return newGrid;
  }

  /**
   * Creates a new GameState with updated properties.
   *
   * @param updates - Partial properties to update
   * @returns A new GameState instance with updated values
   */
  public update(
    updates: Partial<
      Pick<
        GameState,
        'grid' | 'path' | 'currentNumber' | 'isComplete' | 'gameStarted'
      >
    >
  ): GameState {
    return new GameState(
      updates.grid ?? this.grid,
      updates.path ?? this.path,
      updates.currentNumber ?? this.currentNumber,
      updates.isComplete ?? this.isComplete,
      updates.gameStarted ?? this.gameStarted
    );
  }

  /**
   * Resets the game state to initial values while keeping the current grid.
   *
   * @returns A new GameState instance with reset values
   */
  public reset(): GameState {
    return new GameState(this.resetGridFilled().grid, [], 1, false, false);
  }

  /**
   * Helper method to calculate current number for a given grid and path.
   *
   * @param grid - The grid to check
   * @param path - The path to check
   * @returns The highest number encountered in the path
   */
  private calculateCurrentNumberForPath(
    grid: Cell[][],
    path: Array<{ row: number; col: number }>
  ): number {
    let maxNumber = 1;

    for (const pathCell of path) {
      if (
        pathCell.row >= 0 &&
        pathCell.row < grid.length &&
        pathCell.col >= 0 &&
        pathCell.col < grid[0].length
      ) {
        const cellData = grid[pathCell.row][pathCell.col];

        if (cellData.number && cellData.number > maxNumber) {
          maxNumber = cellData.number;
        }
      }
    }

    return maxNumber;
  }
}
