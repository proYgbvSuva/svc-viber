import { handleTelegramMessage } from '../controllers/telegramController.js';

export default async function telegramRoutes(fastify) {
  fastify.post('/telegram-webhook', async (req, reply) => {
    try {
      await handleTelegramMessage(req.body.message);
      reply.send({ status: 'ok' });
    } catch (err) {
      console.error('Webhook error:', err);
      reply.status(500).send({ status: 'error' });
    }
  });
}
