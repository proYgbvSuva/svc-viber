// import TelegramBot from 'node-telegram-bot-api';

// const token = process.env.TELEGRAM_BOT_TOKEN;
// const useWebhook = process.env.TELEGRAM_USE_WEBHOOK === 'true';

// export const bot = new TelegramBot(token, { polling: !useWebhook });

// export async function sendTelegramMessage(chatId, text) {
//   await bot.sendMessage(chatId, text);
// }

import TelegramBot from 'node-telegram-bot-api';

const token = process.env.TELEGRAM_BOT_TOKEN;
export const bot = new TelegramBot(token); // no polling

export async function sendTelegramMessage(chatId, text) {
  await bot.sendMessage(chatId, text);
}
