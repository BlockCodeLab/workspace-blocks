import { useEditor } from '@blockcode/core';
import styles from './code-review.module.css';

export default function CodeReview() {
  const { fileList, selectedFileId } = useEditor();
  const file = fileList.find((file) => file.id === selectedFileId);
  let lines = [];
  if (file?.content) {
    lines = file.content.split('\n');
  }
  return (
    <div className={styles.codeReview}>
      <pre>
        {lines.map((c) => (
          <span>{c}</span>
        ))}
      </pre>
    </div>
  );
}
