import { useState } from 'react';
import { Button } from './ui/button';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HelpModal({ isOpen, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">How to Play Zip</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-4 text-sm">
            <div>
              <h3 className="font-semibold mb-2">🎯 Objective</h3>
              <p>Connect all numbered cells in sequential order while filling every cell in the grid with a single continuous path.</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">🎮 How to Play</h3>
              <ol className="list-decimal list-inside space-y-1">
                <li>Start by clicking on cell number 1</li>
                <li>Drag to adjacent cells (horizontally or vertically) to create a path</li>
                <li>Connect to the next number in sequence (2, 3, 4...)</li>
                <li>Fill every cell in the grid with your path</li>
                <li>Complete the puzzle when all cells are filled and all numbers are connected</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold mb-2">📋 Rules</h3>
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Sequential Connection:</strong> Connect numbers in ascending order (1 → 2 → 3 → 4...)</li>
                <li><strong>Complete Coverage:</strong> Every cell must be filled by the path</li>
                <li><strong>Single Path:</strong> Only one continuous path is allowed</li>
                <li><strong>No Gaps:</strong> The path cannot skip cells or have breaks</li>
                <li><strong>Adjacent Movement:</strong> You can only move to horizontally or vertically adjacent cells (no diagonals)</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-2">💡 Tips</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>You can backtrack by clicking on any cell in your current path</li>
                <li>Plan your route to ensure you can fill all cells</li>
                <li>The timer starts when you click on cell number 1</li>
                <li>Use "Reset" to clear your current path or "New Game" for a fresh puzzle</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <Button onClick={onClose}>Got it!</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HelpButton() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsHelpOpen(true)}
        className="rounded px-4 py-3 text-base sm:text-sm touch-manipulation"
      >
        Help
      </Button>
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </>
  );
}