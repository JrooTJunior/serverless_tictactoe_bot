// Self-check for rules and ai. Nothing imports it, so it is never deployed.
// Run: npm run check
import { botMove } from './ai.js';
import { applyMove, outcome, tally, whoseTurn } from './rules.js';

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
const t = tally(['XXXOO....', 'XO.......', 'O..O..O..', 'XOXXOOOXX', 'XOXXOOOXX'], 3);
check(JSON.stringify(t) === '{"won":1,"lost":1,"draw":1,"last":["X","O","draw"]}', 'tally skips unfinished, keeps limit');
check(botMove('XX.OO.X..', 0) === 5, 'bot takes the win over blocking');
check(botMove('XX.O.....', 0) === 2, 'bot blocks');

// Without mistakes the bot never loses: play every possible user line against it.
function neverLoses(board: string): void {
  const result = outcome(board);
  if (result) return check(result.winner !== 'X', `bot lost: ${board}`);
  if (whoseTurn(board) === 'O') return neverLoses(applyMove(board, botMove(board, 0))!);
  for (let cell = 0; cell < 9; cell++) {
    const next = applyMove(board, cell);
    if (next) neverLoses(next);
  }
}
neverLoses('.........');
check(Array.from({ length: 50 }, () => botMove('XX.O.....', 1)).some((c) => c !== 2), 'bot can miss a block');

console.log('rules.check: ok');
