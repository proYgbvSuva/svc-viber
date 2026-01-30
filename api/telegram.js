import { handleTelegramMessage } from '../controllers/telegramController.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;

    if (body.message) {
      await handleTelegramMessage(body.message);
    }

    res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('Telegram webhook error:', err);
    res.status(500).json({ status: 'error', error: err.message });
  }
}
