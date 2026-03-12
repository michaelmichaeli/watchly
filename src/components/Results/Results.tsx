import { useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import MovieCard from '../MovieCard/MovieCard';
import MovieCardSkeleton from '../MovieCardSkeleton/MovieCardSkeleton';
import styles from './Results.module.css';

const SKELETON_COUNT = 4;

export default function Results() {
  const { results, setCurrentView, clearResults, isLoadingMore, hasMore, loadMore } =
    useApp();
  const sentinelRef = useRef<HTMLDivElement>(null);

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
            ? `${results.length} movies loaded — scroll for more`
            : `${results.length} movies we think you'll love`}
        </p>
      </div>

      <div className={styles.movieList}>
        {results.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
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
