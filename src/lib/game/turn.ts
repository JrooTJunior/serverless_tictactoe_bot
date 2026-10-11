// One turn: the player's move plus the bot's reply. Shared by the chat UI and the Mini App.
import { botMove } from './ai.js';
import { applyMove, outcome } from './rules.js';
import { getGame, saveBoard, type Game } from './store.js';

export const TURN_ERRORS = {
  not_found: 'Game not found',
  not_yours: 'This is not your game',
  taken: 'That cell is taken',
  conflict: 'Too fast, try again',
};
export type TurnError = keyof typeof TURN_ERRORS;

export async function playTurn(userId: number, gameId: number, cell: number): Promise<{ game: Game } | { error: TurnError }> {
  const game = await getGame(gameId);
  if (!game) return { error: 'not_found' };
  if (game.userId !== userId) return { error: 'not_yours' };

  let board = applyMove(game.board, cell);
  if (!board) return { error: 'taken' };
  if (!outcome(board)) board = applyMove(board, botMove(board))!;

  if (!(await saveBoard(game.id, game.board, board))) return { error: 'conflict' };
  return { game: { ...game, board } };
}

/** A game as plain JSON for the Mini App. */
export function gameView(game: Game) {
  return { id: game.id, board: game.board, outcome: outcome(game.board) };
}
