const GROQ_API_KEY = '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';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function askGemini(userMessage: string): Promise<string> {
  console.log('Calling Groq API...');
  try {
    const response = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `You are Agrow AI, an expert farming assistant for Indian farmers. 
You specialize in modern farming techniques like mushroom cultivation, microgreens, hydroponics, stevia, exotic vegetables, and medicinal plants.
Always give practical, actionable advice in simple language.
Focus on profit potential in Indian Rupees, local Indian market conditions, step by step guidance.
Keep answers concise and farmer-friendly.
If asked in Hindi, respond in Hindi. If asked in English, respond in English.`
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        max_tokens: 400,
        temperature: 0.7,
      })
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', JSON.stringify(data));

    if (!response.ok) throw new Error(JSON.stringify(data));
    return data.choices[0].message.content;
  } catch (error) {
    console.log('FULL ERROR:', JSON.stringify(error));
    throw error;
  }
}