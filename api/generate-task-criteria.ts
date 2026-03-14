import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { description } = req.body ?? {};
  if (!description || typeof description !== 'string' || !description.trim()) {
    return res.status(400).json({ error: 'A task description is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' });
  }

  const prompt = `You are a project management assistant. Given a task description, return a structured JSON object with exactly these three fields:
- definition_of_done: A clear, measurable list of criteria that must be true for this task to be considered complete
- impact: A concise statement of the expected business or user impact this task delivers
- acceptance_criteria: Specific testable conditions that must be satisfied

Return only valid JSON, no markdown, no explanation.

Task description: ${description.trim()}`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.4 },
        }),
      }
    );

    if (!geminiRes.ok) {
      const body = await geminiRes.text();
      return res.status(502).json({ error: `Gemini API error: ${geminiRes.status}`, detail: body });
    }

    const geminiData = await geminiRes.json();
    const rawText: string =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

    let parsed: { definition_of_done?: string; impact?: string; acceptance_criteria?: string };
    try {
      const cleaned = rawText.replace(/```json\s*|```/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return res.status(502).json({ error: 'Failed to parse Gemini response as JSON', raw: rawText });
    }

    const lines: string[] = [];
    if (parsed.definition_of_done) {
      lines.push('Definition of Done:', parsed.definition_of_done, '');
    }
    if (parsed.impact) {
      lines.push('Impact:', parsed.impact, '');
    }
    if (parsed.acceptance_criteria) {
      lines.push('Acceptance Criteria:', parsed.acceptance_criteria);
    }

    return res.status(200).json({ criteria: lines.join('\n').trim() });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: `Server error: ${message}` });
  }
}
