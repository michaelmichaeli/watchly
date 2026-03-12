import { useApp } from '../../context/AppContext';
import type { Movie } from '../../types';
import styles from './MovieCard.module.css';

interface Props {
  movie: Movie;
}

export default function MovieCard({ movie }: Props) {
  const { addToWatchlist, removeFromWatchlist, isInWatchlist, markAsSeen, isSeen } =
    useApp();

  const inWatchlist = isInWatchlist(movie.id);
  const seen = isSeen(movie.id);
  const year = movie.releaseDate ? movie.releaseDate.slice(0, 4) : '';

  const formatRuntime = (min: number) => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className={styles.card}>
      <div className={styles.posterWrapper}>
        {movie.posterPath ? (
          <img
            className={styles.poster}
            src={movie.posterPath}
            alt={`${movie.title} poster`}
            loading="lazy"
          />
        ) : (
          <div className={styles.noPoster}>🎬</div>
        )}
      </div>

      <div className={styles.info}>
        <div className={styles.titleRow}>
          <h3 className={styles.movieTitle}>
            {movie.title}
            {year && <span className={styles.year}>({year})</span>}
          </h3>
        </div>

        <div className={styles.scores}>
          {movie.imdbRating && (
            <span className={styles.score}>
              <span className={styles.imdbBadge}>IMDb</span>
              {movie.imdbRating}/10
            </span>
          )}
          {movie.rottenTomatoesRating && (
            <span className={styles.score}>
              <span className={styles.tomatoIcon}>🍅</span>
              {movie.rottenTomatoesRating}
            </span>
          )}
          <span className={styles.score}>
            <span className={styles.tmdbBadge}>TMDB</span>
            {movie.tmdbRating.toFixed(1)}
          </span>
        </div>

        <div className={styles.meta}>
          {movie.genres.slice(0, 3).map((g) => (
            <span key={g} className={styles.genreTag}>
              {g}
            </span>
          ))}
          {movie.runtime && (
            <span className={styles.runtime}>{formatRuntime(movie.runtime)}</span>
          )}
        </div>

        {movie.aiReason && (
          <p className={styles.aiReason}>
            <span className={styles.aiReasonLabel}>Why this movie</span>
            {movie.aiReason}
          </p>
        )}

        <p className={styles.overview}>{movie.overview}</p>

        <div className={styles.actions}>
          <button
            className={`${styles.actionBtn} ${inWatchlist ? styles.watchlistBtnAdded : styles.watchlistBtn}`}
            onClick={() =>
              inWatchlist ? removeFromWatchlist(movie.id) : addToWatchlist(movie)
            }
          >
            {inWatchlist ? '✓ In Watchlist' : '+ Watchlist'}
          </button>
          <button
            className={`${styles.actionBtn} ${styles.seenBtn} ${seen ? styles.seenBtnActive : ''}`}
            onClick={() => markAsSeen(movie.id)}
          >
            {seen ? '✓ Seen' : '👁 Mark as Seen'}
          </button>
        </div>
      </div>
    </div>
  );
}
