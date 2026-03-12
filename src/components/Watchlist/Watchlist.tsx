import { useApp } from '../../context/AppContext';
import MovieCard from '../MovieCard/MovieCard';
import styles from './Watchlist.module.css';

export default function Watchlist() {
  const { watchlist, setCurrentView, clearResults } = useApp();

  const findMovies = () => {
    clearResults();
    setCurrentView('wizard');
  };

  if (watchlist.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>📋</div>
        <p className={styles.emptyText}>Your watchlist is empty</p>
        <p className={styles.emptyHint}>
          Find movies and add them here to watch later.
        </p>
        <div className={styles.footer}>
          <button className={styles.btn} onClick={findMovies}>
            🎬 Find a Movie
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.watchlist}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          My <span className={styles.titleAccent}>Watchlist</span>
        </h2>
        <p className={styles.subtitle}>
          {watchlist.length} movie{watchlist.length !== 1 ? 's' : ''} saved for later
        </p>
      </div>

      <div className={styles.movieList}>
        {watchlist.map((movie) => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>

      <div className={styles.footer}>
        <button className={styles.btn} onClick={findMovies}>
          🎬 Find More Movies
        </button>
      </div>
    </div>
  );
}
