import { useApp } from '../../context/AppContext';
import MovieCard from '../MovieCard/MovieCard';
import styles from './Results.module.css';

export default function Results() {
  const { results, setCurrentView, clearResults } = useApp();

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
          Here are {results.length} movies we think you'll love.
        </p>
      </div>

      <div className={styles.movieList}>
        {results.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>

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
