import { User } from '../models/userModel.js';
import { getAIResponse } from '../services/openAIService.js';
import { sendTelegramMessage } from '../services/telegramService.js';

const REQUIRED_FIELDS = ['age','sex','heightCm','weightKg'];

const FIELD_PROMPTS = {
  name: 'What is your name?',
  age: 'How old are you?',
  sex: 'What is your gender? (male/female/other)',
  heightCm: 'What is your height in cm?',
  weightKg: 'What is your weight in kg?',
};

export async function handleTelegramMessage(msg) {
  const chatId = msg.chat.id;
  const incomingText = msg.text?.trim();
  if (!incomingText) return;

  try {
    // 1️⃣ Find or create user
    let user = await User.findOne({ telegramUserId: chatId });
    if (!user) {
      user = await User.create({
        telegramUserId: chatId,
        profile: { sex: null }, // null until user provides value
      });
    }

    user.lastSeenAt = new Date();

    // --- 2️⃣ Handle commands ---

    // Reset profile
    if (incomingText.toLowerCase() === '/resetprofile') {
      user.profile = {
        name: '',
        age: null,
        sex: null,
        heightCm: null,
        weightKg: null,
      };
      user.pendingFields = [...REQUIRED_FIELDS];
      await user.save();

      await sendTelegramMessage(chatId, '✅ Your profile has been reset. Let’s start fresh!');
      await sendTelegramMessage(chatId, FIELD_PROMPTS[user.pendingFields[0]]);
      return;
    }

    // Show profile
    if (incomingText.toLowerCase() === '/profile') {
      const profile = user.profile;
      const text = `
📝 Your current profile:
Name: ${profile.name || 'not set'}
Age: ${profile.age ?? 'not set'}
Sex: ${profile.sex ?? 'not set'}
Height: ${profile.heightCm ?? 'not set'} cm
Weight: ${profile.weightKg ?? 'not set'} kg
      `.trim();
      await sendTelegramMessage(chatId, text);
      return;
    }

    // --- 3️⃣ Sanitize invalid sex value ---
    if (user.profile.sex && !['male','female','other'].includes(user.profile.sex)) {
      user.profile.sex = null;
    }

    // --- 4️⃣ Handle pending fields ---
    if (user.pendingFields.length > 0) {
      const field = user.pendingFields[0];

      switch (field) {
        case 'age': {
          const val = parseInt(incomingText);
          if (!isNaN(val) && val > 0) user.profile.age = val;
          break;
        }
        case 'heightCm': {
          const val = parseInt(incomingText);
          if (!isNaN(val) && val > 0) user.profile.heightCm = val;
          break;
        }
        case 'weightKg': {
          const val = parseInt(incomingText);
          if (!isNaN(val) && val > 0) user.profile.weightKg = val;
          break;
        }
        case 'sex': {
          const val = incomingText.toLowerCase();
          if (['male','female','other'].includes(val)) {
            user.profile.sex = val;
          } else {
            await sendTelegramMessage(chatId, '❌ Please enter male, female, or other.');
            return; // ask again
          }
          break;
        }
        default:
          user.profile[field] = incomingText;
      }

      user.pendingFields.shift();
      await user.save();

      if (user.pendingFields.length > 0) {
        await sendTelegramMessage(chatId, FIELD_PROMPTS[user.pendingFields[0]]);
        return;
      }

      await sendTelegramMessage(chatId, '✅ Thanks! Now I can generate your workout.');
    } 
    else {
      // --- 5️⃣ Check for missing required fields ---
      const missingFields = REQUIRED_FIELDS.filter(f => 
        user.profile[f] == null || user.profile[f] === ''
      );

      if (missingFields.length > 0) {
        user.pendingFields = missingFields;
        await user.save();
        await sendTelegramMessage(chatId, FIELD_PROMPTS[missingFields[0]]);
        return;
      }
    }

    // --- 6️⃣ Generate OpenAI response ---
    const reply = await getAIResponse(
      {
        name: user.profile.name,
        age: user.profile.age,
        sex: user.profile.sex,       // null until set
        heightCm: user.profile.heightCm,
        weightKg: user.profile.weightKg,
      },
      incomingText
    );

    await sendTelegramMessage(chatId, reply);
    await user.save();

  } catch (err) {
    console.error('Telegram message error:', err);
    await sendTelegramMessage(chatId, '⚠️ Oops! Something went wrong.');
  }
}
