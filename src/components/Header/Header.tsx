import { useApp } from '../../context/AppContext';
import styles from './Header.module.css';

export default function Header() {
  const { currentView, setCurrentView, clearResults, watchlist } = useApp();

  const goToWizard = () => {
    clearResults();
    setCurrentView('wizard');
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <button className={styles.logo} onClick={goToWizard}>
          <span className={styles.logoIcon}>🎬</span>
          Watch<span className={styles.logoAccent}>ly</span>
        </button>

        <nav className={styles.nav}>
          <button
            className={`${styles.navButton} ${currentView === 'wizard' || currentView === 'results' ? styles.navButtonActive : ''}`}
            onClick={goToWizard}
          >
            Find a Movie
          </button>
          <button
            className={`${styles.navButton} ${currentView === 'watchlist' ? styles.navButtonActive : ''}`}
            onClick={() => setCurrentView('watchlist')}
          >
            Watchlist
            {watchlist.length > 0 && (
              <span className={styles.badge}>{watchlist.length}</span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}
