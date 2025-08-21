import { useState } from 'react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from './ui/dialog';

export function HelpButton() {
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  return (
    <Dialog open={isHelpOpen} onOpenChange={setIsHelpOpen}>
      <Button
        variant="outline"
        onClick={() => setIsHelpOpen(true)}
        className="rounded px-4 py-3 text-base sm:text-sm touch-manipulation"
      >
        Help
      </Button>
      
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>How to Play Zip</DialogTitle>
        </DialogHeader>
        
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

        <DialogFooter>
          <DialogClose asChild>
            <Button>Got it!</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}