import { useEffect, useState } from 'preact/hooks';
import { useLocale, useLayout, useEditor } from '@blockcode/core';
import { classNames } from '@blockcode/ui';
import { BlocksEditor as Editor, ScratchBlocks, makeToolboxXML } from '@blockcode/blocks-editor';
import loadExtension from '../../lib/load-extension';

import DataPrompt from '../data-prompt/data-prompt';
import MyBlockPrompt from '../myblock-prompt/myblock-prompt';
import ExtensionLibrary from '../extension-library/extension-library';

import styles from './blocks-editor.module.css';
import extensionIcon from './icon-extension.svg';

const loadedExtensions = new Map();

const blockFilter = (block) => typeof block !== 'string' && !block.button;

const importExtensions = async (extensions, addLocaleData, addAsset, onLoadExtension) => {
  if (extensions) {
    for (const extensionId of extensions) {
      if (!loadedExtensions.has(extensionId)) {
        let { default: extensionObject } = await import(`@blockcode/extension-${extensionId}/blocks`);
        extensionObject.id = extensionId;
        if (extensionObject.files) {
          for (const file of extensionObject.files) {
            const id = `extensions/${extensionId}/${file.name}`;
            const content = await fetch(file.uri).then((res) => res.text());
            try {
              addAsset({
                ...file,
                id,
                content,
              });
            } catch (err) {}
          }
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
  toolbox,
  messages,
  generators,
  enableMultiTargets,
  enableLocalVariable,
  disableGenerator,
  disableExtension,
  onChange,
  onExtensionsFilter,
  onLoadExtension,
}) {
  const { addLocaleData, getText, maybeLocaleText } = useLocale();
  const { splash, createPrompt, createAlert, removeAlert, setSplash } = useLayout();
  const { editor, fileList, selectedFileId, openFile, modifyFile, addAsset, setModified } = useEditor();

  const [workspace, setWorkspace] = useState();
  const [dataPrompt, setDataPrompt] = useState(false);
  const [myBlockPrompt, setMyBlockPrompt] = useState(false);
  const [extensionLibrary, setExtensionLibrary] = useState(false);
  const [extensionsImported, setExtensionsImported] = useState(false);

  messages = {
    EVENT_WHENPROGRAMSTART: getText('blocks.event.programStart', 'when program start'),
    CONTROL_STOP_OTHER: getText('blocks.control.stopOther', 'other scripts'),
    PROCEDURES_ADD_LABEL: getText('blocks.myblock.addLabel', ' label text'),
    PROCEDURES_ADD_BOOLEAN: getText('blocks.myblock.addBoolean', 'boolean'),
    PROCEDURES_ADD_STRING_NUMBER: getText('blocks.myblock.addNumbetText', 'number or text'),
    ...(messages || []),
  };

  useEffect(() => {
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

    ScratchBlocks.FlyoutExtensionCategoryHeader.getExtensionState = (extensionId) => {
      if (!loadedExtensions.has(extensionId)) return;
      const extensionObject = loadedExtensions.get(extensionId);
      const { statusButton } = extensionObject;
      if (!statusButton) {
        return ScratchBlocks.StatusButtonState.NOT_READY;
      }

      if (statusButton.storage) {
        if (statusButton.storage.every((item) => localStorage.getItem(item.id))) {
          return ScratchBlocks.StatusButtonState.READY;
        }
        return ScratchBlocks.StatusButtonState.NOT_READY;
      }

      if (statusButton.onUpdate?.()) {
        return ScratchBlocks.StatusButtonState.READY;
      }
      return ScratchBlocks.StatusButtonState.NOT_READY;
    };

    const refreshStatusButtons = () => ScratchBlocks.refreshStatusButtons(workspace);

    ScratchBlocks.statusButtonCallback = (extensionId) => {
      if (!loadedExtensions.has(extensionId)) return;
      const extensionObject = loadedExtensions.get(extensionId);
      const { statusButton } = extensionObject;
      if (!statusButton) return;

      if (statusButton.storage) {
        createPrompt({
          title: extensionObject.name,
          label: statusButton.title,
          inputMode: statusButton.storage.map((item) => ({
            name: item.id,
            placeholder: item.text,
            defaultValue: localStorage.getItem(item.id),
          })),
          body: statusButton.description,
          onSubmit: (value) => {
            Object.entries(value).forEach(([key, val]) => localStorage.setItem(key, val));
            refreshStatusButtons();
          },
        });
        return;
      }

      statusButton.onClick?.(refreshStatusButtons);
    };

    ScratchBlocks.Procedures.externalProcedureDefCallback = (mutator, defCallback) => {
      setMyBlockPrompt({
        mutator,
        defCallback,
      });
    };
  }, [workspace]);

  // global variables
  let globalVariables;
  if (workspace) {
    globalVariables = workspace.getAllVariables().filter((variable) => {
      if (variable.isLocal) return false;

      if (variable.type === ScratchBlocks.BROADCAST_MESSAGE_VARIABLE_TYPE) {
        if (variable.name === ScratchBlocks.Msg.DEFAULT_BROADCAST_MESSAGE_NAME) return false;

        const id = variable.id_.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(`<field name="BROADCAST_OPTION" id="${id}"[^>]+>[^<]+</field>`, 'g');
        for (const file of fileList) {
          if (re.test(file.xml)) return true;
        }
        return false;
      }
      return true;
    });
  }

  let toolboxXML = toolbox || makeToolboxXML();
  const isStage = selectedFileId === fileList[0].id;
  const buttonWrapper = (onClick) =>
    onClick.bind(null, {
      context: useEditor(),
      createPrompt,
      createAlert,
      removeAlert,
    });
  loadedExtensions.forEach((extensionObject) => {
    toolboxXML += loadExtension(generators, extensionObject, isStage, maybeLocaleText, buttonWrapper);
  });

  const generateCode = (workspace) => {
    let content = '\n';
    if (!disableGenerator) {
      content = generators[0]?.workspaceToCode(workspace);
    }
    // save extensions
    const extensions = Array.from(
      new Set(
        Object.values(workspace.blockDB_)
          .filter((block) => loadedExtensions.has(block.category_))
          .map((block) => block.category_),
      ),
    );
    return {
      content,
      extensions,
    };
  };

  const handleChange = (xml, workspace) => {
    const { content, extensions } = generateCode(workspace);
    modifyFile({
      xml,
      content,
      extensions,
    });
    if (onChange) {
      onChange(xml, workspace);
    }
  };

  const handleDataPromptSubmit = (input, options) => {
    dataPrompt.callback(input, [], options);
    setDataPrompt(false);
  };

  const handleMyBlockPromptSubmit = (myBlockXML) => {
    if (myBlockXML && workspace && myBlockPrompt) {
      myBlockPrompt.defCallback(myBlockXML);
      workspace.refreshToolboxSelection_();
      workspace.toolbox_.scrollToCategoryById('myBlocks');
    }
    setMyBlockPrompt(false);
  };

  const handlePromptClose = () => {
    setDataPrompt(false);
    setMyBlockPrompt(false);
  };

  const handleExtensionLibraryOpen = () => setExtensionLibrary(true);
  const handleExtensionLibraryClose = () => setExtensionLibrary(false);

  const handleSelectExtension = async (extensionId) => {
    if (!loadedExtensions.has(extensionId)) {
      createAlert('importing', { id: extensionId });
      let { default: extensionObject } = await import(`@blockcode/extension-${extensionId}/blocks`);
      extensionObject.id = extensionId;
      if (extensionObject.files) {
        for (const file of extensionObject.files) {
          const id = `extensions/${extensionId.replace(/[^a-z\d]/gi, '_')}/${file.name}`;
          const content = await fetch(file.uri).then((res) => res.text());
          try {
            addAsset({
              ...file,
              id,
              content,
            });
          } catch (err) {}
        }
      }
      addLocaleData(extensionObject.translations);
      if (onLoadExtension) {
        onLoadExtension({
          ...extensionObject,
          blocks: extensionObject.blocks.filter(blockFilter),
        });
      }
      loadedExtensions.set(extensionObject.id, extensionObject);
      removeAlert(extensionId);
    }
    setTimeout(() => {
      workspace.toolbox_.setSelectedCategoryById(extensionId);
    }, 50);
  };

  // load project
  if (splash) {
    if (splash === true && extensionsImported === false) {
      loadedExtensions.clear();
      // import extensions
      setExtensionsImported(
        importExtensions(editor.extensions, addLocaleData, addAsset, onLoadExtension).then(() => {
          setTimeout(() => setExtensionsImported(true), 50);
        }),
      );
    }
    // load files' blocks one by one
    if (workspace && extensionsImported === true) {
      globalVariables = [];
      const defaultSelectedFileId = splash;
      if (fileList.length === 1 || defaultSelectedFileId === selectedFileId) {
        // loading finish
        setSplash(false);
        setExtensionsImported(false);
        setTimeout(() => setModified(false), 50);
      } else {
        // load file
        const index = fileList.findIndex((file) => file.id === selectedFileId) || 0;
        const file = fileList[index];
        const nextFileId = fileList.at(index - 1).id;
        setTimeout(() => {
          if (splash === true) {
            setSplash(selectedFileId);
            openFile(nextFileId);
          } else if (file.content) {
            openFile(nextFileId);
          }
        });
      }
    }
  }

  let extensionsLoaded = true;
  if (editor.extensions) {
    extensionsLoaded = editor.extensions.every((extensionId) => loadedExtensions.has(extensionId));
  }

  return (
    <>
      <div className={styles.editorWrapper}>
        <Editor
          toolbox={toolboxXML}
          messages={messages}
          extensionsLoaded={extensionsLoaded}
          globalVariables={globalVariables}
          onWorkspaceCreated={setWorkspace}
          onChange={handleChange}
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
            onSubmit={handleDataPromptSubmit}
          />
        )}
        {myBlockPrompt && (
          <MyBlockPrompt
            mutator={myBlockPrompt.mutator}
            onClose={handlePromptClose}
            onSubmit={handleMyBlockPromptSubmit}
          />
        )}
        {extensionLibrary && (
          <ExtensionLibrary
            onFilter={onExtensionsFilter}
            onSelect={handleSelectExtension}
            onClose={handleExtensionLibraryClose}
          />
        )}
      </div>
    </>
  );
}
