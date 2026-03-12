import type { Audience } from '../types';

const BASE_URL = 'https://api.themoviedb.org/3';
export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

function getApiKey(): string {
  return import.meta.env.VITE_TMDB_API_KEY ?? '';
}

interface DiscoverParams {
  genreId: number;
  audience: Audience;
}

interface TMDBMovie {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

interface TMDBDiscoverResponse {
  results: TMDBMovie[];
  total_pages: number;
}

interface TMDBMovieDetails {
  id: number;
  imdb_id: string | null;
  runtime: number | null;
  genres: { id: number; name: string }[];
}

export async function discoverMovies(params: DiscoverParams): Promise<TMDBMovie[]> {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('TMDB API key not configured');

  const randomPage = Math.floor(Math.random() * 3) + 1;

  const queryParams = new URLSearchParams({
    api_key: apiKey,
    with_genres: String(params.genreId),
    sort_by: 'vote_average.desc',
    'vote_average.gte': '7.0',
    'vote_count.gte': '500',
    page: String(randomPage),
    language: 'en-US',
    include_adult: 'false',
  });

  if (params.audience === 'family') {
    queryParams.set('certification_country', 'US');
    queryParams.set('certification.lte', 'PG-13');
  }

  const res = await fetch(`${BASE_URL}/discover/movie?${queryParams}`);
  if (!res.ok) throw new Error(`TMDB discover failed: ${res.status}`);

  const data: TMDBDiscoverResponse = await res.json();

  if (data.results.length === 0 && randomPage > 1) {
    queryParams.set('page', '1');
    const fallbackRes = await fetch(`${BASE_URL}/discover/movie?${queryParams}`);
    if (!fallbackRes.ok) throw new Error(`TMDB discover fallback failed: ${fallbackRes.status}`);
    const fallbackData: TMDBDiscoverResponse = await fallbackRes.json();
    return fallbackData.results;
  }

  return data.results;
}

export async function getMovieDetails(movieId: number): Promise<TMDBMovieDetails> {
  const apiKey = getApiKey();
  const res = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${encodeURIComponent(apiKey)}&language=en-US`);
  if (!res.ok) throw new Error(`TMDB details failed: ${res.status}`);
  return res.json();
}

interface TMDBSearchResult {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
  genre_ids: number[];
}

interface TMDBSearchResponse {
  results: TMDBSearchResult[];
}

export async function searchMovieByTitle(
  title: string,
  year?: number
): Promise<TMDBSearchResult | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const queryParams = new URLSearchParams({
    api_key: apiKey,
    query: title,
    language: 'en-US',
    include_adult: 'false',
  });

  if (year) {
    queryParams.set('year', String(year));
  }

  const res = await fetch(`${BASE_URL}/search/movie?${queryParams}`);
  if (!res.ok) return null;

  const data: TMDBSearchResponse = await res.json();
  return data.results[0] ?? null;
}
