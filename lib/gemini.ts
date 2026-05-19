const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY!;
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function askGemini(userMessage: string): Promise<string> {
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

    const data = await response.json();

    if (!response.ok) throw new Error(JSON.stringify(data));
    return data.choices[0].message.content;
  } catch (error) {
    throw error;
  }
}
