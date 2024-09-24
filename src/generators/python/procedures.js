import { ScratchBlocks } from '@blockcode/blocks-editor';
import { pythonGenerator } from './generator';

pythonGenerator['procedures_definition'] = (block) => {
  const myBlock = block.childBlocks_[0];
  const functionName = pythonGenerator.variableDB_.getName(myBlock.getProcCode(), ScratchBlocks.Procedures.NAME_TYPE);
  const args = myBlock.childBlocks_.map((argBlock) =>
    pythonGenerator.variableDB_.getName(argBlock.getFieldValue('VALUE'), ScratchBlocks.Variables.NAME_TYPE),
  );
  args.push('target');
  return pythonGenerator.eventToCode_(functionName, args);
};

pythonGenerator['procedures_call'] = (block) => {
  const functionName = pythonGenerator.variableDB_.getName(block.getProcCode(), ScratchBlocks.Procedures.NAME_TYPE);
  const args = block.argumentIds_.map((arg) => pythonGenerator.valueToCode(block, arg, pythonGenerator.ORDER_NONE));
  return `await ${functionName}(${args.join(',')}, target)\n`;
};

// pythonGenerator['procedures_prototype'] = (block) => {
//   return '"procedures_prototype"';
// };

// pythonGenerator['procedures_declaration'] = (block) => {
//   return '"procedures_declaration"';
// };

pythonGenerator['argument_reporter_boolean'] = (block) => {
  const code = pythonGenerator.variableDB_.getName(block.getFieldValue('VALUE'), ScratchBlocks.Variables.NAME_TYPE);
  return [code, pythonGenerator.ORDER_ATOMIC];
};

pythonGenerator['argument_reporter_string_number'] = (block) => {
  const code = pythonGenerator.variableDB_.getName(block.getFieldValue('VALUE'), ScratchBlocks.Variables.NAME_TYPE);
  return [code, pythonGenerator.ORDER_ATOMIC];
};

// pythonGenerator['argument_editor_boolean'] = (block) => {
//   return ['"argument_editor_boolean"'];
// };

// pythonGenerator['argument_editor_string_number'] = (block) => {
//   return ['"argument_editor_string_number"'];
// };
