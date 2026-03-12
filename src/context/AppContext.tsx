import {
  createContext,
  useContext,
  useCallback,
  useState,
  type ReactNode,
} from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { getMovieDetails, searchMovieByTitle, IMAGE_BASE_URL } from '../services/tmdb';
import { getOMDBScores } from '../services/omdb';
import { getAIRecommendations } from '../services/ai';
import type { Movie, View, WizardSelections, Audience } from '../types';

interface AppContextValue {
  currentView: View;
  setCurrentView: (view: View) => void;
  results: Movie[];
  isLoading: boolean;
  error: string | null;
  watchlist: Movie[];
  seenIds: number[];
  addToWatchlist: (movie: Movie) => void;
  removeFromWatchlist: (movieId: number) => void;
  isInWatchlist: (movieId: number) => boolean;
  markAsSeen: (movieId: number) => void;
  isSeen: (movieId: number) => boolean;
  fetchRecommendations: (selections: WizardSelections) => Promise<void>;
  clearResults: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentView, setCurrentView] = useState<View>('wizard');
  const [results, setResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watchlist, setWatchlist] = useLocalStorage<Movie[]>('watchly-watchlist', []);
  const [seenIds, setSeenIds] = useLocalStorage<number[]>('watchly-seen', []);

  const addToWatchlist = useCallback(
    (movie: Movie) => {
      setWatchlist((prev) => {
        if (prev.some((m) => m.id === movie.id)) return prev;
        return [...prev, movie];
      });
    },
    [setWatchlist]
  );

  const removeFromWatchlist = useCallback(
    (movieId: number) => {
      setWatchlist((prev) => prev.filter((m) => m.id !== movieId));
    },
    [setWatchlist]
  );

  const isInWatchlist = useCallback(
    (movieId: number) => watchlist.some((m) => m.id === movieId),
    [watchlist]
  );

  const markAsSeen = useCallback(
    (movieId: number) => {
      setSeenIds((prev) => {
        if (prev.includes(movieId)) return prev;
        return [...prev, movieId];
      });
    },
    [setSeenIds]
  );

  const isSeen = useCallback(
    (movieId: number) => seenIds.includes(movieId),
    [seenIds]
  );

  const fetchRecommendations = useCallback(
    async (selections: WizardSelections) => {
      if (!selections.genre || !selections.audience) return;

      setIsLoading(true);
      setError(null);

      try {
        const aiRecs = await getAIRecommendations(
          selections.genre,
          selections.audience as Audience,
          selections.prompt
        );

        const reasonMap = new Map(
          aiRecs.map((r) => [r.title.toLowerCase(), r.reason])
        );

        const searchResults = await Promise.all(
          aiRecs.map((rec) => searchMovieByTitle(rec.title, rec.year))
        );

        const foundMovies = searchResults.filter(
          (m): m is NonNullable<typeof m> => m !== null && !seenIds.includes(m.id)
        );

        const moviesToShow = foundMovies.slice(0, 6);

        if (moviesToShow.length === 0) {
          setError('No new movies found. Try different selections or clear your seen history!');
          setIsLoading(false);
          return;
        }

        const enriched: Movie[] = await Promise.all(
          moviesToShow.map(async (tmdbMovie) => {
            try {
              const details = await getMovieDetails(tmdbMovie.id);
              const scores = details.imdb_id
                ? await getOMDBScores(details.imdb_id)
                : { imdbRating: null, rottenTomatoesRating: null };

              return {
                id: tmdbMovie.id,
                title: tmdbMovie.title,
                overview: tmdbMovie.overview,
                posterPath: tmdbMovie.poster_path
                  ? `${IMAGE_BASE_URL}${tmdbMovie.poster_path}`
                  : null,
                releaseDate: tmdbMovie.release_date,
                tmdbRating: tmdbMovie.vote_average,
                imdbRating: scores.imdbRating,
                rottenTomatoesRating: scores.rottenTomatoesRating,
                genres: details.genres.map((g) => g.name),
                runtime: details.runtime,
                aiReason: reasonMap.get(tmdbMovie.title.toLowerCase()) ?? null,
              };
            } catch {
              return {
                id: tmdbMovie.id,
                title: tmdbMovie.title,
                overview: tmdbMovie.overview,
                posterPath: tmdbMovie.poster_path
                  ? `${IMAGE_BASE_URL}${tmdbMovie.poster_path}`
                  : null,
                releaseDate: tmdbMovie.release_date,
                tmdbRating: tmdbMovie.vote_average,
                imdbRating: null,
                rottenTomatoesRating: null,
                genres: [],
                runtime: null,
                aiReason: reasonMap.get(tmdbMovie.title.toLowerCase()) ?? null,
              };
            }
          })
        );

        setResults(enriched);
        setCurrentView('results');
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Something went wrong. Please try again.'
        );
      } finally {
        setIsLoading(false);
      }
    },
    [seenIds]
  );

  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        results,
        isLoading,
        error,
        watchlist,
        seenIds,
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist,
        markAsSeen,
        isSeen,
        fetchRecommendations,
        clearResults,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
