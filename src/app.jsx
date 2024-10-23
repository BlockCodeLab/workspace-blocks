import { Text } from '@blockcode/ui';
import makeMainMenu from './components/main-menu/make-main-menu';

import defaultProject from './lib/default-project';

/* generator */
import { PythonGenerator, DefaultPythonGenerator } from './generators/python';

/* components */
import BlocksEditor from './components/blocks-editor/blocks-editor';

/* assets */
import blocksIcon from './icon-blocks.svg';

/* languages */
import locales from './l10n';

const codeTab = {
  icon: blocksIcon,
  label: (
    <Text
      id="blocks.codeTab"
      defaultMessage="Code"
    />
  ),
  Content: BlocksEditor,
};

const monitorPane = {
  label: (
    <Text
      id="blocks.monitorPane.title"
      defaultMessage="Monitor"
    />
  ),
  Content: null,
};

export default function BlocksWorkspace({ addLocaleData, openProject }) {
  addLocaleData(locales);

  const createProject = () => {
    openProject(Object.assign(defaultProject));
  };
  createProject();

  return {
    mainMenu: makeMainMenu({ createProject, openProject }),

    tabs: [
      {
        ...codeTab,
        Content: () => <BlocksEditor generators={[new DefaultPythonGenerator()]} />,
      },
    ],

    sidebars: [],

    pane: false, // monitorPane,

    tutorials: true,

    canEditProjectName: true,

    defaultFileIndex: 0,

    defaultTabIndex: 0,
  };
}

export { locales, makeMainMenu, codeTab, monitorPane, PythonGenerator };
