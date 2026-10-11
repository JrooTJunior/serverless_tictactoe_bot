import { EndpointError } from 'sdk';
import { defineEndpoint } from '@aiogram/tgcloud-grammy';
import { recentResults } from '../lib/game/store.js';

// The caller's results over their last finished games.
export default defineEndpoint(async (_input, ctx) => {
  const userId = ctx.initData.user?.id;
  if (!userId) throw new EndpointError('Open the game from Telegram', { code: 'NO_USER' });
  return recentResults(userId);
});
