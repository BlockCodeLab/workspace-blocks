import { ScratchBlocks } from '@blockcode/blocks-editor';
import { pythonGenerator } from './generator';

pythonGenerator['event_whenflagclicked'] = function () {
  const branchCode = this.eventToCode('start', 'False');
  return `@when_start\n${branchCode}`;
};

pythonGenerator['event_whengreaterthan'] = function (block) {
  const nameValue = block.getFieldValue('WHENGREATERTHANMENU');
  const valueCode = this.valueToCode(block, 'VALUE', this.ORDER_NONE) || 0;
  const branchCode = this.eventToCode('greaterthen', 'False');
  return `@when_greaterthen("${nameValue}", num(${valueCode}))\n${branchCode}`;
};

pythonGenerator['event_whenbroadcastreceived'] = function (block) {
  const messageName = this.variableDB_.getName(
    block.getFieldValue('BROADCAST_OPTION'),
    ScratchBlocks.Variables.NAME_TYPE,
  );
  const branchCode = this.eventToCode('broadcastreceived', 'False');
  return `@when_broadcastreceived("${messageName}")\n${branchCode}`;
};

pythonGenerator['event_broadcast_menu'] = function (block) {
  const messageName = this.variableDB_.getName(
    block.getFieldValue('BROADCAST_OPTION'),
    ScratchBlocks.Variables.NAME_TYPE,
  );
  return [messageName, this.ORDER_ATOMIC];
};

pythonGenerator['event_broadcast'] = function (block) {
  const messageName = this.valueToCode(block, 'BROADCAST_INPUT', this.ORDER_NONE) || 'message1';
  return `runtime.broadcast("${messageName}")\n`;
};

pythonGenerator['event_broadcastandwait'] = function (block) {
  const messageName = this.valueToCode(block, 'BROADCAST_INPUT', this.ORDER_NONE) || 'message1';
  return `await runtime.broadcast("${messageName}", waiting=True)\n`;
};
