# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project goal

A Tic Tac Toe bot that demos the Telegram Serverless Platform (tgcloud). It has two ways to play:

- **In-chat mode**: the game is played inside the chat with rich messages (Bot API `sendRichMessage`; the message is edited on each move), driven by `callback_query` updates.
- **Mini App**: a front-end hosted by the platform (`tgcloud.jsonc` → `"static"`) that talks to the bot only through `src/endpoints/*`.

Both modes should share game state and rules through `src/lib/` and the database (`src/schema.ts`), not keep their own copies.

Current state: in-chat play against the computer works (`/play`; any number of games at once, one `games` row each). No Mini App front-end yet (the `static` block in `tgcloud.jsonc` is commented out).

## `src/lib/` layout

- `game/`: the game itself. `rules.ts` (pure board logic), `ai.ts` (minimax bot), `store.ts` (DB access; `saveBoard` is a compare-and-swap on the board, so concurrent moves can't overwrite each other).
- `chat/`: the in-chat UI. `render.ts` (game → rich message: table board, emoji, callback buttons in cells), `play.ts` (grammY `Composer` with the commands/callbacks).
- `bot.ts`: only `createBot()` plus `bot.use(<feature>)` for each feature Composer.

Rule: `game/` never imports grammY, `chat/`, or Telegram types. UIs (`chat/`, `src/endpoints/`) import `game/`, never each other. A new UI or feature is new files plus one `bot.use(...)` line.

## Commands

There is no test runner or linter. `npm run typecheck` is the static check; `npm run check` runs the assert self-check in `src/lib/game/rules.check.ts` locally. To exercise code, run a built module in the cloud without deploying it:

```
npm run run -- handlers/callback_query '{ id: "1", from: { id: 1, is_bot: false, first_name: "U" }, chat_instance: "1", data: "..." }'
npm run run -- endpoints/<name> '{}' --ctx '{ initData: { user: { id: 1 } } }'
```

After you change `src/schema.ts`, deploy and then run `npx tgcloud migrate`. Deploying never applies schema changes.

## Adding features

- Each new update type needs `npx tgcloud-grammy add handlers/<type>`. In-chat play needs `callback_query`, and inline-mode invites would need `inline_query`/`chosen_inline_result`. Without the handler file, Telegram never delivers that update type.
- Handlers are registered on the single grammY `bot` in `src/lib/bot.ts`. The files in `src/handlers/` only bind an update type to it.
- For grammY sessions backed by the DB, use `dbStorage` from `@aiogram/tgcloud-grammy/grammy` (see its README, "Sessions").
- Endpoints get untrusted `input`, so validate it there. Return only plain JSON: `Date` values serialize as `{}`.
- Platform/SDK reference: `docs/tgcloud-sdk.md` and `node_modules/@aiogram/tgcloud-grammy/README.md`.
