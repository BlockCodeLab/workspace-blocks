const codeId = `code_${Date.now().toString(36)}`;

const DEFAULT_MAIN_CONTENT = `
from blocks import *
import ${codeId}
start()
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
