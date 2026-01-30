import TelegramBot from 'node-telegram-bot-api';

const token = process.env.TELEGRAM_BOT_TOKEN;
const useWebhook = process.env.TELEGRAM_USE_WEBHOOK === 'true';

export const bot = new TelegramBot(token, { polling: !useWebhook });

/**
 * Sends a Telegram message safely with retry fallback
 * @param {number} chatId
 * @param {string} text
 */
export async function sendTelegramMessage(chatId, text) {
  try {
    await bot.sendMessage(chatId, text);
  } catch (err) {
    console.error('Telegram sendMessage error:', err);

    // Retry once after short delay
    try {
      console.log('Retrying Telegram message...');
      await new Promise(res => setTimeout(res, 1000));
      await bot.sendMessage(chatId, text);
    } catch (retryErr) {
      console.error('Telegram retry failed:', retryErr);
      // Final fallback: log it, cannot notify user
    }
  }
}
