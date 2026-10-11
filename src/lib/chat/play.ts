// In-chat play against the bot.
import { Composer } from 'grammy';
import { createGame } from '../game/store.js';
import { playTurn, TURN_ERRORS } from '../game/turn.js';
import { MINI_APP_URL, MOVE, NEW_GAME, render } from './render.js';

export const play = new Composer();

play.command(['start', 'play'], async (ctx) => {
  if (!ctx.from) return;
  const privateChat = ctx.chat.type === 'private';
  await ctx.replyWithRichMessage(render(await createGame(ctx.from.id), privateChat));
  if (privateChat) {
    await ctx.setChatMenuButton({ chat_id: ctx.chat.id, menu_button: { type: 'web_app', text: '🎮 Play', web_app: { url: MINI_APP_URL } } });
  }
});

play.callbackQuery(NEW_GAME, async (ctx) => {
  await ctx.replyWithRichMessage(render(await createGame(ctx.from.id), ctx.chat?.type === 'private'));
  await ctx.answerCallbackQuery();
});

play.callbackQuery(MOVE, async (ctx) => {
  const turn = await playTurn(ctx.from.id, Number(ctx.match[1]), Number(ctx.match[2]));
  if ('error' in turn) return ctx.answerCallbackQuery(TURN_ERRORS[turn.error]);
  await ctx.editMessageText(render(turn.game, ctx.chat?.type === 'private'));
  await ctx.answerCallbackQuery();
});
