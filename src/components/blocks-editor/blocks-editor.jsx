import { useState } from 'preact/hooks';
import { useLocale, useLayout, useEditor } from '@blockcode/core';
import { classNames } from '@blockcode/ui';
import { BlocksEditor as Editor, ScratchBlocks, makeToolboxXML } from '@blockcode/blocks-editor';
import { pythonGenerator } from '../../generators/python';
import loadExtension from '../../lib/load-extension';

import DataPrompt from '../data-prompt/data-prompt';
import ExtensionLibrary from '../extension-library/extension-library';

import styles from './blocks-editor.module.css';
import extensionIcon from './icon-extension.svg';

const loadedExtensions = new Map();

const blockFilter = (block) => typeof block !== 'string' && !block.button;

const importExtensions = async (deviceId, extensions, addLocaleData, modifyAsset, onLoadExtension) => {
  if (extensions) {
    for (const extensionId of extensions) {
      if (!loadedExtensions.has(extensionId)) {
        let { default: extensionObject } = await import(`@blockcode/extension-${extensionId}/blocks`);
        if (typeof extensionObject === 'function') {
          extensionObject = extensionObject(deviceId);
        }
        extensionObject.id = extensionId;
        if (extensionObject.files) {
          extensionObject.files.forEach(async (file) => {
            const id = `extensions/${extensionId}/${file.name}`;
            const content = await fetch(file.uri).then((res) => res.text());
            modifyAsset({
              ...file,
              id,
              content,
            });
          });
        }
        addLocaleData(extensionObject.translations);
        if (onLoadExtension) {
          onLoadExtension({
            ...extensionObject,
            blocks: extensionObject.blocks.filter(blockFilter),
          });
        }
        loadedExtensions.set(extensionId, extensionObject);
      }
    }
  }
};

