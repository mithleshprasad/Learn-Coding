// Cap what gets sent to Groq: this key's free tier hard-limits requests to
// 8000 tokens/minute, and a full tutorial's Q&A list alone can run ~11k
// tokens. Ranking by keyword overlap with the question and keeping only the
// closest matches keeps requests small AND more relevant than a blind slice.
const MAX_CONTEXT_ITEMS = 12;
const MAX_ITEM_CHARS = 500;

function buildReference(context, question) {
  if (!Array.isArray(context) || context.length === 0) return '';

  const words = question.toLowerCase().match(/[a-z0-9]{3,}/g) || [];
  const scored = context.map((item) => {
    const q = item.question ?? item.title ?? '';
    const a = item.description ?? item.answer ?? '';
    const haystack = `${q} ${a}`.toLowerCase();
    const score = words.reduce((n, w) => (haystack.includes(w) ? n + 1 : n), 0);
    return { q, a, score };
  });

  const ranked = scored.some((s) => s.score > 0)
    ? [...scored].sort((a, b) => b.score - a.score)
    : scored;

  return ranked
    .slice(0, MAX_CONTEXT_ITEMS)
    .map(({ q, a }) => `Q: ${q}\nA: ${a.slice(0, MAX_ITEM_CHARS)}`)
    .join('\n\n');
}

// Shared by the Vercel serverless handler (api/search.js) and the Vite dev
// middleware (vite.config.js) so both paths ask Groq the same way.
export async function askGroq({ apiKey, question, context }) {
  const reference = buildReference(context, question);

  const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-20b',
      messages: [
        {
          role: 'system',
          content:
            'You are a concise coding tutor. Answer the user question using only the reference Q&A pairs below when relevant; if the answer is not covered by them, answer from general knowledge but say so briefly.\n\n' +
            reference,
        },
        { role: 'user', content: question },
      ],
      temperature: 0.3,
      max_tokens: 500,
    }),
  });

  if (!groqResponse.ok) {
    const detail = await groqResponse.text();
    const err = new Error('Search provider error.');
    err.status = 502;
    err.detail = detail;
    throw err;
  }

  const data = await groqResponse.json();
  return data.choices?.[0]?.message?.content?.trim() ?? '';
}
