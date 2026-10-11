import { EndpointError } from 'sdk';
import { defineEndpoint } from '@aiogram/tgcloud-grammy';
import { gameView, playTurn, TURN_ERRORS } from '../lib/game/turn.js';

// Your move plus the bot's reply.
export default defineEndpoint<{ id?: unknown; cell?: unknown }>(async (input, ctx) => {
  const userId = ctx.initData.user?.id;
  if (!userId) throw new EndpointError('Open the game from Telegram', { code: 'NO_USER' });
  const { id, cell } = input;
  if (!Number.isSafeInteger(id) || !Number.isInteger(cell) || (cell as number) < 0 || (cell as number) > 8) {
    throw new EndpointError('Bad move', { code: 'BAD_INPUT' });
  }
  const turn = await playTurn(userId, id as number, cell as number);
  if ('error' in turn) throw new EndpointError(TURN_ERRORS[turn.error], { code: turn.error.toUpperCase() });
  return gameView(turn.game);
});
