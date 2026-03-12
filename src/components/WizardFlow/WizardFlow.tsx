import { useState, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import type { WizardSelections, Audience } from '../../types';
import GenreStep from './GenreStep';
import AudienceStep from './AudienceStep';
import PromptStep from './PromptStep';
import styles from './WizardFlow.module.css';

const TOTAL_STEPS = 3;

export default function WizardFlow() {
  const { fetchRecommendations } = useApp();
  const [step, setStep] = useState(0);
  const [selections, setSelections] = useState<WizardSelections>({
    genre: null,
    audience: null,
    prompt: '',
  });

  const selectGenre = useCallback((genre: number) => {
    setSelections((s) => ({ ...s, genre }));
    setStep(1);
  }, []);

  const selectAudience = useCallback(
    (audience: Audience) => {
      setSelections((s) => ({ ...s, audience }));
      setStep(2);
    },
    []
  );

  const submitPrompt = useCallback(
    (prompt: string) => {
      const updated = { ...selections, prompt };
      setSelections(updated);
      fetchRecommendations(updated);
    },
    [selections, fetchRecommendations]
  );

  const goBack = () => setStep((s) => Math.max(0, s - 1));

  return (
    <div className={styles.wizard}>
      <div className={styles.hero}>
        <h1 className={styles.title}>
          What do you want to <span className={styles.titleAccent}>watch</span>?
        </h1>
        <p className={styles.subtitle}>
          Answer a few quick questions and AI will find the perfect movie for you.
        </p>
      </div>

      <div className={styles.progress}>
        {Array.from({ length: TOTAL_STEPS }, (_, i) => (
          <span key={i}>
            {i > 0 && (
              <span className={`${styles.line} ${i <= step ? styles.lineDone : ''}`} />
            )}
            <span
              className={`${styles.dot} ${i === step ? styles.dotActive : ''} ${i < step ? styles.dotDone : ''}`}
            />
          </span>
        ))}
      </div>

      <div className={styles.stepContainer}>
        {step === 0 && <GenreStep onSelect={selectGenre} selected={selections.genre} />}
        {step === 1 && (
          <AudienceStep onSelect={selectAudience} selected={selections.audience} />
        )}
        {step === 2 && <PromptStep onSubmit={submitPrompt} />}

        {step > 0 && (
          <div className={styles.stepNav}>
            <button className={styles.backButton} onClick={goBack}>
              ← Back
            </button>
            <div className={styles.spacer} />
          </div>
        )}
      </div>
    </div>
  );
}
