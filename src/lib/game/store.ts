// Games in the database. One row per game, so a user can play any number at once.
import { db } from 'sdk';
import { and, eq, type InferSelect } from 'sdk/db';
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

/** Saves `to` only if the board is still `from`. false: another move got in first. */
export async function saveBoard(id: number, from: Board, to: Board): Promise<boolean> {
  const rows = await db.update(games).set({ board: to })
    .where(and(eq(games.id, id), eq(games.board, from)))
    .returning({ id: games.id });
  return rows.length === 1;
}
