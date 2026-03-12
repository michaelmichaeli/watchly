import type { GenreOption } from '../../types';
import styles from './GenreStep.module.css';

const genres: GenreOption[] = [
  { id: 28, name: 'Action', emoji: '💥' },
  { id: 35, name: 'Comedy', emoji: '😄' },
  { id: 18, name: 'Drama', emoji: '🎭' },
  { id: 27, name: 'Horror', emoji: '👻' },
  { id: 878, name: 'Sci-Fi', emoji: '🚀' },
  { id: 10749, name: 'Romance', emoji: '💕' },
  { id: 53, name: 'Thriller', emoji: '🔪' },
  { id: 16, name: 'Animation', emoji: '✨' },
  { id: 99, name: 'Documentary', emoji: '📹' },
  { id: 80, name: 'Crime', emoji: '🕵️' },
  { id: 12, name: 'Adventure', emoji: '🗺️' },
  { id: 14, name: 'Fantasy', emoji: '🧙' },
];

interface Props {
  onSelect: (genreId: number) => void;
  selected: number | null;
}

export default function GenreStep({ onSelect, selected }: Props) {
  return (
    <div>
      <h2 className={styles.stepTitle}>Pick a genre</h2>
      <div className={styles.grid}>
        {genres.map((genre) => (
          <button
            key={genre.id}
            className={`${styles.card} ${selected === genre.id ? styles.cardSelected : ''}`}
            onClick={() => onSelect(genre.id)}
          >
            <span className={styles.emoji}>{genre.emoji}</span>
            <span className={styles.label}>{genre.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
