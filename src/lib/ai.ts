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

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is not set');

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      max_tokens: 200,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Groq API error: ${err}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content ?? '';
  const clean = text.replace(/```json|```/g, '').trim();

  try {
    const parsed = JSON.parse(clean);
    const category = CATEGORIES.includes(parsed.category) ? parsed.category : 'Other';
    return { summary: parsed.summary, category };
  } catch {
    return {
      summary: 'Client submitted a business request for review.',
      category: 'Other',
    };
  }
}