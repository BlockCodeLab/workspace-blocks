const DEFAULT_MAIN_CONTENT = `
from popsicle.blocks import *
import code1
run()
`;

export default {
  assetList: [
    {
      id: 'main',
      type: 'text/x-python',
      content: DEFAULT_MAIN_CONTENT,
    },
  ],
  fileList: [
    {
      id: 'code1',
      type: 'text/x-python',
    },
  ],
};
