const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');

require('dotenv').config();

const client = new Groq({ apiKey: process.env.EXPO_PUBLIC_GROQ_API_KEY });

const LANGUAGES = {
  hi: 'Hindi (Devanagari script, simple language for rural Indian farmers)',
};

async function translateJSON(obj, langDescription) {
  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    max_tokens: 4000,
    messages: [{
      role: 'user',
      content: `Translate this JSON from English to ${langDescription}.
Rules:
- Keep ALL keys exactly the same, only translate the string values
- Keep emojis, ₹ symbols, → arrows, and {{placeholders}} unchanged
- Use simple farming language a rural Indian farmer would understand
- Return ONLY valid JSON, no markdown, no explanation

${JSON.stringify(obj, null, 2)}`
    }]
  });

  const text = response.choices[0].message.content.trim();
  const clean = text.replace(/^```json\n?/, '').replace(/\n?```$/, '');
  return JSON.parse(clean);
}

async function run() {
  const enPath = path.join(__dirname, '../locales/en.json');
  const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

  for (const [code, description] of Object.entries(LANGUAGES)) {
    console.log(`\nTranslating to ${code}...`);
    try {
      const translated = await translateJSON(en, description);
      const outPath = path.join(__dirname, `../locales/${code}.json`);
      fs.writeFileSync(outPath, JSON.stringify(translated, null, 2), 'utf8');
      console.log(`✅ ${code}.json saved!`);
    } catch (e) {
      console.error(`❌ Failed for ${code}:`, e.message);
    }
  }
}

run();