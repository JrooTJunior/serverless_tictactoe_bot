// The computer opponent.
import { applyMove, emptyCells, outcome, type Board } from './rules.js';

// ponytail: one fixed difficulty; make it per-game if players ask for levels.
const MISTAKE_CHANCE = 0.25;

/** Cell for the side to move: usually full minimax (random among equally good cells), sometimes a random cell so the bot can be beaten. */
export function botMove(board: Board, mistakeChance = MISTAKE_CHANCE): number {
  const empty = emptyCells(board);
  if (Math.random() < mistakeChance) return empty[Math.floor(Math.random() * empty.length)];
  let best = -Infinity;
  let cells: number[] = [];
  for (const cell of empty) {
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
