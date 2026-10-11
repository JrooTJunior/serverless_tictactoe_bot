# Serverless Tic Tac Toe Bot

An example Telegram bot built on [Telegram Serverless](https://core.telegram.org/bots/serverless) (tgcloud) with **TypeScript** and **[grammY](https://grammy.dev)**, using [`@aiogram/tgcloud-grammy`](https://www.npmjs.com/package/@aiogram/tgcloud-grammy).

**Try it:** [@serverless_tictactoe_bot](https://t.me/serverless_tictactoe_bot)

You play Tic Tac Toe against the computer in two ways, and both share the same games:

- **In chat**: the board is a rich message with buttons in its cells. Each move edits the message.
- **In the Mini App**: a single `web/index.html` page with no build step, hosted by the platform next to the bot.

You can start a game in chat and finish it in the Mini App. The server stores the board in the database and runs all game rules. The page has no game rules of its own and only shows what the server returns.

## What it demonstrates

| Platform feature | Where |
|---|---|
| A grammY bot on tgcloud (no token, no webhook server) | `src/lib/bot.ts`, `src/handlers/*.ts` |
| Receiving `callback_query` updates (in-chat buttons) | `src/handlers/callback_query.ts`, `src/lib/chat/play.ts` |
| Database schema and queries (`sdk/db`) | `src/schema.ts`, `src/lib/game/store.ts` |
| Mini App hosted by the platform (`"static": "web"`) | `tgcloud.jsonc`, `web/index.html` |
| Mini App backend endpoints with verified `initData` | `src/endpoints/*.ts` |
| Calling endpoints from the page (`Telegram.WebApp.Serverless.call`) | `web/index.html` |
| Deploy from GitHub Actions | `.github/workflows/deploy.yml` |

## How it works

```
 Telegram chat ──callback_query──▶ src/handlers ──▶ src/lib/chat ─┐
                                                                  ├──▶ src/lib/game ──▶ DB (games)
 Mini App (web/) ──Serverless.call──▶ src/endpoints ──────────────┘
```

- `src/lib/game/` holds the game logic and has no Telegram code in it: `rules.ts` (board logic), `ai.ts` (a minimax bot that sometimes makes a mistake, so you can beat it), `store.ts` (DB access), and `turn.ts` (your move plus the bot's reply, used by both UIs).
- `src/lib/chat/` is the in-chat UI: it renders the board, handles `/play` and `/results`, and adds a "📱 Mini App" button to each game.
- `src/endpoints/` is the Mini App's API: `getGame`, `newGame`, `move`, and `getResults`. Each endpoint validates its input and identifies the user from `ctx.initData`, which the platform has already verified.
- When the Mini App opens a game, the game's chat message is edited to remove the board, so the same game can't be played from two places. Saving a board is a compare-and-swap, so two moves sent at the same time can't overwrite each other.

The chat commands are `/start` (also sets the chat's menu button to the Mini App), `/play` and `/results`.

## Run your own copy

You need Node.js 24 and a bot with Serverless enabled in [@BotFather](https://t.me/BotFather).

```sh
git clone https://github.com/JrooTJunior/serverless_tictactoe_bot.git
cd serverless_tictactoe_bot
npm install
npx tgcloud login        # link the project to your bot
```

Set `MINI_APP_URL` in `src/lib/chat/render.ts` to your bot's Mini App URL (`https://app<app_id>.tgcloud.ai/`; `push` prints it). Then:

```sh
npm run deploy           # typecheck, build src/ into tgcloud/, push
npx tgcloud migrate      # create the database tables
```

Send `/start` to your bot.

## Development

```sh
npm run typecheck        # tsc
npm run check            # run the board-logic self-check locally
npm run status           # build and compare with the cloud
npm run run -- endpoints/getGame '{}' --ctx '{ initData: { user: { id: 1 } } }'   # run a module in the cloud without deploying it
```

There is no local runtime: the code runs only on the platform, and `npm run run` executes a module there.

- Edit `src/`. `tgcloud/` is build output and is gitignored.
- Deploying never changes the database. After you edit `src/schema.ts`, deploy and then run `npx tgcloud migrate`.
- To receive a new update type, run `npx tgcloud-grammy add handlers/<type>`. Without that handler file, Telegram doesn't deliver updates of that type to the bot.

### Deploying from GitHub

`.github/workflows/deploy.yml` deploys on every push to `main` and applies safe schema migrations. It needs the `TGCLOUD_TOKEN` repository secret, which is the bot's CLI token from BotFather → your bot → Serverless → CLI Access:

```sh
gh secret set TGCLOUD_TOKEN
```

## Further reading

- [`AGENTS.md`](AGENTS.md): platform rules (runtime globals, imports, endpoints, database)
- [`CLAUDE.md`](CLAUDE.md): this project's architecture and conventions
- [`docs/tgcloud-sdk.md`](docs/tgcloud-sdk.md): platform SDK reference
- [`@aiogram/tgcloud-grammy` README](node_modules/@aiogram/tgcloud-grammy/README.md) (after `npm install`)
