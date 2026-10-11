import { EndpointError } from 'sdk';
import { defineEndpoint } from '@aiogram/tgcloud-grammy';
import { createGame, getGame, latestGame } from '../lib/game/store.js';
import { gameView } from '../lib/game/turn.js';

// The game `id` if it's the caller's, else their latest game, else a new one.
export default defineEndpoint<{ id?: unknown }>(async (input, ctx) => {
  const userId = ctx.initData.user?.id;
  if (!userId) throw new EndpointError('Open the game from Telegram', { code: 'NO_USER' });
  const asked = Number.isSafeInteger(input.id) ? await getGame(input.id as number) : null;
  const game = asked?.userId === userId ? asked : (await latestGame(userId)) ?? (await createGame(userId));
  return gameView(game);
});
