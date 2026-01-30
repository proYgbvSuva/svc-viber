// import Fastify from 'fastify';
// import viberRoutes from './routes/viberRoutes.js';
// import { connectDB } from './config/db.js';

// const fastify = Fastify({ logger: true });
// await connectDB();

// // Register routes
// await viberRoutes(fastify);

// const PORT = process.env.PORT || 3000;
// fastify.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
//   if (err) throw err;
//   console.log(`Fastify server running at ${address}`);
// });
// --------------------------------------------------------
// import Fastify from 'fastify';
// import { connectDB } from './config/db.js';
// import { bot } from './services/telegramService.js';

// const fastify = Fastify({ logger: true });
// await connectDB();

// import { handleTelegramMessage } from './controllers/telegramController.js';

// // Real-time bot listener
// bot.on('message', handleTelegramMessage);

// // 1-liner to register Telegram webhook route
// await fastify.register(import('./routes/telegramRoutes.js'));

// const PORT = process.env.PORT || 3000;
// fastify.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
//   if (err) throw err;
//   console.log(`Telegram bot server running at ${address}`);
// });

import 'dotenv/config';
import Fastify from 'fastify';
import { connectDB } from './config/db.js';
import { bot } from './services/telegramService.js';
import { handleTelegramMessage } from './controllers/telegramController.js';
import telegramRoutes from './routes/telegramRoute.js';

const fastify = Fastify({ logger: true });
await connectDB();

const useWebhook = process.env.TELEGRAM_USE_WEBHOOK === 'true';

// Polling mode
if (!useWebhook) {
  bot.on('message', handleTelegramMessage);
  console.log('Telegram bot running in polling mode');
}

// Webhook mode
if (useWebhook) {
  await telegramRoutes(fastify);
  console.log('Telegram bot running in webhook mode');
}

const PORT = process.env.PORT || 3000;
fastify.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
  if (err) throw err;
  console.log(`Server running at ${address}`);
});
