// Tic Tac Toe rules. Pure: no grammY, no SDK, so the chat UI and the Mini App share them.

/** 9 cells, row by row: '.' empty, 'X' (moves first) or 'O'. */
export type Board = string;
export type Mark = 'X' | 'O';
export type Outcome = { winner: Mark; line: number[] } | { winner: 'draw' } | null;

export const EMPTY_BOARD: Board = '.........';

const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

/** null while the game is still on. */
export function outcome(board: Board): Outcome {
  for (const line of LINES) {
    const [a, b, c] = line;
    if (board[a] !== '.' && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a] as Mark, line };
    }
  }
  return board.includes('.') ? null : { winner: 'draw' };
}

export function whoseTurn(board: Board): Mark {
  const x = board.split('X').length, o = board.split('O').length;
  return x === o ? 'X' : 'O';
}

export function emptyCells(board: Board): number[] {
  return [...board].flatMap((c, i) => (c === '.' ? [i] : []));
}

/** Places the mark of whoever's turn it is. null if the move is illegal. */
export function applyMove(board: Board, cell: number): Board | null {
  if (!Number.isInteger(cell) || board[cell] !== '.' || outcome(board)) return null;
  return board.slice(0, cell) + whoseTurn(board) + board.slice(cell + 1);
}
