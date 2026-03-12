import { useApp } from './context/AppContext';
import Header from './components/Header/Header';
import WizardFlow from './components/WizardFlow/WizardFlow';
import Results from './components/Results/Results';
import Watchlist from './components/Watchlist/Watchlist';
import styles from './App.module.css';

function App() {
  const { currentView, isLoading, error } = useApp();

  return (
    <div className={styles.app}>
      <Header />
      <main className={styles.main}>
        {error && <div className={styles.errorBanner}>{error}</div>}
        {currentView === 'wizard' && <WizardFlow />}
        {currentView === 'results' && <Results />}
        {currentView === 'watchlist' && <Watchlist />}
      </main>

      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>Finding great movies for you...</p>
        </div>
      )}
    </div>
  );
}

export default App;
