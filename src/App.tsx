import { useEffect, useRef, useState } from 'react';

import { HelpButton } from './components/HelpModal';

const GRID_SIZE = 5;

type Cell = {
  row: number;
  col: number;
  number?: number;
  filled: boolean;
};

const generateBoard = (size: number) => {
  const newGrid: Cell[][] = Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => ({
      row,
      col,
      filled: false,
    }))
  );

  const directions = [
    { dr: 0, dc: 1 },
    { dr: 1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: -1, dc: 0 },
  ];

  const isValid = (r: number, c: number) =>
    r >= 0 && r < size && c >= 0 && c < size;

  const generatePath = () => {
    const visited = new Set<string>();

    const path: Array<{ row: number; col: number }> = [];

    let currentRow = Math.floor(Math.random() * size);
    let currentCol = Math.floor(Math.random() * size);

    path.push({ row: currentRow, col: currentCol });
    visited.add(`${currentRow}-${currentCol}`);

    while (path.length < size * size) {
      const shuffledDirections = [...directions].sort(
        () => Math.random() - 0.5
      );

      let found = false;

      for (const { dr, dc } of shuffledDirections) {
        const newRow = currentRow + dr;
        const newCol = currentCol + dc;

        const key = `${newRow}-${newCol}`;

        if (isValid(newRow, newCol) && !visited.has(key)) {
          currentRow = newRow;
          currentCol = newCol;
          path.push({ row: currentRow, col: currentCol });
          visited.add(key);
          found = true;
          break;
        }
      }

      if (!found) {
        return generatePath();
      }
    }

    return path;
  };

  const solutionPath = generatePath();

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

