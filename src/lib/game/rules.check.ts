// Self-check for rules and ai. Nothing imports it, so it is never deployed.
// Run: npm run check
import { botMove } from './ai.js';
import { applyMove, outcome, whoseTurn } from './rules.js';

function check(ok: boolean, what: string) {
  if (!ok) throw new Error(`check failed: ${what}`);
}

check(outcome('XXXOO....')?.winner === 'X', 'row win');
check(outcome('O..O..O..')?.winner === 'O', 'column win');
check(outcome('XOXXOOOXX')?.winner === 'draw', 'draw');
check(outcome('XO.......') === null, 'game on');
check(whoseTurn('X........') === 'O', 'O after X');
check(applyMove('X........', 0) === null, 'taken cell');
check(applyMove('XXXOO....', 5) === null, 'game over');
check(applyMove('X........', 4) === 'X...O....', 'O placed');
check(botMove('XX.OO.X..') === 5, 'bot takes the win over blocking');
check(botMove('XX.O.....') === 2, 'bot blocks');

// Bot never loses: play every possible user line against it.
function neverLoses(board: string): void {
  const result = outcome(board);
  if (result) return check(result.winner !== 'X', `bot lost: ${board}`);
  if (whoseTurn(board) === 'O') return neverLoses(applyMove(board, botMove(board))!);
  for (let cell = 0; cell < 9; cell++) {
    const next = applyMove(board, cell);
    if (next) neverLoses(next);
  }
}
neverLoses('.........');

console.log('rules.check: ok');
