import { ScratchBlocks } from '@blockcode/blocks-editor';
import { pythonGenerator } from './generator';

pythonGenerator['event_whenflagclicked'] = () => {
  const branchCode = pythonGenerator.hatToCode('start');
  return `${branchCode}runtime.when_start(${pythonGenerator.HAT_FUNCTION_PLACEHOLDER})\n`;
};

pythonGenerator['event_whengreaterthan'] = (block) => {
  const nameValue = block.getFieldValue('WHENGREATERTHANMENU');
  const valueCode = pythonGenerator.valueToCode(block, 'VALUE', pythonGenerator.ORDER_NONE) || 0;
  const branchCode = pythonGenerator.hatToCode('greaterthen');
  return `${branchCode}runtime.when_greaterthen("${nameValue}", num(${valueCode}), ${pythonGenerator.HAT_FUNCTION_PLACEHOLDER})\n`;
};

pythonGenerator['event_whenbroadcastreceived'] = (block) => {
  const messageName = pythonGenerator.variableDB_.getName(
    block.getFieldValue('BROADCAST_OPTION'),
    ScratchBlocks.Variables.NAME_TYPE,
  );
  const branchCode = pythonGenerator.hatToCode('broadcastreceived');
  return `${branchCode}runtime.when_broadcastreceived("${messageName}", ${pythonGenerator.HAT_FUNCTION_PLACEHOLDER})\n`;
};

pythonGenerator['event_broadcast_menu'] = (block) => {
  const messageName = pythonGenerator.variableDB_.getName(
    block.getFieldValue('BROADCAST_OPTION'),
    ScratchBlocks.Variables.NAME_TYPE,
  );
  return [messageName, pythonGenerator.ORDER_ATOMIC];
};

pythonGenerator['event_broadcast'] = (block) => {
  const messageName = pythonGenerator.valueToCode(block, 'BROADCAST_INPUT', pythonGenerator.ORDER_NONE) || '"message1"';
  return `runtime.broadcast("${messageName}")\n`;
};

pythonGenerator['event_broadcastandwait'] = (block) => {
  const messageName = pythonGenerator.valueToCode(block, 'BROADCAST_INPUT', pythonGenerator.ORDER_NONE) || '"message1"';
  return `await runtime.broadcast("${messageName}")\n`;
};
