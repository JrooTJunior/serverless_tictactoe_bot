// Database tables as named exports. Builds to tgcloud/schema.js; after deploying
// a change, apply it with `npx tgcloud migrate`.
import { table, integer, text } from 'sdk/db';

export const games = table('games', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  board: text('board').notNull(), // see Board in lib/game/rules.ts
  // The chat message showing this game. Cleared when the game moves to the Mini App and that message is hidden.
  chatId: integer('chat_id'),
  messageId: integer('message_id'),
});
