import { readExtensions } from '../../macros/extensions' with { type: 'macro' };

const extensionList = readExtensions();

export default extensionList.map(async (extensionId) => {
  const { default: extensionInfo } = await import(`@blockcode/extension-${extensionId}`);
  extensionInfo.id = extensionId;
  return extensionInfo;
});
