const codeId = `code_${Date.now().toString(36)}`;

const DEFAULT_MAIN_CONTENT = `
from popsicle.blocks import *
import ${codeId}
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
      id: codeId,
      type: 'text/x-python',
    },
  ],
};
