import { User } from '../models/userModel.js';
import { getAIResponse } from '../services/openAIService.js';
import { sendViberMessage } from '../services/viberService.js';

// Fields required for workouts
const REQUIRED_FIELDS = ['age','heightCm','weightKg'];

export async function handleWebhook(req, res) {
  const { sender, message } = req.body;
  const viberUserId = sender?.id;
  const incomingText = message?.text?.trim();

  if (!viberUserId || !incomingText) return res.status(400).send('Invalid payload');

  try {
    let user = await User.findOne({ viberUserId });
    if (!user) {
      user = await User.create({ viberUserId });
    }

    user.lastSeenAt = new Date();

    // Step 1: Check if bot is waiting for any pending field
    if (user.pendingFields.length > 0) {
      const field = user.pendingFields[0]; // take first pending field

      // Parse numeric response if needed
      if (['age','heightCm','weightKg'].includes(field)) {
        const value = parseInt(incomingText);
        if (!isNaN(value)) user.profile[field] = value;
      } else {
        user.profile[field] = incomingText;
      }

      // Remove field from pending
      user.pendingFields.shift();
      await user.save();

      // If more pending fields, ask next
      if (user.pendingFields.length > 0) {
        await sendViberMessage(viberUserId, `Please provide your ${user.pendingFields[0]}:`);
        return res.status(200).send('ok');
      }

      // All pending fields provided
      await sendViberMessage(viberUserId, 'Thanks! Now I can generate your workout.');
    } 
    else {
      // Step 2: Check which required fields are missing
      const missingFields = REQUIRED_FIELDS.filter(f => !user.profile[f]);
      if (missingFields.length > 0) {
        user.pendingFields = missingFields;
        await user.save();
        await sendViberMessage(viberUserId, `Please provide your ${missingFields[0]}:`);
        return res.status(200).send('ok');
      }
    }

    // Step 3: All required fields are present → call OpenAI
    const reply = await getAIResponse(user.profile, incomingText);
    await sendViberMessage(viberUserId, reply);

    await user.save();
    return res.status(200).send('ok');

  } catch (err) {
    console.error(err);
    return res.status(500).send('Internal Server Error');
  }
}
