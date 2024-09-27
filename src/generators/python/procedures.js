import { ScratchBlocks } from '@blockcode/blocks-editor';
import { pythonGenerator } from './generator';

pythonGenerator['procedures_definition'] = function (block) {
  const myBlock = block.childBlocks_[0];
  const functionName = this.variableDB_.getName(myBlock.getProcCode(), ScratchBlocks.Procedures.NAME_TYPE);
  const args = myBlock.childBlocks_.map((argBlock) =>
    this.variableDB_.getName(argBlock.getFieldValue('VALUE'), ScratchBlocks.Variables.NAME_TYPE),
  );
  return this.functionToCode(functionName, args);
};

pythonGenerator['procedures_call'] = function (block) {
  const functionName = this.variableDB_.getName(block.getProcCode(), ScratchBlocks.Procedures.NAME_TYPE);
  const args = block.argumentIds_.map((arg) => this.valueToCode(block, arg, this.ORDER_NONE));
  return `await ${functionName}(${args.join(',')})\n`;
};

// pythonGenerator['procedures_prototype'] = function (block) {
//   return '"procedures_prototype"';
// };

// pythonGenerator['procedures_declaration'] = function (block) {
//   return '"procedures_declaration"';
// };

pythonGenerator['argument_reporter_boolean'] = function (block) {
  const code = this.variableDB_.getName(block.getFieldValue('VALUE'), ScratchBlocks.Variables.NAME_TYPE);
  return [code, this.ORDER_ATOMIC];
};

pythonGenerator['argument_reporter_string_number'] = function (block) {
  const code = this.variableDB_.getName(block.getFieldValue('VALUE'), ScratchBlocks.Variables.NAME_TYPE);
  return [code, this.ORDER_ATOMIC];
};

// pythonGenerator['argument_editor_boolean'] = function (block) {
//   return ['"argument_editor_boolean"'];
// };

// pythonGenerator['argument_editor_string_number'] = function (block) {
//   return ['"argument_editor_string_number"'];
// };
