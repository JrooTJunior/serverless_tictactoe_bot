import { EndpointError } from 'sdk';
import { defineEndpoint } from '@aiogram/tgcloud-grammy';
import { createGame } from '../lib/game/store.js';
import { gameView } from '../lib/game/turn.js';

export default defineEndpoint(async (_input, ctx) => {
  const userId = ctx.initData.user?.id;
  if (!userId) throw new EndpointError('Open the game from Telegram', { code: 'NO_USER' });
  return gameView(await createGame(userId));
});
