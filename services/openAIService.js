import fetch from 'node-fetch';

/**
 * Get AI response safely with fallback
 * @param {object} profile
 * @param {string} message
 * @returns {string} AI response or fallback
 */
export async function getAIResponse(profile, message) {
  try {
    const userPrompt = `
Known user profile:
Name: ${profile.name || 'unknown'}
Age: ${profile.age ?? 'unknown'}
Sex: ${profile.sex || 'unknown'}
Height: ${profile.heightCm ?? 'unknown'} cm
Weight: ${profile.weightKg ?? 'unknown'} kg

User message:
"${message}"
`.trim();

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a gym-focused personal trainer. Tone: direct, confident, motivating. Short replies only.',
          },
          { role: 'assistant', content: 'Rules: Training-only. Ask max 2 questions if info missing. Plain text output only.' },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!response.ok) throw new Error(`OpenAI API error ${response.status}`);

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) throw new Error('OpenAI returned empty content');

    return content;

  } catch (err) {
    console.error('OpenAI error:', err);

    // Fallback message
    return '⚠️ Sorry, I am having trouble generating a response right now. Please try again later.';
  }
}
