import { useRef, useEffect, useState } from 'preact/hooks';
import { classNames, Text, Button, Modal } from '@blockcode/ui';
import { ScratchBlocks } from '@blockcode/blocks-editor';

import styles from './myblock-prompt.module.css';
import booleanInputIcon from './icon-boolean-input.svg';
import textInputIcon from './icon-text-input.svg';
import labelIcon from './icon-label.svg';

const MY_BLOCK_DEFAULT_OPTIONS = {
  zoom: {
    controls: false,
    wheel: false,
    startScale: 0.9,
  },
  comments: false,
  collapse: false,
  scrollbars: true,
};

export default function MyBlockPrompt({ mutator, onClose, onSubmit }) {
  const ref = useRef(null);
  const [type, setType] = useState('command');

  const handleChangeType = () => {};

  const handleAddLabel = () => {
    if (ref.mutationRoot) {
      ref.mutationRoot.addLabelExternal();
    }
  };

  const handleAddBoolean = () => {
    if (ref.mutationRoot) {
      ref.mutationRoot.addBooleanExternal();
    }
  };

  const handleAddTextNumber = () => {
    if (ref.mutationRoot) {
      ref.mutationRoot.addStringNumberExternal();
    }
  };

  const handleSubmit = () => {
    onSubmit(ref.mutationRoot?.mutationToDom(true));
  };

  useEffect(() => {
    if (ref.current) {
      const oldDefaultToolbox = ScratchBlocks.Blocks.defaultToolbox;
      ScratchBlocks.Blocks.defaultToolbox = null;
      ref.workspace = ScratchBlocks.inject(
        ref.current,
        Object.assign({}, MY_BLOCK_DEFAULT_OPTIONS, {
          media: './assets/blocks-media/',
        }),
      );
      ScratchBlocks.Blocks.defaultToolbox = oldDefaultToolbox;

      // Create the procedure declaration block for editing the mutation.
      ref.mutationRoot = ref.workspace.newBlock('procedures_declaration');
      // Make the declaration immovable, undeletable and have no context menu
      ref.mutationRoot.setMovable(false);
      ref.mutationRoot.setDeletable(false);
      ref.mutationRoot.contextMenu = false;

      ref.workspace.addChangeListener(() => {
        ref.mutationRoot.onChangeFn();
        // Keep the block centered on the workspace
        const metrics = ref.workspace.getMetrics();
        const { x, y } = ref.mutationRoot.getRelativeToSurfaceXY();
        const dy = metrics.viewHeight / 2 - ref.mutationRoot.height / 2 - y;
        let dx = metrics.viewWidth / 2 - ref.mutationRoot.width / 2 - x;
        // If the procedure declaration is wider than the view width,
        // keep the right-hand side of the procedure in view.
        if (ref.mutationRoot.width > metrics.viewWidth) {
          dx = metrics.viewWidth - ref.mutationRoot.width - x;
        }
        ref.mutationRoot.moveBy(dx, dy);
      });
      ref.mutationRoot.domToMutation(mutator);
      ref.mutationRoot.initSvg();
      ref.mutationRoot.render();
      // Allow the initial events to run to position this block, then focus.
      setTimeout(() => {
        ref.mutationRoot.focusLastEditor_();
      });
    }
    return () => {
      if (ref.workspace) {
        ref.workspace.dispose();
      }
    };
  }, [ref]);

  return (
    <Modal
      title={
        <Text
          id="blocks.myBlockPrompt.title"
          defaultMessage="Make a Block"
        />
      }
      className={styles.promptModal}
      onClose={onClose}
    >
      <div
        ref={ref}
        className={styles.workspace}
      />
      <div className={styles.body}>
        <div className={styles.optionsRow}>
          <div
            role="button"
            className={styles.optionCard}
            onClick={handleAddTextNumber}
          >
            <img
              className={styles.optionIcon}
              src={textInputIcon}
            />
            <div className={styles.optionTitle}>
              <Text
                id="blocks.myBlockPrompt.addAnInputNumberText"
                defaultMessage="Add an input"
              />
            </div>
            <div className={styles.optionDescription}>
              <Text
                id="blocks.myBlockPrompt.numberTextType"
                defaultMessage="number or text"
              />
            </div>
          </div>
          <div
            role="button"
            className={styles.optionCard}
            onClick={handleAddBoolean}
          >
            <img
              className={styles.optionIcon}
              src={booleanInputIcon}
            />
            <div className={styles.optionTitle}>
              <Text
                id="blocks.myBlockPrompt.addAnInputBoolean"
                defaultMessage="Add an input"
              />
            </div>
            <div className={styles.optionDescription}>
              <Text
                id="blocks.myBlockPrompt.booleanType"
                defaultMessage="boolean"
              />
            </div>
          </div>
          <div
            role="button"
            className={styles.optionCard}
            onClick={handleAddLabel}
          >
            <img
              className={styles.optionIcon}
              src={labelIcon}
            />
            <div className={styles.optionTitle}>
              <Text
                id="blocks.myBlockPrompt.addALabel"
                defaultMessage="Add a label"
              />
            </div>
          </div>
        </div>
        {/*
        <div className={styles.radioboxRow}>
          <label>
            <input
              checked={type === 'command'}
              name="blockTypeOption"
              type="radio"
              value="command"
              onChange={() => setType('command')}
            />
            <Text
              id="blocks.myBlockPrompt.command"
              defaultMessage="Command"
            />
          </label>
          <label>
            <input
              checked={type === 'numberText'}
              name="blockTypeOption"
              type="radio"
              value="numberText"
              onChange={() => setType('numberText')}
            />
            <Text
              id="blocks.myBlockPrompt.reporterNumberText"
              defaultMessage="Return number or text"
            />
          </label>
          <label>
            <input
              checked={type === 'boolean'}
              name="blockTypeOption"
              type="radio"
              value="boolean"
              onChange={() => setType('boolean')}
            />
            <Text
              id="blocks.myBlockPrompt.reporterBoolean"
              defaultMessage="Return boolean"
            />
          </label>
        </div>
        */}
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