export default function BlocksEditor({
  toolbox: defaultToolbox,
  messages,
  enableMultiTargets,
  enableLocalVariable,
  disableGenerator,
  disableExtension,
  deviceId,
  onChange,
  onExtensionsFilter,
  onLoadExtension,
}) {
  const { addLocaleData, getText, maybeLocaleText } = useLocale();
  const { splash, createPrompt, createAlert, removeAlert, setSplash } = useLayout();
  const { editor, fileList, selectedIndex, openFile, modifyFile, modifyAsset, setModified } = useEditor();

  const [workspace, setWorkspace] = useState();
  const [dataPrompt, setDataPrompt] = useState(false);
  const [extensionLibrary, setExtensionLibrary] = useState(false);
  const [extensionsImported, setExtensionsImported] = useState(false);

  if (splash) {
    if (splash === true && extensionsImported === false) {
      loadedExtensions.clear();
      // import extensions
      setExtensionsImported(
        setTimeout(() => {
          setExtensionsImported(
            importExtensions(deviceId, editor.extensions, addLocaleData, modifyAsset, onLoadExtension).then(() =>
              setExtensionsImported(true),
            ),
          );
        }, 100),
      );
    }
    // load files' blocks one by one
    if (extensionsImported === true) {
      let projectBlocksReady = true;
      if (fileList.length > 1) {
        for (let i = 0; i > -fileList.length; i--) {
          const file = fileList.at(i);
          if (!file.content) {
            projectBlocksReady = false;
            setTimeout(() => {
              openFile((i + fileList.length) % fileList.length);
            }, 100);
            break;
          }
        }
      }
      if (projectBlocksReady) {
        setTimeout(() => {
          setSplash(false);
          setModified(false);
        }, 100);
      }
    }
  }

  messages = {
    EVENT_WHENPROGRAMSTART: getText('blocks.event.programStart', 'when program start'),
    CONTROL_STOP_OTHER: getText('blocks.control.stopOther', 'other scripts'),
    ...(messages || []),
  };

  ScratchBlocks.prompt = (message, defaultValue, callback, optTitle, optVarType) => {
    const prompt = { callback, message, defaultValue };
    prompt.title = optTitle ? optTitle : ScratchBlocks.Msg.VARIABLE_MODAL_TITLE;
    prompt.varType = typeof optVarType === 'string' ? optVarType : ScratchBlocks.SCALAR_VARIABLE_TYPE;
    prompt.showVariableOptions = // This flag means that we should show variable/list options about scope
      enableMultiTargets &&
      optVarType !== ScratchBlocks.BROADCAST_MESSAGE_VARIABLE_TYPE &&
      prompt.title !== ScratchBlocks.Msg.RENAME_VARIABLE_MODAL_TITLE &&
      prompt.title !== ScratchBlocks.Msg.RENAME_LIST_MODAL_TITLE;
    prompt.showCloudOption = optVarType === ScratchBlocks.SCALAR_VARIABLE_TYPE && this.props.canUseCloud;
    setDataPrompt(prompt);
  };

  // global variables
  let globalVariables;
  if (workspace) {
    globalVariables = workspace.getAllVariables().filter((variable) => {
      if (variable.isLocal) return false;

      if (variable.type === ScratchBlocks.BROADCAST_MESSAGE_VARIABLE_TYPE) {
        if (variable.name === ScratchBlocks.Msg.DEFAULT_BROADCAST_MESSAGE_NAME) return false;

        const id = variable.id_.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(`<field name="BROADCAST_OPTION" id="${id}"[^>]+>[^<]+</field>`, 'g');
        for (const target of fileList) {
          if (re.test(target.xml)) return true;
        }
        return false;
      }
      return true;
    });
  }

  let toolboxXML = defaultToolbox || makeToolboxXML();
  const isStage = selectedIndex === 0;
  const buttonWrapper = (onClick) =>
    onClick.bind(null, {
      context: useEditor(),
      createPrompt,
      createAlert,
      removeAlert,
    });
  loadedExtensions.forEach((extensionObject) => {
    toolboxXML += loadExtension(extensionObject, isStage, maybeLocaleText, buttonWrapper);
  });

  const handleChange = (newXml, workspace) => {
    let newCode;
    if (!disableGenerator) {
      newCode = pythonGenerator.workspaceToCode(workspace);
    }
    modifyFile({
      xml: newXml,
      content: newCode,
    });
    if (onChange) {
      onChange(newXml, workspace);
    }
  };

  const handlePromptSubmit = (input, options) => {
    dataPrompt.callback(input, [], options);
    setDataPrompt(false);
  };
  const handlePromptClose = () => setDataPrompt(false);

  const handleExtensionLibraryOpen = () => setExtensionLibrary(true);
  const handleExtensionLibraryClose = () => setExtensionLibrary(false);

  const handleSelectExtension = (extensionObject) => {
    if (!loadedExtensions.has(extensionObject.id)) {
      addLocaleData(extensionObject.translations);
      if (onLoadExtension) {
        onLoadExtension({
          ...extensionObject,
          blocks: extensionObject.blocks.filter(blockFilter),
        });
      }
      loadedExtensions.set(extensionObject.id, extensionObject);
    }
    setTimeout(() => {
      workspace.toolbox_.setSelectedCategoryById(extensionObject.id);
    }, 100);
  };

  return (
    <>
      <div className={styles.editorWrapper}>
        <Editor
          toolbox={toolboxXML}
          messages={messages}
          globalVariables={globalVariables}
          onWorkspaceCreated={setWorkspace}
          onChange={selectedIndex !== -1 ? handleChange : null}
        />
        {disableExtension ? null : (
          <div className={classNames('scratchCategoryMenu', styles.extensionButton)}>
            <button
              className={styles.addButton}
              title={getText('blocks.extensions.addExtension', 'Add Extension')}
              onClick={handleExtensionLibraryOpen}
            >
              <img
                src={extensionIcon}
                title="Add Extension"
              />
            </button>
          </div>
        )}
        {dataPrompt && (
          <DataPrompt
            title={dataPrompt.title}
            label={dataPrompt.message}
            defaultValue={dataPrompt.defaultValue}
            enableLocalVariable={enableLocalVariable}
            showListMessage={dataPrompt.varType === ScratchBlocks.LIST_VARIABLE_TYPE}
            showVariableOptions={dataPrompt.showVariableOptions}
            showCloudOption={dataPrompt.showCloudOption}
            onClose={handlePromptClose}
            onSubmit={handlePromptSubmit}
          />
        )}
        {extensionLibrary && (
          <ExtensionLibrary
            deviceId={deviceId}
            onFilter={onExtensionsFilter}
            onSelect={handleSelectExtension}
            onClose={handleExtensionLibraryClose}
          />
        )}
      </div>

      {DEVELOPMENT && !disableGenerator && (
        <div className={styles.debugBox}>
          <pre>{fileList[selectedIndex].content}</pre>
        </div>
      )}
    </>
  );
}
