import { useRef, useEffect, useState } from 'preact/hooks';
import { classNames, Text, Button, Modal, BufferedInput } from '@blockcode/ui';

import styles from './data-prompt.module.css';

export default function DataPrompt({
  title,
  label,
  defaultValue,
  enableLocalVariable,
  showListMessage,
  showVariableOptions,
  showCloudOption,
  onClose,
  onSubmit,
}) {
  const ref = useRef(null);
  const [value, setValue] = useState(defaultValue);
  const [options, setOptions] = useState({
    scope: 'global',
    isCloud: false,
  });

  const handleSubmit = () => {
    onSubmit(value, options);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'Enter') {
      onSubmit(ref.current.base.value, options);
    }
  };

  useEffect(() => {
    if (ref.current) {
      ref.current.base.focus();
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [ref]);

  return (
    <Modal
      title={title}
      className={styles.promptModal}
      onClose={onClose}
    >
      <div className={styles.promptContent}>
        <div className={styles.label}>{label}</div>
        <BufferedInput
          autoFocus
          forceFocus
          ref={ref}
          className={styles.variableNameTextInput}
          defaultValue={value}
          onSubmit={setValue}
        />
        {showVariableOptions && (
          <div>
            {enableLocalVariable ? (
              <div className={styles.options}>
                <label>
                  <input
                    checked={options.scope === 'global'}
                    name="variableScopeOption"
                    type="radio"
                    value="global"
                    onChange={() => setOptions({ ...options, scope: 'global' })}
                  />
                  <Text
                    id="blocks.dataPrompt.forAllTargets"
                    defaultMessage="For all targets"
                  />
                </label>
                <label>
                  <input
                    checked={options.scope === 'local'}
                    name="variableScopeOption"
                    type="radio"
                    value="local"
                    onChange={() => setOptions({ ...options, scope: 'local' })}
                  />
                  <Text
                    id="blocks.dataPrompt.forThisTarget"
                    defaultMessage="For this target only"
                  />
                </label>
              </div>
            ) : (
              <div className={styles.infoMessage}>
                {showListMessage ? (
                  <Text
                    id={'blocks.dataPrompt.listAvailableToAllTargets'}
                    defaultMessage="This list will be available to all targets."
                  />
                ) : (
                  <Text
                    id={'blocks.dataPrompt.availableToAllTargets'}
                    defaultMessage="This variable will be available to all targets."
                  />
                )}
              </div>
            )}
          </div>
        )}

        <div className={styles.buttonRow}>
          <Button
            className={styles.button}
            onClick={onClose}
          >
            <Text
              id="blocks.prompt.cancel"
              defaultMessage="Cancel"
            />
          </Button>
          <Button
            className={classNames(styles.button, styles.okButton)}
            onClick={handleSubmit}
          >
            <Text
              id="blocks.prompt.ok"
              defaultMessage="OK"
            />
          </Button>
        </div>
      </div>
    </Modal>
  );
}
