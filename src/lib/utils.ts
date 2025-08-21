import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Determines if two positions are adjacent (horizontally or vertically, not diagonally).
 *
 * @param pos1 - The first position
 * @param pos2 - The second position
 * @returns True if the positions are exactly one cell apart
 */
export const arePositionsAdjacent = (
  pos1: { row: number; col: number },
  pos2: { row: number; col: number }
): boolean =>
  Math.abs(pos1.row - pos2.row) + Math.abs(pos1.col - pos2.col) === 1;

/**
 * Combines class names using clsx and tailwind-merge for optimal CSS class handling.
 *
 * @param inputs - Class values to combine
 * @returns Merged and deduplicated class string
 */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

/**
 * Finds the index of a specific position within a path array.
 *
 * @param path - The path to search in
 * @param targetRow - The row coordinate to find
 * @param targetCol - The column coordinate to find
 * @returns The index of the position, or -1 if not found
 */
export const findPositionInPath = (
  path: Array<{ row: number; col: number }>,
  targetRow: number,
  targetCol: number
): number => path.findIndex((p) => p.row === targetRow && p.col === targetCol);

/**
 * Formats milliseconds into a human-readable time string (MM:SS.CC format).
 *
 * @param ms - Time in milliseconds
 * @returns Formatted time string
 */
export const formatTime = (ms: number): string => {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  const centiseconds = Math.floor((ms % 1000) / 10);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
};

/**
 * Finds the maximum number value present in a grid.
 *
 * @param grid - The grid to search through
 * @returns The maximum number found, or -Infinity if no numbers exist
 */
export const getMaxNumberFromGrid = (
  grid: Array<Array<{ number?: number }>>
): number => {
  const numbers = grid
    .flat()
    .map((cell) => cell.number)
    .filter((num): num is number => num !== undefined);

  return numbers.length > 0 ? Math.max(...numbers) : -Infinity;
};

/**
 * Validates if a position is within the bounds of a square grid.
 *
 * @param row - The row coordinate to validate
 * @param col - The column coordinate to validate
 * @param size - The size of the square grid
 * @returns True if the position is valid
 */
export const isValidGridPosition = (
  row: number,
  col: number,
  size: number
): boolean => row >= 0 && row < size && col >= 0 && col < size;
