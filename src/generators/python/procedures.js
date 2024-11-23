import { ScratchBlocks } from '@blockcode/blocks-editor';
import { pythonGenerator } from './generator';

pythonGenerator['procedures_definition'] = function (block) {
  const myBlock = block.childBlocks_[0];
  const funcName = this.variableDB_.getName(myBlock.getProcCode(), ScratchBlocks.Procedures.NAME_TYPE);
  const args = myBlock.childBlocks_.map((argBlock) =>
    this.variableDB_.getName(argBlock.getFieldValue('VALUE'), ScratchBlocks.Variables.NAME_TYPE),
  );
  const branchCode = this.eventToCode('procedure', myBlock.warp_ ? 'True' : 'False', ...args);
  return `@when_procedure("${funcName}")\n${branchCode}`;
};

pythonGenerator['procedures_call'] = function (block) {
  const funcName = this.variableDB_.getName(block.getProcCode(), ScratchBlocks.Procedures.NAME_TYPE);
  const args = block.argumentIds_.map((arg) => this.valueToCode(block, arg, this.ORDER_NONE));
  const argsCode = args.length > 0 ? `, ${args.join(', ')}` : '';
  return `await runtime.procedure_call("${funcName}"${argsCode})\n`;
};

pythonGenerator['argument_reporter_boolean'] = function (block) {
  const code = this.variableDB_.getName(block.getFieldValue('VALUE'), ScratchBlocks.Variables.NAME_TYPE);
  return [code, this.ORDER_ATOMIC];
};

pythonGenerator['argument_reporter_string_number'] = function (block) {
  const code = this.variableDB_.getName(block.getFieldValue('VALUE'), ScratchBlocks.Variables.NAME_TYPE);
  return [code, this.ORDER_ATOMIC];
};
