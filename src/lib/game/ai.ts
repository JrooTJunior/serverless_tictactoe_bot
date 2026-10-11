// The computer opponent.
import { applyMove, emptyCells, outcome, type Board } from './rules.js';

/** Best cell for the side to move: full minimax, random among equally good cells. */
export function botMove(board: Board): number {
  let best = -Infinity;
  let cells: number[] = [];
  for (const cell of emptyCells(board)) {
    const score = -negamax(applyMove(board, cell)!);
    if (score > best) [best, cells] = [score, [cell]];
    else if (score === best) cells.push(cell);
  }
  return cells[Math.floor(Math.random() * cells.length)];
}

/** Score for the side to move: >0 wins, <0 loses, 0 draws. Sooner wins score higher. */
function negamax(board: Board): number {
  const result = outcome(board);
  if (result) return result.winner === 'draw' ? 0 : -(1 + emptyCells(board).length);
  return Math.max(...emptyCells(board).map((cell) => -negamax(applyMove(board, cell)!)));
}
