import { Text } from '@blockcode/ui';
import makeMainMenu from './components/main-menu/make-main-menu';
import mpy from './lib/mpy';

import defaultProject from './lib/default-project';

/* generator */
import { PythonGenerator, pythonGenerator } from './generators/python';

/* components */
import BlocksEditor from './components/blocks-editor/blocks-editor';
import CodeReview from './components/code-review/code-review';

/* assets */
import blocksIcon from './icon-blocks.svg';
import reviewIcon from './icon-review.svg';

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

const reviewTab = {
  icon: reviewIcon,
  label: (
    <Text
      id="blocks.reviewTab"
      defaultMessage="Code Review"
    />
  ),
  Content: CodeReview,
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

const beforeDownload = (info, fileList, assetList) => {
  return [].concat(fileList, assetList, mpy);
};

export default function BlocksWorkspace({ addLocaleData, openProject, useDefaultProject }) {
  addLocaleData(locales);

  const createProject = () => {
    openProject(Object.assign(defaultProject));
  };
  if (useDefaultProject) {
    createProject();
  }

  return {
    mainMenu: makeMainMenu({ createProject, openProject, beforeDownload }),

    tabs: [
      {
        ...codeTab,
        Content: () => <BlocksEditor generators={[pythonGenerator]} />,
      },
    ].concat(DEVELOPMENT ? reviewTab : []),

    sidebars: [],

    pane: false, // monitorPane,

    tutorials: false,

    canEditProjectName: true,
  };
}

export { locales, makeMainMenu, codeTab, reviewTab, monitorPane, PythonGenerator };
