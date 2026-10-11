// Once a game is opened in the Mini App, its chat message stops showing the board,
// so the user can't play from a stale copy. Called by the Mini App's endpoints.
import { api, BotApiError } from 'sdk';
import { takeMessage } from '../game/store.js';
import { renderMoved } from './render.js';

export async function hideChatBoard(gameId: number): Promise<void> {
  const msg = await takeMessage(gameId);
  if (!msg) return;
  try {
    // Positive chat ids are private chats, the only ones that allow the Mini App button.
    await api.editMessageText({ chat_id: msg.chatId, message_id: msg.messageId, rich_message: renderMoved(gameId, msg.chatId > 0) });
  } catch (err) {
    // The message may be deleted; opening the Mini App must not fail because of it.
    if (!(err instanceof BotApiError)) throw err;
    console.warn('hideChatBoard', gameId, err.description);
  }
}
