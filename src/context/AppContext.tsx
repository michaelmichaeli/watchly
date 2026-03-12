import {
  createContext,
  useContext,
  useCallback,
  useState,
  useRef,
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
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

const BATCH_SIZE = 4;

type TMDBResult = {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  release_date: string;
  vote_average: number;
};

async function enrichMovieBatch(
  movies: TMDBResult[],
  reasonMap: Map<string, string>
): Promise<Movie[]> {
  return Promise.all(
    movies.map(async (tmdbMovie) => {
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
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentView, setCurrentView] = useState<View>('wizard');
  const [results, setResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [watchlist, setWatchlist] = useLocalStorage<Movie[]>('watchly-watchlist', []);
  const [seenIds, setSeenIds] = useLocalStorage<number[]>('watchly-seen', []);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const pendingMoviesRef = useRef<TMDBResult[]>([]);
  const reasonMapRef = useRef(new Map<string, string>());
  const loadingMoreRef = useRef(false);

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
      setResults([]);
      setHasMore(false);

      try {
        const aiRecs = await getAIRecommendations(
          selections.genre,
          selections.audience as Audience,
          selections.prompt
        );

        const rMap = new Map(
          aiRecs.map((r) => [r.title.toLowerCase(), r.reason])
        );
        reasonMapRef.current = rMap;

        const searchResults = await Promise.all(
          aiRecs.map((rec) => searchMovieByTitle(rec.title, rec.year))
        );

        const foundMovies = searchResults.filter(
          (m): m is NonNullable<typeof m> => m !== null && !seenIds.includes(m.id)
        );

        if (foundMovies.length === 0) {
          setError('No new movies found. Try different selections or clear your seen history!');
          setIsLoading(false);
          return;
        }

        const firstBatch = foundMovies.slice(0, BATCH_SIZE);
        const remaining = foundMovies.slice(BATCH_SIZE);
        pendingMoviesRef.current = remaining;

        const enriched = await enrichMovieBatch(firstBatch, rMap);
        setResults(enriched);
        setHasMore(remaining.length > 0);
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

  const loadMore = useCallback(async () => {
    if (loadingMoreRef.current || pendingMoviesRef.current.length === 0) return;

    loadingMoreRef.current = true;
    setIsLoadingMore(true);

    try {
      const nextBatch = pendingMoviesRef.current.slice(0, BATCH_SIZE);
      pendingMoviesRef.current = pendingMoviesRef.current.slice(BATCH_SIZE);

      const enriched = await enrichMovieBatch(nextBatch, reasonMapRef.current);
      setResults((prev) => [...prev, ...enriched]);
      setHasMore(pendingMoviesRef.current.length > 0);
    } catch {
      // Silently fail — user can try scrolling again
    } finally {
      loadingMoreRef.current = false;
      setIsLoadingMore(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    pendingMoviesRef.current = [];
    reasonMapRef.current = new Map();
    setHasMore(false);
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
        isLoadingMore,
        hasMore,
        loadMore,
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
