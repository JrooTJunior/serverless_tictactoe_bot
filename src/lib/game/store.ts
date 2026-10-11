// Games in the database. One row per game, so a user can play any number at once.
import { db } from 'sdk';
import { and, desc, eq, type InferSelect } from 'sdk/db';
import { games } from '../../schema.js';
import { EMPTY_BOARD, type Board } from './rules.js';

export type Game = InferSelect<typeof games>;

export async function createGame(userId: number): Promise<Game> {
  const [game] = await db.insert(games).values({ userId, board: EMPTY_BOARD }).returning();
  return game;
}

export function getGame(id: number): Promise<Game | null> {
  return db.select().from(games).where(eq(games.id, id)).get();
}

// ponytail: full scan by user_id; add an index on games.user_id if the table grows.
export function latestGame(userId: number): Promise<Game | null> {
  return db.select().from(games).where(eq(games.userId, userId)).orderBy(desc(games.id)).limit(1).get();
}

/** Saves `to` only if the board is still `from`. false: another move got in first. */
export async function saveBoard(id: number, from: Board, to: Board): Promise<boolean> {
  const rows = await db.update(games).set({ board: to })
    .where(and(eq(games.id, id), eq(games.board, from)))
    .returning({ id: games.id });
  return rows.length === 1;
}

/** Remembers the chat message that shows the game. */
export async function setMessage(id: number, chatId: number, messageId: number): Promise<void> {
  await db.update(games).set({ chatId, messageId }).where(eq(games.id, id)).run();
}

/** Forgets the game's chat message and returns it; null if there is none. Atomic, so only one caller gets it. */
export async function takeMessage(id: number): Promise<{ chatId: number; messageId: number } | null> {
  const game = await getGame(id);
  if (game?.chatId == null || game.messageId == null) return null;
  // RETURNING would give the cleared values, so read first and clear only if nobody took them meanwhile.
  const rows = await db.update(games).set({ chatId: null, messageId: null })
    .where(and(eq(games.id, id), eq(games.messageId, game.messageId)))
    .returning({ id: games.id });
  return rows.length === 1 ? { chatId: game.chatId, messageId: game.messageId } : null;
}
