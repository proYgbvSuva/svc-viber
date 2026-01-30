import fetch from 'node-fetch';

export async function getAIResponse(profile, message) {
  try {
    // Build user profile safely, using "unknown" for null/undefined
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

    console.log('User prompt:', userPrompt);


    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // model: 'gpt-4',
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a gym-focused personal trainer for men 18–35 chasing an aesthetic physique. Tone: direct, confident, motivating, not cringe. Keep replies short.',
          },
          {
            role: 'assistant',
            content:
              'Rules: Training-only. Give a workout if asked. Ask max 2 questions if info missing. Output plain text only.',
          },
          // {
          //   role: 'system', 
          //   content: 'You are a health-care assistant. Focus in Booking system and initial findings only based on user symptoms.'
          // },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    console.log('OpenAI API response status:', response.status);

    const data = await response.json();

    console.log('OpenAI API response:', JSON.stringify(data, null, 2));


    // Check for valid response
    if (!data || !data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('OpenAI API response invalid:', JSON.stringify(data, null, 2));
      return 'Sorry, something went wrong with OpenAI.';
    }

    return data.choices[0].message.content;

  } catch (err) {
    console.error('Error calling OpenAI API:', err);
    return 'Sorry, something went wrong with OpenAI.';
  }
}
