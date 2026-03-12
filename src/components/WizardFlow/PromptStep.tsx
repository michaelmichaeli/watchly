import { useState } from 'react';
import styles from './PromptStep.module.css';

interface Props {
  onSubmit: (prompt: string) => void;
}

export default function PromptStep({ onSubmit }: Props) {
  const [text, setText] = useState('');

  return (
    <div>
      <h2 className={styles.stepTitle}>Describe what you're in the mood for</h2>
      <p className={styles.hint}>
        Optional — tell the AI what you're looking for and it'll tailor its picks.
      </p>
      <textarea
        className={styles.textarea}
        placeholder='e.g. "Something like Inception but lighter" or "A hidden gem from the 90s"'
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        maxLength={300}
      />
      <div className={styles.actions}>
        <button className={styles.skipBtn} onClick={() => onSubmit('')}>
          Skip
        </button>
        <button
          className={styles.submitBtn}
          onClick={() => onSubmit(text)}
        >
          Find Movies →
        </button>
      </div>
    </div>
  );
}
