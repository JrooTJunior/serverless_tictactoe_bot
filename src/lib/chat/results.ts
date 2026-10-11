// The player's recent results, in chat.
import { Composer, type Context } from 'grammy';
import { recentResults } from '../game/store.js';
import { RESULTS, renderResults } from './render.js';

export const results = new Composer();

results.command(['results', 'stats'], (ctx) => sendResults(ctx));

results.callbackQuery(RESULTS, async (ctx) => {
  await sendResults(ctx);
  await ctx.answerCallbackQuery();
});

async function sendResults(ctx: Context) {
  if (!ctx.from) return;
  await ctx.replyWithRichMessage(renderResults(await recentResults(ctx.from.id)));
}
