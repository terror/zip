import { isValidGridPosition } from './utils';

export type Cell = {
  row: number;
  col: number;
  number?: number;
  filled: boolean;
};

export type Direction = {
  dr: number;
  dc: number;
};

export const DIRECTIONS: Direction[] = [
  { dr: 0, dc: 1 }, // right
  { dr: 1, dc: 0 }, // down
  { dr: 0, dc: -1 }, // left
  { dr: -1, dc: 0 }, // up
];

/**
 * Adds sequential numbers to specific positions along a solution path in the grid.
 *
 * Numbers are placed at the start, 1/3, 2/3, and end positions of the path.
 *
 * @param grid - The grid to add numbers to
 * @param solutionPath - The complete solution path through the grid
 * @returns A new grid with numbers added at key positions
 */
export const addNumbersToGrid = (
  grid: Cell[][],
  solutionPath: Array<{ row: number; col: number }>
): Cell[][] => {
  const newGrid = grid.map((row) => row.map((cell) => ({ ...cell })));

  const numberedPositions = [
    0,
    Math.floor(solutionPath.length / 3),
    Math.floor((2 * solutionPath.length) / 3),
    solutionPath.length - 1,
  ];

  numberedPositions.forEach((index, numberValue) => {
    const { row, col } = solutionPath[index];
    newGrid[row][col].number = numberValue + 1;
  });

  return newGrid;
};

/**
 * Creates an empty grid of the specified size with unfilled cells.
 *
 * Each cell contains its row and column coordinates.
 *
 * @param size - The dimensions of the square grid (size x size)
 * @returns A 2D array of empty cells
 */
export const createEmptyGrid = (size: number): Cell[][] => {
  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => ({
      row,
      col,
      filled: false,
    }))
  );
};

/**
 * Generates a complete game board with a random solution path and numbered positions.
 *
 * Combines grid creation, path generation, and number placement.
 *
 * @param size - The dimensions of the square grid (size x size)
 * @returns A complete game board ready for play
 */
export const generateBoard = (size: number): Cell[][] =>
  addNumbersToGrid(createEmptyGrid(size), generateRandomPath(size));

/**
 * Generates a random continuous path that visits every cell in the grid exactly once.
 *
 * Uses a backtracking approach with random direction selection.
 *
 * @param size - The dimensions of the square grid (size x size)
 * @returns An array of positions representing the complete path
 */
export const generateRandomPath = (
  size: number
): Array<{ row: number; col: number }> => {
  const visited = new Set<string>();
  const path: Array<{ row: number; col: number }> = [];

  let currentRow = Math.floor(Math.random() * size);
  let currentCol = Math.floor(Math.random() * size);

  path.push({ row: currentRow, col: currentCol });
  visited.add(`${currentRow}-${currentCol}`);

  while (path.length < size * size) {
    const shuffledDirections = shuffleArray(DIRECTIONS);

    let found = false;

    for (const { dr, dc } of shuffledDirections) {
      const newRow = currentRow + dr;
      const newCol = currentCol + dc;

      const key = `${newRow}-${newCol}`;

      if (isValidGridPosition(newRow, newCol, size) && !visited.has(key)) {
        currentRow = newRow;
        currentCol = newCol;
        path.push({ row: currentRow, col: currentCol });
        visited.add(key);
        found = true;
        break;
      }
    }

    if (!found) {
      return generateRandomPath(size);
    }
  }

  return path;
};

/**
 * Shuffles an array using the Fisher-Yates algorithm approximation.
 *
 * Returns a new array without modifying the original.
 *
 * @param array - The array to shuffle
 * @returns A new shuffled array
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};
