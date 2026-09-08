import { askGroq } from './_groq.js';

// Vercel serverless function. Keeps GROQ_API_KEY server-side only — set it in
// the Vercel project's Environment Variables (or a gitignored .env.local for
// local dev), never in client code or a committed file.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Search is not configured on the server.' });
    return;
  }

  const { question, context } = req.body ?? {};
  if (!question || typeof question !== 'string' || !question.trim()) {
    res.status(400).json({ error: 'A question is required.' });
    return;
  }

  try {
    const answer = await askGroq({ apiKey, question, context });
    res.status(200).json({ answer });
  } catch (err) {
    res.status(err.status || 502).json({ error: err.message, detail: err.detail });
  }
}
