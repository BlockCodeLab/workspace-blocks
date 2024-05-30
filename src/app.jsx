import { Text } from '@blockcode/ui';
import makeMainMenu from './components/main-menu/make-main-menu';

import defaultProject from './lib/default-project';

/* generator */
export { pythonGenerator } from './generators/python';

/* components */
import BlocksEditor from './components/blocks-editor/blocks-editor';

/* assets */
import blocksIcon from './icon-blocks.svg';

/* languages */
import en from './l10n/en.yaml';
import zhHans from './l10n/zh-hans.yaml';

const locales = {
  en,
  'zh-Hans': zhHans,
};

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

export default function BlocksWorkspace({ addLocaleData, createLayout, openProject, project }) {
  addLocaleData(locales);

  const createDefaultProject = (project) => {
    openProject(
      Object.assign(
        {
          selectedIndex: 0,
        },
        project || defaultProject,
      ),
    );
  };
  createDefaultProject(project);

  createLayout({
    mainMenu: makeMainMenu({ onNew: createDefaultProject }),

    tabs: [
      {
        ...codeTab,
        Content: BlocksEditor,
      },
    ],

    sidebars: [],

    pane: false, // monitorPane,

    tutorials: true,

    canEditProjectName: true,
  });
}

export { locales, makeMainMenu, codeTab, monitorPane };
