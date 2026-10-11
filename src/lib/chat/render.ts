// A game as a rich message: the board is a table, empty cells are callback buttons.
import type { InputRichMessage, RichBlockTableCell, RichText } from 'grammy/types';
import { outcome } from '../game/rules.js';
import type { Game } from '../game/store.js';

export const NEW_GAME = 'new';
export const MOVE = /^m:(\d+):(\d)$/;
// The tgcloud static site: https://app<app_id>.tgcloud.ai/, app id from the CLI token.
export const MINI_APP_URL = 'https://app8707147695.tgcloud.ai/';

const EMOJI: Record<string, string> = { X: '❌', O: '⭕', '.': '⬜' };
const STATUS = { X: 'You won 🎉', O: 'Bot wins 🤖', draw: 'Draw 🤝' };

/** `privateChat`: adds the Mini App button, which Telegram allows only in private chats. */
export function render(game: Game, privateChat: boolean): InputRichMessage {
  const result = outcome(game.board);
  const cells = [...game.board].map((mark, i): RichBlockTableCell => {
    let text: RichText = EMOJI[mark];
    if (mark === '.' && !result) {
      text = { type: 'button', button: { text, callback_data: `m:${game.id}:${i}` } };
    }
    if (result && 'line' in result && result.line.includes(i)) text = { type: 'marked', text };
    return { text, align: 'center', valign: 'middle' };
  });
  return {
    blocks: [
      { type: 'heading', size: 3, text: 'Tic Tac Toe: ❌ you vs ⭕ bot' },
      { type: 'table', is_bordered: true, cells: [cells.slice(0, 3), cells.slice(3, 6), cells.slice(6)] },
      { type: 'footer', text: result ? STATUS[result.winner] : 'Your move' },
      { type: 'buttons', align: 'center', buttons: newGameButtons(game.id, privateChat) },
    ],
  };
}

/** What a game's chat message becomes once the game is opened in the Mini App. */
export function renderMoved(gameId: number, privateChat: boolean): InputRichMessage {
  return {
    blocks: [
      { type: 'heading', size: 3, text: 'Tic Tac Toe: ❌ you vs ⭕ bot' },
      { type: 'footer', text: 'This game continues in the Mini App 📱' },
      { type: 'buttons', align: 'center', buttons: newGameButtons(gameId, privateChat) },
    ],
  };
}

function newGameButtons(gameId: number, privateChat: boolean) {
  return [
    { text: '🔄 New game', callback_data: NEW_GAME },
    ...(privateChat ? [{ text: '📱 Mini App', web_app: { url: `${MINI_APP_URL}?game=${gameId}` } }] : []),
  ];
}
