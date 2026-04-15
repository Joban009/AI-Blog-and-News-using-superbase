import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI;
function getGenAI() {
  if (!genAI) genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI;
}

// POST /api/ai/generate
export async function generateContent(req, res, next) {
  try {
    const { prompt, type = 'blog', tone = 'professional', length = 'medium' } = req.body;
    if (!process.env.GEMINI_API_KEY)
      return res.status(503).json({ error: 'Set GEMINI_API_KEY in your environment.' });

    const wordCount = length === 'short' ? 300 : length === 'long' ? 1200 : 600;
    const model = getGenAI().getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' });

    const systemPrompt = `You are an expert ${type} writer.
Write a complete ${type} post in a ${tone} tone, approximately ${wordCount} words.
Return ONLY valid JSON (no markdown, no backticks):
{"title":"...","excerpt":"...","content":"... HTML with <h2>,<p>,<ul> tags"}`;

    const result = await model.generateContent(`${systemPrompt}\n\nTopic: ${prompt}`);
    const raw    = result.response.text().trim().replace(/^```json\s*/i, '').replace(/```\s*$/, '');
    const generated = JSON.parse(raw);

    res.json({ generated, prompt });
  } catch (err) {
    if (err.message?.includes('JSON'))
      return res.status(502).json({ error: 'AI returned malformed response. Try again.' });
    next(err);
  }
}

// POST /api/ai/improve
export async function improveContent(req, res, next) {
  try {
    const { content, instruction } = req.body;
    if (!process.env.GEMINI_API_KEY)
      return res.status(503).json({ error: 'Set GEMINI_API_KEY in your environment.' });

    const model = getGenAI().getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' });
    const result = await model.generateContent(
      `${instruction || 'Improve this content for clarity and engagement.'}\nReturn only improved HTML.\n\n${content}`
    );
    res.json({ improved: result.response.text().trim() });
  } catch (err) { next(err); }
}
