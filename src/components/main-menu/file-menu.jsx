import { readExtensions } from '../../macros/extensions' with { type: 'macro' };
import { svgAsDataUri } from 'save-svg-as-png';
import { Keys, useLayout, useEditor } from '@blockcode/core';
import { Text, MenuSection, MenuItem } from '@blockcode/ui';
import { ScratchBlocks } from '@blockcode/blocks-editor';

const isMac = /Mac/i.test(navigator.platform || navigator.userAgent);

const extensionList = readExtensions();

export default function FileMenu({ itemClassName, onNew, onOpen, onSave, children }) {
  const { createPrompt, setStoreLibrary } = useLayout();
  const { modified, saveNow, saveToComputer, openFromComputer } = useEditor();

  const saveProject = async () => {
    let thumb, extensions;
    const workspace = ScratchBlocks.getMainWorkspace();
    if (workspace) {
      thumb = await svgAsDataUri(workspace.getCanvas(), {});
      // save extensions
      extensions = Array.from(
        new Set(
          Object.values(workspace.blockDB_)
            .filter((block) => extensionList.find((extension) => extension === block.category_))
            .map((block) => block.category_),
        ),
      );
    }
    return (data) => {
      const project = {
        thumb,
        ...data,
        ...(onSave ? onSave() : {}),
        editor: {
          ...data.editor,
          extensions,
        },
      };
      if (project.assetList) {
        project.assetList = project.assetList.filter((asset) => !asset.id.startsWith('extensions/'));
      }
      project.fileList = project.fileList.map(({ content, script, ...data }) => data);
      // console.log(project);
      return project;
    };
  };

  return (
    <>
      <MenuSection>
        <MenuItem
          className={itemClassName}
          label={
            <Text
              id="blocks.menu.file.newProject"
              defaultMessage="New"
            />
          }
          hotkey={[isMac ? Keys.COMMAND : Keys.CONTROL, Keys.N]}
          onClick={() => {
            if (modified) {
              createPrompt({
                title: (
                  <Text
                    id="gui.projects.notSaved"
                    defaultMessage="Not saved"
                  />
                ),
                label: (
                  <Text
                    id="gui.projects.replaceProject"
                    defaultMessage="Replace contents of the current project?"
                  />
                ),
                onSubmit: onNew,
              });
            } else {
              onNew();
            }
          }}
        />

        <MenuItem
          className={itemClassName}
          label={
            <Text
              id="blocks.menu.file.openProject"
              defaultMessage="Open"
            />
          }
          hotkey={[isMac ? Keys.COMMAND : Keys.CONTROL, Keys.O]}
          onClick={() => setStoreLibrary(true)}
        />

        <MenuItem
          className={itemClassName}
          label={
            <Text
              id="blocks.menu.file.saveProject"
              defaultMessage="Save"
            />
          }
          hotkey={[isMac ? Keys.COMMAND : Keys.CONTROL, Keys.S]}
          onClick={async () => saveNow(await saveProject())}
        />
      </MenuSection>

      <MenuSection>
        <MenuItem
          className={itemClassName}
          label={
            <Text
              id="blocks.menu.file.uploadProject"
              defaultMessage="Load from your computer"
            />
          }
          onClick={() => openFromComputer(onOpen)}
        />

        <MenuItem
          className={itemClassName}
          label={
            <Text
              id="blocks.menu.file.downloadProject"
              defaultMessage="save to your computer"
            />
          }
          onClick={async () => saveToComputer(await saveProject())}
        />
      </MenuSection>

      {children}
    </>
  );
}
