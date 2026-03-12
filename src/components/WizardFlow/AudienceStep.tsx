import type { Audience, AudienceOption } from '../../types';
import styles from './AudienceStep.module.css';

const audiences: AudienceOption[] = [
  { value: 'solo', label: 'Solo', emoji: '🧑', description: 'Just me, myself & I' },
  { value: 'date-night', label: 'Date Night', emoji: '💑', description: 'Something romantic or fun' },
  { value: 'family', label: 'Family', emoji: '👨‍👩‍👧‍👦', description: 'Kid-friendly picks' },
  { value: 'friends', label: 'Friends', emoji: '👥', description: 'Group-worthy fun' },
];

interface Props {
  onSelect: (audience: Audience) => void;
  selected: Audience | null;
}

export default function AudienceStep({ onSelect, selected }: Props) {
  return (
    <div>
      <h2 className={styles.stepTitle}>Who's watching?</h2>
      <div className={styles.grid}>
        {audiences.map((aud) => (
          <button
            key={aud.value}
            className={`${styles.card} ${selected === aud.value ? styles.cardSelected : ''}`}
            onClick={() => onSelect(aud.value)}
          >
            <span className={styles.emoji}>{aud.emoji}</span>
            <span className={styles.label}>{aud.label}</span>
            <span className={styles.description}>{aud.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
