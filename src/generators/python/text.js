import { pythonGenerator } from './generator';

pythonGenerator['text'] = function (block) {
  const textValue = block.getFieldValue('TEXT');
  const code = textValue.length === 0 || isNaN(textValue) ? this.quote_(textValue) : +textValue;
  return [code, this.ORDER_ATOMIC];
};
