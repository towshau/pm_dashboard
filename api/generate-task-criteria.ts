import type { VercelRequest, VercelResponse } from '@vercel/node';

function formatList(raw: string | string[]): string {
  const items = Array.isArray(raw)
    ? raw
    : raw.split(/,(?=[A-Z])/).map((s) => s.trim()).filter(Boolean);

  if (items.length === 1) return items[0];
  return items.map((item) => `• ${item}`).join('\n');
}

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

  const prompt = `You are a project management assistant. Given a task description, return a structured JSON object with exactly these fields:
- definition_of_done: An array of strings. Each string is one clear, measurable criterion that must be true for this task to be considered complete.
- impact: A concise statement (single string) of the expected business or user impact this task delivers.
- acceptance_criteria: An array of strings. Each string is one specific testable condition that must be satisfied.
- estimated_size: One of "XS", "S", "M", "L", "XL" based on estimated effort (XS = under 1 hour, S = a few hours, M = 1-2 days, L = 3-5 days, XL = over a week).
- estimated_priority: One of "high", "medium", "low" based on urgency and business importance.

Return only valid JSON, no markdown, no explanation.

Task description: ${description.trim()}`;

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
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

    let parsed: {
      definition_of_done?: string | string[];
      impact?: string;
      acceptance_criteria?: string | string[];
      estimated_size?: string;
      estimated_priority?: string;
    };
    try {
      const cleaned = rawText.replace(/```json\s*|```/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      return res.status(502).json({ error: 'Failed to parse Gemini response as JSON', raw: rawText });
    }

    const sections: string[] = [];
    if (parsed.definition_of_done) {
      sections.push(`Definition of Done\n${formatList(parsed.definition_of_done)}`);
    }
    if (parsed.impact) {
      sections.push(`Impact\n${parsed.impact}`);
    }
    if (parsed.acceptance_criteria) {
      sections.push(`Acceptance Criteria\n${formatList(parsed.acceptance_criteria)}`);
    }

    const VALID_SIZES = ['XS', 'S', 'M', 'L', 'XL'];
    const VALID_PRIORITIES = ['high', 'medium', 'low'];
    const estimatedSize = VALID_SIZES.includes(parsed.estimated_size ?? '') ? parsed.estimated_size : null;
    const estimatedPriority = VALID_PRIORITIES.includes(parsed.estimated_priority ?? '') ? parsed.estimated_priority : null;

    return res.status(200).json({
      criteria: sections.join('\n\n').trim(),
      estimated_size: estimatedSize ?? null,
      estimated_priority: estimatedPriority ?? null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: `Server error: ${message}` });
  }
}
