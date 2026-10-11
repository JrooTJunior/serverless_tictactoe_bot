// In-chat play against the bot.
import { Composer } from 'grammy';
import { botMove } from '../game/ai.js';
import { applyMove, outcome } from '../game/rules.js';
import { createGame, getGame, saveBoard } from '../game/store.js';
import { MOVE, NEW_GAME, render } from './render.js';

export const play = new Composer();

play.command(['start', 'play'], async (ctx) => {
  if (!ctx.from) return;
  await ctx.replyWithRichMessage(render(await createGame(ctx.from.id)));
});

play.callbackQuery(NEW_GAME, async (ctx) => {
  await ctx.replyWithRichMessage(render(await createGame(ctx.from.id)));
  await ctx.answerCallbackQuery();
});

play.callbackQuery(MOVE, async (ctx) => {
  const game = await getGame(Number(ctx.match[1]));
  if (!game) return ctx.answerCallbackQuery('Game not found');
  if (game.userId !== ctx.from.id) return ctx.answerCallbackQuery('This is not your game');

  let board = applyMove(game.board, Number(ctx.match[2]));
  if (!board) return ctx.answerCallbackQuery('That cell is taken');
  if (!outcome(board)) board = applyMove(board, botMove(board))!;

  if (!(await saveBoard(game.id, game.board, board))) return ctx.answerCallbackQuery('Too fast, try again');
  await ctx.editMessageText(render({ ...game, board }));
  await ctx.answerCallbackQuery();
});
