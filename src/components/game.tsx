import { HelpButton } from '@/components/help-modal';
import { Button } from '@/components/ui/button';
import { useRoomContext } from '@/hooks/use-room-context';
import { generateBoard } from '@/lib/generator';
import { GameState } from '@/lib/state';
import { Gamepad2, RotateCcw, Users } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import {
  arePositionsAdjacent,
  findPositionInPath,
  formatTime,
} from '../lib/utils';

const GRID_SIZE = 5;

interface State {
  elapsedTime: number;
  finalTime: number;
  gameState: GameState;
  isDragging: boolean;
  startTime?: number;
}

export const Game = () => {
  const gridRef = useRef<HTMLDivElement>(null);

  const {
    adminId,
    gameBoard: roomGameBoard,
    isAdmin,
    nickname,
    regenerateBoard: regenerateRoomBoard,
    roomHash,
    sendSystemMessage,
  } = useRoomContext();

  const [state, setState] = useState<State>(() => ({
    elapsedTime: 0,
    finalTime: 0,
    gameState: new GameState(roomGameBoard || generateBoard(GRID_SIZE)),
    isDragging: false,
  }));

  const completionMessageSentRef = useRef(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (state.gameState.gameStarted && state.startTime) {
      interval = setInterval(() => {
        setState((prev) => ({
          ...prev,
          elapsedTime: Date.now() - state.startTime!,
        }));
      }, 100);
    }

    return () => clearInterval(interval);
  }, [state.gameState.gameStarted, state.startTime]);

  useEffect(() => {
    if (!roomGameBoard || !roomHash) {
      return;
    }

    setState((prev) => ({
      ...prev,
      elapsedTime: 0,
      finalTime: 0,
      gameState: new GameState(roomGameBoard),
    }));

    completionMessageSentRef.current = false;
  }, [roomGameBoard, roomHash]);

  const handlePointerDown = (
    row: number,
    col: number,
    event?: React.PointerEvent
  ) => {
    if (state.gameState.isComplete) return;

    event?.preventDefault();

    const cell = state.gameState.grid[row][col];

    const cellInPathIndex = findPositionInPath(state.gameState.path, row, col);

    if (cellInPathIndex !== -1) {
      const newGameState = state.gameState.trimPathToPosition(row, col);
      setState((prev) => ({
        ...prev,
        gameState: newGameState,
        isDragging: true,
      }));
      return;
    }

    if (cell.number === state.gameState.currentNumber) {
      const shouldStartGame = !state.gameState.gameStarted && cell.number === 1;

      const newGrid = state.gameState.grid.map((r) => r.map((c) => ({ ...c })));
      newGrid[row][col].filled = true;

      const newGameState = new GameState(
        newGrid,
        [{ row, col }],
        state.gameState.currentNumber,
        state.gameState.isComplete,
        shouldStartGame ? true : state.gameState.gameStarted
      );

      setState((prev) => ({
        ...prev,
        gameState: newGameState,
        isDragging: true,
        startTime: shouldStartGame ? Date.now() : prev.startTime,
      }));
    }
  };

  const handlePointerEnter = (row: number, col: number) => {
    if (!state.isDragging || state.gameState.isComplete) return;

    const lastCell = state.gameState.path[state.gameState.path.length - 1];

    if (!lastCell) return;

    const isAdjacent = arePositionsAdjacent(lastCell, { row, col });

    if (!isAdjacent) return;

    const cellInPathIndex = findPositionInPath(state.gameState.path, row, col);

    if (cellInPathIndex !== -1) {
      const newGameState = state.gameState.trimPathToPosition(row, col);
      setState((prev) => ({ ...prev, gameState: newGameState }));
      return;
    }

    const cell = state.gameState.grid[row][col];
    const nextExpectedNumber = state.gameState.currentNumber + 1;
    const maxNumber = state.gameState.getMaxNumber();

    if (state.gameState.currentNumber === maxNumber) {
      return;
    }

    if (state.gameState.canExtendPath({ row, col }, cell)) {
      const newGrid = state.gameState.grid.map((r) => r.map((c) => ({ ...c })));

      newGrid[row][col].filled = true;

      const newCurrentNumber =
        cell.number === nextExpectedNumber
          ? nextExpectedNumber
          : state.gameState.currentNumber;

      const newGameState = new GameState(
        newGrid,
        [...state.gameState.path, { row, col }],
        newCurrentNumber,
        state.gameState.isComplete,
        state.gameState.gameStarted
      );

      if (newGameState.checkGameCompletion()) {
        const completedGameState = newGameState.update({ isComplete: true });
        setState((prev) => ({
          ...prev,
          finalTime: prev.elapsedTime,
          gameState: completedGameState,
        }));

        if (roomHash && !completionMessageSentRef.current) {
          completionMessageSentRef.current = true;

          sendSystemMessage(
            `🎉 ${nickname} completed the puzzle in ${formatTime(state.elapsedTime)}!`
          );
        }
      } else {
        setState((prev) => ({ ...prev, gameState: newGameState }));
      }
    }
  };

  const handlePointerUp = () => {
    setState((prev) => ({ ...prev, isDragging: false }));
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    if (!state.isDragging || state.gameState.isComplete) return;

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
    setState((prev) => ({
      ...prev,
      elapsedTime: 0,
      finalTime: 0,
      gameState: prev.gameState.reset(),
    }));

    completionMessageSentRef.current = false;
  };

  const newGame = () => {
    if (roomHash && isAdmin) {
      regenerateRoomBoard();
    } else if (!roomHash) {
      setState((prev) => ({
        ...prev,
        elapsedTime: 0,
        finalTime: 0,
        gameState: new GameState(generateBoard(GRID_SIZE)),
      }));

      completionMessageSentRef.current = false;
    }
  };

  return (
    <div
      className='flex h-full flex-col items-center justify-center gap-4 p-4'
      style={{ overscrollBehavior: 'none' }}
    >
      {roomHash && (
        <div className='mb-2 text-center'>
          <div className='mb-1 flex items-center justify-center gap-2 text-sm text-gray-600'>
            <Users size={16} />
            <span>Room: {roomHash}</span>
          </div>
          {adminId && (
            <div className='text-xs text-gray-500'>
              {isAdmin ? 'You are the room admin' : 'Room has an admin'}
            </div>
          )}
        </div>
      )}

      {state.gameState.isComplete && (
        <div className='text-center'>
          <div className='mb-2 text-2xl font-bold text-green-600'>
            🎉 Puzzle Solved! 🎉
          </div>
          <div className='rounded bg-green-100 px-4 py-2 font-mono text-lg'>
            Final Time: {formatTime(state.finalTime)}
          </div>
        </div>
      )}

      {!state.gameState.isComplete && (
        <div className='flex items-center gap-8'>
          <div className='rounded bg-gray-100 px-3 py-1 font-mono text-base sm:text-lg'>
            {formatTime(state.elapsedTime)}
          </div>
        </div>
      )}

      <div
        ref={gridRef}
        className={`grid gap-1 border-2 border-gray-800 p-2 ${state.isDragging ? 'no-select' : ''}`}
        style={{
          gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
          touchAction: 'none',
        }}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerMove={handlePointerMove}
      >
        {state.gameState.grid.flat().map((cell, index) => {
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
          disabled={Boolean(roomHash && !isAdmin)}
          title={
            roomHash && !isAdmin
              ? 'Only the room admin can generate a new board'
              : 'Generate a new game board'
          }
        >
          <Gamepad2 />
          {roomHash ? 'New Board' : 'New Game'}
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
