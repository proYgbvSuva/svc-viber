import { bot } from '../services/telegramService.js';

export default async function telegramRoutes(fastify) {
  fastify.post('/telegram-webhook', async (req, reply) => {
    try {
      await bot.processUpdate(req.body);
      reply.send({ status: 'ok' });
    } catch (err) {
      console.error('Webhook error:', err);
      reply.status(500).send({ status: 'error' });
    }
  });
}
