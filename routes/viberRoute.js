import { handleWebhook } from '../controllers/viberController.js';

export default async function viberRoutes(fastify) {
  fastify.post('/webhook', handleWebhook);
}
