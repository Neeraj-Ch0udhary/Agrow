// lib/groq.ts
// NOTE: rename this file from gemini.ts → groq.ts and update the import in chat.tsx:
//   import { askGroq as askGemini } from '../lib/groq';
// Keeping the exported name as askGemini so chat.tsx needs zero other changes.
const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY!;
console.log('GROQ KEY:', GROQ_API_KEY ? `Found (${GROQ_API_KEY.slice(0, 8)}...)` : 'MISSING ❌');
const GROQ_URL     = 'https://api.groq.com/openai/v1/chat/completions';
const MAX_RETRIES  = 2;
const RETRY_DELAY  = 1200; // ms

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// ── Friendly error messages for common Groq HTTP codes ────────────────────
const friendlyError = (status: number): string => {
  switch (status) {
    case 401: return 'Invalid API key. Please check your EXPO_PUBLIC_GROQ_API_KEY.';
    case 429: return 'Too many requests. Please wait a moment and try again.';
    case 503: return 'Groq service is temporarily unavailable. Try again in a few seconds.';
    default:  return `API error (${status}). Please check your internet connection.`;
  }
};

/**
 * Calls the Groq API with automatic retry on transient failures.
 *
 * The chat.tsx already builds a full system-role prompt inside `buildFarmingPrompt`
 * and passes it as `userMessage`, so we do NOT add a second system prompt here —
 * that was causing the AI to receive conflicting instructions and ignore language
 * rules set in chat.tsx.
 *
 * max_tokens raised from 400 → 900 so answers don't get cut off mid-sentence.
 */
export async function askGemini(userMessage: string): Promise<string> {
  let lastError: Error = new Error('Unknown error');

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) await sleep(RETRY_DELAY * attempt);

      const response = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model:       'llama-3.1-8b-instant',
          messages:    [{ role: 'user', content: userMessage }],
          max_tokens:  900,      // was 400 — was cutting answers mid-sentence
          temperature: 0.7,
          stream:      false,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Don't retry on auth errors — they won't resolve themselves
        if (response.status === 401) throw new Error(friendlyError(401));

        // Retry on rate-limit and server errors
        if (response.status === 429 || response.status >= 500) {
          lastError = new Error(friendlyError(response.status));
          continue;
        }

        throw new Error(friendlyError(response.status));
      }

      const content = data?.choices?.[0]?.message?.content;
      if (!content) throw new Error('Empty response from AI. Please try again.');

      return content.trim();

    } catch (err: any) {
      // Network errors (no internet, DNS failure, etc.)
      if (err.message?.includes('Network request failed') || err.message?.includes('fetch')) {
        lastError = new Error('No internet connection. Please check your network and try again.');
        continue; // retry
      }
      // Re-throw non-retryable errors immediately
      throw err;
    }
  }

  throw lastError;
}