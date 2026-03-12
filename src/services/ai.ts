const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

function getApiKey(): string {
  return import.meta.env.VITE_GROQ_API_KEY ?? '';
}

export interface AIRecommendation {
  title: string;
  year: number;
  reason: string;
}

const GENRE_MAP: Record<number, string> = {
  28: 'Action',
  35: 'Comedy',
  18: 'Drama',
  27: 'Horror',
  878: 'Sci-Fi',
  10749: 'Romance',
  53: 'Thriller',
  16: 'Animation',
  99: 'Documentary',
  80: 'Crime',
  12: 'Adventure',
  14: 'Fantasy',
};

const AUDIENCE_LABELS: Record<string, string> = {
  solo: 'someone watching alone',
  'date-night': 'a couple on date night',
  family: 'a family with kids',
  friends: 'a group of friends',
};

export async function getAIRecommendations(
  genreId: number,
  audience: string,
  userPrompt?: string
): Promise<AIRecommendation[]> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('Groq API key not configured');

  const genre = GENRE_MAP[genreId] ?? 'General';
  const audienceDesc = AUDIENCE_LABELS[audience] ?? audience;

  const extraContext = userPrompt?.trim()
    ? `\nThe user also said: "${userPrompt.trim()}". Factor this into your picks.`
    : '';

  const prompt = `Recommend exactly 8 great ${genre} movies for ${audienceDesc}.${extraContext}
Pick a diverse mix of well-known classics and hidden gems from different decades.
For each movie, include a short 1-sentence reason why you recommend it for this viewer.
Return ONLY a JSON array with objects containing "title" (string), "year" (number), and "reason" (string).
Example: [{"title": "The Dark Knight", "year": 2008, "reason": "A gripping thriller with incredible performances that keeps you on the edge."}]
No extra text, just the JSON array.`;

  const res = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content:
            'You are a movie expert. You respond only with valid JSON arrays. No markdown, no explanation.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.9,
      max_tokens: 2048,
    }),
  });

  if (!res.ok) {
    const errorBody = await res.text();
    throw new Error(`Groq API error (${res.status}): ${errorBody}`);
  }

  const data = await res.json();
  const content: string = data.choices?.[0]?.message?.content ?? '[]';

  const jsonMatch = content.match(/\[[\s\S]*\]/);
  if (!jsonMatch) throw new Error('AI returned invalid format');

  let parsed: AIRecommendation[];
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    // If JSON is truncated, try to salvage complete entries
    const entryPattern = /\{\s*"title"\s*:\s*"[^"]+"\s*,\s*"year"\s*:\s*\d+\s*,\s*"reason"\s*:\s*"[^"]*"\s*\}/g;
    const entries = jsonMatch[0].match(entryPattern);
    if (!entries?.length) throw new Error('AI returned invalid format');
    parsed = JSON.parse(`[${entries.join(',')}]`);
  }
  return parsed.filter((r) => r.title && r.year).map((r) => ({
    ...r,
    reason: r.reason ?? '',
  }));
}
