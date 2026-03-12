const BASE_URL = 'https://www.omdbapi.com';

function getApiKey(): string {
  return import.meta.env.VITE_OMDB_API_KEY ?? '';
}

interface OMDBRating {
  Source: string;
  Value: string;
}

interface OMDBResponse {
  Response: string;
  imdbRating?: string;
  Ratings?: OMDBRating[];
}

export interface OMDBScores {
  imdbRating: string | null;
  rottenTomatoesRating: string | null;
}

export async function getOMDBScores(imdbId: string): Promise<OMDBScores> {
  const apiKey = getApiKey();
  if (!apiKey || !imdbId) {
    return { imdbRating: null, rottenTomatoesRating: null };
  }

  try {
    const res = await fetch(
      `${BASE_URL}/?i=${encodeURIComponent(imdbId)}&apikey=${encodeURIComponent(apiKey)}`
    );
    if (!res.ok) return { imdbRating: null, rottenTomatoesRating: null };

    const data: OMDBResponse = await res.json();
    if (data.Response !== 'True') {
      return { imdbRating: null, rottenTomatoesRating: null };
    }

    const rtRating = data.Ratings?.find((r) => r.Source === 'Rotten Tomatoes');

    return {
      imdbRating: data.imdbRating ?? null,
      rottenTomatoesRating: rtRating?.Value ?? null,
    };
  } catch {
    return { imdbRating: null, rottenTomatoesRating: null };
  }
}
