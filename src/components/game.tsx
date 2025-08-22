import { HelpButton } from '@/components/help-modal';
import { Button } from '@/components/ui/button';
import { generateBoard } from '@/lib/generator';
import { GameState } from '@/lib/state';
import { Gamepad2, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import {
  arePositionsAdjacent,
  findPositionInPath,
  formatTime,
} from '../lib/utils';

const GRID_SIZE = 5;

export const Game = () => {
  const gridRef = useRef<HTMLDivElement>(null);

  const [gameState, setGameState] = useState(
    () => new GameState(generateBoard(GRID_SIZE))
  );

  const [elapsedTime, setElapsedTime] = useState(0);
  const [finalTime, setFinalTime] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (gameState.gameStarted && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100);
    }

    return () => clearInterval(interval);
  }, [gameState.gameStarted, startTime]);

  const handlePointerDown = (
    row: number,
    col: number,
    event?: React.PointerEvent
  ) => {
    if (gameState.isComplete) return;

    event?.preventDefault();

    const cell = gameState.grid[row][col];

    const cellInPathIndex = findPositionInPath(gameState.path, row, col);

    if (cellInPathIndex !== -1) {
      const newGameState = gameState.trimPathToPosition(row, col);
      setGameState(newGameState);
      setIsDragging(true);
      return;
    }

    if (cell.number === gameState.currentNumber) {
      if (!gameState.gameStarted && cell.number === 1) {
        setStartTime(Date.now());
      }

      setIsDragging(true);

      const newGrid = gameState.grid.map((r) => r.map((c) => ({ ...c })));

      newGrid[row][col].filled = true;

      setGameState(
        new GameState(
          newGrid,
          [{ row, col }],
          gameState.currentNumber,
          gameState.isComplete,
          !gameState.gameStarted && cell.number === 1
            ? true
            : gameState.gameStarted
        )
      );
    }
  };

  const handlePointerEnter = (row: number, col: number) => {
    if (!isDragging || gameState.isComplete) return;

    const lastCell = gameState.path[gameState.path.length - 1];

    if (!lastCell) return;

    const isAdjacent = arePositionsAdjacent(lastCell, { row, col });

    if (!isAdjacent) return;

    const cellInPathIndex = findPositionInPath(gameState.path, row, col);

    if (cellInPathIndex !== -1) {
      const newGameState = gameState.trimPathToPosition(row, col);
      setGameState(newGameState);
      return;
    }

    const cell = gameState.grid[row][col];
    const nextExpectedNumber = gameState.currentNumber + 1;
    const maxNumber = gameState.getMaxNumber();

    if (gameState.currentNumber === maxNumber) {
      return;
    }

    if (gameState.canExtendPath({ row, col }, cell)) {
      const newGrid = gameState.grid.map((r) => r.map((c) => ({ ...c })));

      newGrid[row][col].filled = true;

      const newCurrentNumber =
        cell.number === nextExpectedNumber
          ? nextExpectedNumber
          : gameState.currentNumber;

      const newGameState = new GameState(
        newGrid,
        [...gameState.path, { row, col }],
        newCurrentNumber,
        gameState.isComplete,
        gameState.gameStarted
      );

      if (newGameState.checkGameCompletion()) {
        setGameState(newGameState.update({ isComplete: true }));
        setFinalTime(elapsedTime);
      } else {
        setGameState(newGameState);
      }
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    if (!isDragging || gameState.isComplete) return;

    event.preventDefault();

    const element = document.elementFromPoint(event.clientX, event.clientY);

    if (!element) return;

    const cellElement = element.closest('[data-cell]') as HTMLElement;

    if (!cellElement) return;

    const row = parseInt(cellElement.dataset.row || '0');
    const col = parseInt(cellElement.dataset.col || '0');

    handlePointerEnter(row, col);
  };

  const reset = () => {
    setGameState(gameState.reset());
    setStartTime(null);
    setElapsedTime(0);
    setFinalTime(0);
  };

  const newGame = () => {
    setGameState(new GameState(generateBoard(GRID_SIZE)));
    setStartTime(null);
    setElapsedTime(0);
    setFinalTime(0);
  };

  return (
    <div
      className='flex h-full flex-col items-center justify-center gap-4 p-4'
      style={{ overscrollBehavior: 'none' }}
    >
      {gameState.isComplete && (
        <div className='text-center'>
          <div className='mb-2 text-2xl font-bold text-green-600'>
            🎉 Puzzle Solved! 🎉
          </div>
          <div className='rounded bg-green-100 px-4 py-2 font-mono text-lg'>
            Final Time: {formatTime(finalTime)}
          </div>
        </div>
      )}

      {!gameState.isComplete && (
        <div className='flex items-center gap-8'>
          <div className='rounded bg-gray-100 px-3 py-1 font-mono text-base sm:text-lg'>
            {formatTime(elapsedTime)}
          </div>
        </div>
      )}

      <div
        ref={gridRef}
        className={`grid gap-1 border-2 border-gray-800 p-2 ${isDragging ? 'no-select' : ''}`}
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
          touchAction: 'none',
        }}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerMove={handlePointerMove}
      >
        {gameState.grid.flat().map((cell, index) => {
          const row = Math.floor(index / GRID_SIZE);
          const col = index % GRID_SIZE;

          return (
            <div
              key={index}
              data-cell
              data-row={row}
              data-col={col}
              className={`flex h-14 w-14 cursor-pointer touch-manipulation items-center justify-center border border-gray-400 text-lg font-bold transition-colors sm:h-12 sm:w-12 ${
                cell.filled
                  ? 'border-blue-500 bg-blue-200'
                  : cell.number
                    ? 'bg-yellow-100 hover:bg-yellow-200'
                    : 'bg-white hover:bg-gray-100'
              }`}
              style={{ touchAction: 'none' }}
              onPointerDown={(e) => handlePointerDown(row, col, e)}
              onPointerEnter={() => handlePointerEnter(row, col)}
            >
              {cell.number}
            </div>
          );
        })}
      </div>

      <div className='flex items-center gap-2'>
        <Button
          onClick={newGame}
          variant={'ghost'}
          className='touch-manipulation rounded px-4 py-3 text-base sm:text-sm'
        >
          <Gamepad2 />
          New Game
        </Button>
        <Button
          onClick={reset}
          variant={'ghost'}
          className='touch-manipulation rounded px-4 py-3 text-base sm:text-sm'
        >
          <RotateCcw />
          Reset
        </Button>
        <HelpButton />
      </div>
    </div>
  );
};
