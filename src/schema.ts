// Database tables as named exports. Builds to tgcloud/schema.js; after deploying
// a change, apply it with `npx tgcloud migrate`.
import { table, integer, text } from 'sdk/db';

export const games = table('games', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull(),
  board: text('board').notNull(), // see Board in lib/game/rules.ts
});
