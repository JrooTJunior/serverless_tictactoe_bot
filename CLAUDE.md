# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project goal

A Tic Tac Toe bot that demos the Telegram Serverless Platform (tgcloud). It has two ways to play:

- **In-chat mode**: the game is played inside the chat with rich messages (inline keyboards edited on each move), driven by `callback_query` updates.
- **Mini App**: a front-end hosted by the platform (`tgcloud.jsonc` → `"static"`) that talks to the bot only through `src/endpoints/*`.

Both modes should share game state and rules through `src/lib/` and the database (`src/schema.ts`), not keep their own copies.

Current state: grammY echo-bot scaffold. Only `src/handlers/message.ts` exists, `src/schema.ts` has no tables, and there is no Mini App front-end yet (the `static` block in `tgcloud.jsonc` is commented out).

## Commands

There is no test runner or linter. `npm run typecheck` is the static check. To exercise code, run a built module in the cloud without deploying it:

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
