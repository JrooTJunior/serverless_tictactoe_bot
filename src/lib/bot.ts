// The bot. Each update type it handles needs a one-line file in src/handlers/.
// Features live in src/lib/<feature>/ as grammY Composers; register them here.
import { createBot } from '@aiogram/tgcloud-grammy/grammy';
import { play } from './chat/play.js';

export const bot = createBot();

bot.use(play);

// Last, so it only gets texts no feature handled.
bot.on('message:text', (ctx) => ctx.reply('Send /play to start a new game.'));
