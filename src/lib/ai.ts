export type AIResult = {
  summary: string;
  category: string;
};

const CATEGORIES = [
  'Automation',
  'Website',
  'AI Integration',
  'SEO',
  'Custom Software',
  'Other',
];

export async function categorizeWithAI(helpText: string): Promise<AIResult> {
  const prompt = `You are a business analyst for a digital agency. A potential client submitted the following request:

"${helpText}"

Your job is to:
1. Write a single concise sentence summarizing their core need (under 20 words).
2. Choose the single best category from this list: ${CATEGORIES.join(', ')}.

Respond ONLY with valid JSON in exactly this format, no other text:
{"summary": "...", "category": "..."}`;

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 200,
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini API error: ${err}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  // Strip markdown fences if present
  const clean = text.replace(/```json|```/g, '').trim();

  try {
    const parsed = JSON.parse(clean);
    const category = CATEGORIES.includes(parsed.category)
      ? parsed.category
      : 'Other';
    return { summary: parsed.summary, category };
  } catch {
    // Fallback if parsing fails
    return {
      summary: 'Client submitted a business request for review.',
      category: 'Other',
    };
  }
}