function App() {
  const gridRef = useRef<HTMLDivElement>(null);

  const [currentNumber, setCurrentNumber] = useState(1);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [finalTime, setFinalTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [grid, setGrid] = useState(() => generateBoard(GRID_SIZE));
  const [isComplete, setIsComplete] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [path, setPath] = useState<Array<{ row: number; col: number }>>([]);
  const [startTime, setStartTime] = useState<number | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (gameStarted && startTime) {
      interval = setInterval(() => {
        setElapsedTime(Date.now() - startTime);
      }, 100);
    }

    return () => clearInterval(interval);
  }, [gameStarted, startTime]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  const checkCompletion = (newGrid: any[][], newCurrentNumber: number) => {
    const allCellsFilled = newGrid.every((row) =>
      row.every((cell) => cell.filled)
    );

    const maxNumber = Math.max(
      ...newGrid
        .flat()
        .filter((cell) => cell.number)
        .map((cell) => cell.number)
    );

    if (allCellsFilled && newCurrentNumber === maxNumber) {
      setIsComplete(true);
      setFinalTime(elapsedTime);
      return true;
    }

    return false;
  };

  const handlePointerDown = (
    row: number,
    col: number,
    event?: React.PointerEvent
  ) => {
    if (isComplete) return;

    event?.preventDefault();

    const cell = grid[row][col];

    const cellInPathIndex = path.findIndex(
      (p) => p.row === row && p.col === col
    );

    if (cellInPathIndex !== -1) {
      const newPath = path.slice(0, cellInPathIndex + 1);

      setPath(newPath);

      setGrid((prev) => {
        const newGrid = prev.map((r) => r.map((c) => ({ ...c })));

        for (let r = 0; r < newGrid.length; r++) {
          for (let c = 0; c < newGrid[r].length; c++) {
            const cellInNewPath = newPath.some(
              (p) => p.row === r && p.col === c
            );

            if (!cellInNewPath) {
              newGrid[r][c].filled = false;
            }
          }
        }

        let newCurrentNumber = 1;

        for (const pathCell of newPath) {
          const pathCellData = newGrid[pathCell.row][pathCell.col];

          if (pathCellData.number && pathCellData.number > newCurrentNumber) {
            newCurrentNumber = pathCellData.number;
          }
        }

        setCurrentNumber(newCurrentNumber);

        return newGrid;
      });

      setIsDragging(true);

      return;
    }

    if (cell.number === currentNumber) {
      if (!gameStarted && cell.number === 1) {
        setGameStarted(true);
        setStartTime(Date.now());
      }

      setIsDragging(true);

      setPath([{ row, col }]);

      setGrid((prev) => {
        const newGrid = prev.map((r) => r.map((c) => ({ ...c })));
        newGrid[row][col].filled = true;
        return newGrid;
      });
    }
  };

  const handlePointerEnter = (row: number, col: number) => {
    if (!isDragging || isComplete) return;

    const lastCell = path[path.length - 1];

    if (!lastCell) return;

    const isAdjacent =
      Math.abs(row - lastCell.row) + Math.abs(col - lastCell.col) === 1;

    if (!isAdjacent) return;

    const cellInPathIndex = path.findIndex(
      (p) => p.row === row && p.col === col
    );

    if (cellInPathIndex !== -1) {
      const newPath = path.slice(0, cellInPathIndex + 1);

      setPath(newPath);

      setGrid((prev) => {
        const newGrid = prev.map((r) => r.map((c) => ({ ...c })));

        for (let r = 0; r < newGrid.length; r++) {
          for (let c = 0; c < newGrid[r].length; c++) {
            const cellInNewPath = newPath.some(
              (p) => p.row === r && p.col === c
            );

            if (!cellInNewPath) {
              newGrid[r][c].filled = false;
            }
          }
        }

        let newCurrentNumber = 1;

        for (const pathCell of newPath) {
          const pathCellData = newGrid[pathCell.row][pathCell.col];

          if (pathCellData.number && pathCellData.number > newCurrentNumber) {
            newCurrentNumber = pathCellData.number;
          }
        }

        setCurrentNumber(newCurrentNumber);

        return newGrid;
      });

      return;
    }

    const cell = grid[row][col];

    const nextExpectedNumber = currentNumber + 1;

    const maxNumber = Math.max(
      ...grid
        .flat()
        .filter((cell) => cell.number !== undefined)
        .map((cell) => cell.number!)
    );

    if (currentNumber === maxNumber) {
      return;
    }

    if (!cell.number || cell.number === nextExpectedNumber) {
      setPath((prev) => [...prev, { row, col }]);

      setGrid((prev) => {
        const newGrid = prev.map((r) => r.map((c) => ({ ...c })));

        newGrid[row][col].filled = true;

        let newCurrentNumber = currentNumber;

        if (cell.number === nextExpectedNumber) {
          newCurrentNumber = nextExpectedNumber;
          setCurrentNumber(nextExpectedNumber);
        }

        checkCompletion(newGrid, newCurrentNumber);

        return newGrid;
      });
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    if (!isDragging || isComplete) return;

    event.preventDefault();

    const element = document.elementFromPoint(event.clientX, event.clientY);

    if (!element) return;

    const cellElement = element.closest('[data-cell]') as HTMLElement;

    if (!cellElement) return;

    const row = parseInt(cellElement.dataset.row || '0');
    const col = parseInt(cellElement.dataset.col || '0');

    handlePointerEnter(row, col);
  };

  const resetPath = () => {
    setPath([]);
    setCurrentNumber(1);
    setGameStarted(false);
    setStartTime(null);
    setElapsedTime(0);
    setIsComplete(false);
    setFinalTime(0);
    setGrid((prev) =>
      prev.map((row) => row.map((cell) => ({ ...cell, filled: false })))
    );
  };

  const newGame = () => {
    setPath([]);
    setCurrentNumber(1);
    setGameStarted(false);
    setStartTime(null);
    setElapsedTime(0);
    setIsComplete(false);
    setFinalTime(0);
    setGrid(generateBoard(GRID_SIZE));
  };

  return (
    <div
      className='flex min-h-svh flex-col items-center justify-center gap-4 p-4'
      style={{ overscrollBehavior: 'none' }}
    >
      <h1 className='text-2xl font-bold sm:text-3xl'>Zip</h1>

      {isComplete && (
        <div className='text-center'>
          <div className='mb-2 text-2xl font-bold text-green-600'>
            🎉 Puzzle Solved! 🎉
          </div>
          <div className='rounded bg-green-100 px-4 py-2 font-mono text-lg'>
            Final Time: {formatTime(finalTime)}
          </div>
        </div>
      )}

      {!isComplete && (
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
        {grid.flat().map((cell, index) => {
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

      <div className='flex items-center gap-4'>
        <button
          onClick={newGame}
          className='touch-manipulation rounded px-4 py-3 text-base sm:text-sm'
        >
          New Game
        </button>
        <button
          onClick={resetPath}
          className='touch-manipulation rounded px-4 py-3 text-base sm:text-sm'
        >
          Reset
        </button>
        <HelpButton />
      </div>
    </div>
  );
}

export default App;
