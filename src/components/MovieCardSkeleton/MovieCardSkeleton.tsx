import styles from './MovieCardSkeleton.module.css';

export default function MovieCardSkeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.posterWrapper}>
        <div className={styles.skeleton} />
      </div>
      <div className={styles.info}>
        <div className={`${styles.skeleton} ${styles.title}`} />
        <div className={styles.scores}>
          <div className={`${styles.skeleton} ${styles.scoreBadge}`} />
          <div className={`${styles.skeleton} ${styles.scoreBadge}`} />
          <div className={`${styles.skeleton} ${styles.scoreBadge}`} />
        </div>
        <div className={styles.meta}>
          <div className={`${styles.skeleton} ${styles.tag}`} />
          <div className={`${styles.skeleton} ${styles.tag}`} />
          <div className={`${styles.skeleton} ${styles.tag}`} />
        </div>
        <div className={`${styles.skeleton} ${styles.reason}`} />
        <div className={styles.overviewLines}>
          <div className={`${styles.skeleton} ${styles.line}`} />
          <div className={`${styles.skeleton} ${styles.lineMedium}`} />
          <div className={`${styles.skeleton} ${styles.lineShort}`} />
        </div>
        <div className={styles.actions}>
          <div className={`${styles.skeleton} ${styles.button}`} />
          <div className={`${styles.skeleton} ${styles.button}`} />
        </div>
      </div>
    </div>
  );
}
