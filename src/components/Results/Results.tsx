import { useRef, useEffect, useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import MovieCard from '../MovieCard/MovieCard';
import MovieCardSkeleton from '../MovieCardSkeleton/MovieCardSkeleton';
import styles from './Results.module.css';

const SKELETON_COUNT = 4;
const RATING_OPTIONS = [9.0, 8.5, 8.0, 7.5, 7.0, 6.5, 6.0, 5.5, 5.0];

export default function Results() {
  const { results, setCurrentView, clearResults, isLoadingMore, hasMore, loadMore } =
    useApp();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [minRating, setMinRating] = useState<number | null>(null);

  const filteredResults = useMemo(() => {
    if (minRating === null) return results;
    return results.filter((m) => {
      if (!m.imdbRating) return false;
      const score = parseFloat(m.imdbRating);
      return !isNaN(score) && score >= minRating;
    });
  }, [results, minRating]);

  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    const el = sentinelRef.current;
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const startOver = () => {
    clearResults();
    setCurrentView('wizard');
  };

  if (results.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>🎞️</div>
        <p className={styles.emptyText}>No results yet. Let's find you a movie!</p>
        <div className={styles.footer}>
          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={startOver}>
            Start Picking
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.results}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          Your <span className={styles.titleAccent}>Picks</span>
        </h2>
        <p className={styles.subtitle}>
          {hasMore
            ? `${filteredResults.length} movies loaded — scroll for more`
            : `${filteredResults.length} movies we think you'll love`}
        </p>
      </div>

      <div className={styles.filterBar}>
        <span className={styles.filterLabel}>Min Rating</span>
        <div className={styles.filterChips}>
          <button
            className={`${styles.filterChip} ${minRating === null ? styles.filterChipActive : ''}`}
            onClick={() => setMinRating(null)}
          >
            All
          </button>
          {RATING_OPTIONS.map((r) => (
            <button
              key={r}
              className={`${styles.filterChip} ${minRating === r ? styles.filterChipActive : ''}`}
              onClick={() => setMinRating(r)}
            >
              {r.toFixed(1)}+
            </button>
          ))}
        </div>
      </div>

      <div className={styles.movieList}>
        {filteredResults.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
        {filteredResults.length === 0 && !isLoadingMore && (
          <p className={styles.noMatch}>No movies match this rating filter.</p>
        )}
        {isLoadingMore &&
          Array.from({ length: SKELETON_COUNT }, (_, i) => (
            <MovieCardSkeleton key={`skeleton-${i}`} />
          ))}
      </div>

      {hasMore && <div ref={sentinelRef} className={styles.sentinel} />}

      <div className={styles.footer}>
        <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={startOver}>
          🎬 Pick Again
        </button>
        <button
          className={`${styles.btn} ${styles.btnSecondary}`}
          onClick={() => setCurrentView('watchlist')}
        >
          📋 View Watchlist
        </button>
      </div>
    </div>
  );
}
