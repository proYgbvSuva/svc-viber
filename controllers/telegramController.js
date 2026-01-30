import { User } from '../models/userModel.js';
import { getAIResponse } from '../services/openAIService.js';
import { sendTelegramMessage } from '../services/telegramService.js';

const SINGLE_PROMPT = `Hi! To create your profile, please provide the following information in this format:

Name, Age, Sex (male/female/other), Height in cm, Weight in kg

Example: John, 25, male, 180, 75
`;

export async function handleTelegramMessage(msg) {
  const chatId = msg.chat.id;
  const text = msg.text?.trim();
  if (!text) return;

  try {
    let user = await User.findOne({ telegramUserId: chatId });

    // Create new user if not exists
    if (!user) {
      user = await User.create({
        telegramUserId: chatId,
        pendingFields: ['all'],
      });
      await sendTelegramMessage(chatId, SINGLE_PROMPT);
      return;
    }

    user.lastSeenAt = new Date();

    // --- Commands ---
    if (text.toLowerCase() === '/resetprofile') {
      user.profile = {};
      user.pendingFields = ['all'];
      await user.save();
      await sendTelegramMessage(chatId, '✅ Your profile has been reset. Let’s start fresh!');
      await sendTelegramMessage(chatId, SINGLE_PROMPT);
      return;
    }

    if (text.toLowerCase() === '/profile') {
      const p = user.profile;
      await sendTelegramMessage(
        chatId,
        `📝 Your current profile:
Name: ${p.name || 'not set'}
Age: ${p.age ?? 'not set'}
Sex: ${p.sex ?? 'not set'}
Height: ${p.heightCm ?? 'not set'} cm
Weight: ${p.weightKg ?? 'not set'} kg`
      );
      return;
    }

    // --- Handle single-response profile ---
    if (user.pendingFields.includes('all')) {
      const parts = text.split(',').map(p => p.trim());

      if (parts.length !== 5) {
        await sendTelegramMessage(chatId, '❌ Please provide all 5 fields in the correct format.');
        return;
      }

      const [name, ageStr, sex, heightStr, weightStr] = parts;
      const age = parseInt(ageStr);
      const heightCm = parseInt(heightStr);
      const weightKg = parseInt(weightStr);

      if (!name || isNaN(age) || age < 1 || age > 120 ||
          !['male','female','other'].includes(sex.toLowerCase()) ||
          isNaN(heightCm) || heightCm < 50 || heightCm > 300 ||
          isNaN(weightKg) || weightKg < 10 || weightKg > 500) {
        await sendTelegramMessage(chatId, '❌ Invalid input. Make sure to follow the format: Name, Age, Sex, Height, Weight');
        return;
      }

      // Save profile
      user.profile = {
        name,
        age,
        sex: sex.toLowerCase(),
        heightCm,
        weightKg,
      };
      user.pendingFields = [];
      await user.save();

      await sendTelegramMessage(chatId, '✅ Thanks! Your profile is complete. You can now ask me for a workout.');
      return;
    }

    // --- Generate AI response ---
    const reply = await getAIResponse(user.profile, text);
    await sendTelegramMessage(chatId, reply);
    await user.save();

  } catch (err) {
    console.error('Telegram message error:', err);
    await sendTelegramMessage(chatId, '⚠️ Oops! Something went wrong. Please try again.');
  }
}
