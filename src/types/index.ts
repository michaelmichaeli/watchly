export interface Movie {
  id: number;
  title: string;
  overview: string;
  posterPath: string | null;
  releaseDate: string;
  tmdbRating: number;
  imdbRating: string | null;
  rottenTomatoesRating: string | null;
  genres: string[];
  runtime: number | null;
  aiReason: string | null;
}

export interface GenreOption {
  id: number;
  name: string;
  emoji: string;
}

export type Audience = 'solo' | 'date-night' | 'family' | 'friends';

export interface AudienceOption {
  value: Audience;
  label: string;
  emoji: string;
  description: string;
}

export type View = 'wizard' | 'results' | 'watchlist';

export interface WizardSelections {
  genre: number | null;
  audience: Audience | null;
  prompt: string;
}
