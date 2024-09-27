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

  const createProject = (project) => {
    project = project ?? defaultProject;
    openProject(
      Object.assign(
        {
          selectedFileId: project.fileList[0].id,
        },
        project,
      ),
    );
  };
  createProject(project);

  const pythonGenerator = new DefaultPythonGenerator();
  createLayout({
    mainMenu: makeMainMenu({ createProject, openProject }),

    tabs: [
      {
        ...codeTab,
        Content: () => <BlocksEditor generator={pythonGenerator} />,
      },
    ],

    sidebars: [],

    pane: false, // monitorPane,

    tutorials: true,

    canEditProjectName: true,
  });
}

export { locales, makeMainMenu, codeTab, monitorPane, PythonGenerator };
