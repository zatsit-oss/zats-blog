import styles from './styles.module.css';

export default function CodeLabs({url}) {
  return (
    <div class={styles.codelabs}>
      <iframe src={url} class={styles.codelabs} iframe></iframe>
    </div>
  );
}
