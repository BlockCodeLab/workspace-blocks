import { useEffect, useState } from 'preact/hooks';
import { Keys } from '@blockcode/core';
import { Text, MenuSection, MenuItem } from '@blockcode/ui';
import { ScratchBlocks } from '@blockcode/blocks-editor';

const isMac = /Mac/i.test(navigator.platform || navigator.userAgent);

export default function EditMenu({ itemClassName, children }) {
  const [undoDisabled, setUndoDisabled] = useState(true);
  const [redoDisabled, setRedoDisabled] = useState(true);
  const [workspace, setWorkspace] = useState(null);

  const mainWorkspace = ScratchBlocks.getMainWorkspace();
  if (mainWorkspace) {
    if (workspace?.id !== mainWorkspace.id) {
      setWorkspace(mainWorkspace);
    }
  }

  useEffect(() => {
    if (workspace) {
      workspace.addChangeListener(() => {
        setUndoDisabled(workspace.undoStack_.length === 0);
        setRedoDisabled(workspace.redoStack_.length === 0);
      });
      setUndoDisabled(workspace.undoStack_.length === 0);
      setRedoDisabled(workspace.redoStack_.length === 0);
    }
  }, [workspace]);

  return (
    <>
      <MenuSection>
        <MenuItem
          disabled={undoDisabled}
          className={itemClassName}
          label={
            <Text
              id="blocks.menu.edit.undo"
              defaultMessage="Undo"
            />
          }
          hotkey={[isMac ? Keys.COMMAND : Keys.CONTROL, Keys.Z]}
          onClick={async (e) => {
            if (e instanceof MouseEvent && workspace) {
              workspace.undo(false);
            }
          }}
        />

        <MenuItem
          disabled={redoDisabled}
          className={itemClassName}
          label={
            <Text
              id="blocks.menu.edit.redo"
              defaultMessage="Redo"
            />
          }
          hotkey={isMac ? [Keys.SHIFT, Keys.COMMAND, Keys.Z] : [Keys.CONTROL, Keys.Y]}
          onClick={async (e) => {
            if (e instanceof MouseEvent && workspace) {
              workspace.undo(true);
            }
          }}
        />
      </MenuSection>

      {children}
    </>
  );
}
