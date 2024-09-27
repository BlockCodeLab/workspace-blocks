import { ScratchBlocks } from '@blockcode/blocks-editor';
import { pythonGenerator } from './generator';

pythonGenerator['data_variable'] = function (block) {
  const varName = this.variableDB_.getName(block.getFieldValue('VARIABLE'), ScratchBlocks.Variables.NAME_TYPE);
  return [varName, this.ORDER_ATOMIC];
};

pythonGenerator['data_setvariableto'] = function (block) {
  let code = '';
  if (pythonGenerator.STATEMENT_PREFIX) {
    code += pythonGenerator.injectId(pythonGenerator.STATEMENT_PREFIX, block);
  }

  const varName = this.variableDB_.getName(block.getFieldValue('VARIABLE'), ScratchBlocks.Variables.NAME_TYPE);
  const valueCode = this.valueToCode(block, 'VALUE', this.ORDER_NONE) || '""';
  code += `${varName} = ${valueCode}\n`;
  return code;
};

pythonGenerator['data_changevariableby'] = function (block) {
  let code = '';
  if (pythonGenerator.STATEMENT_PREFIX) {
    code += pythonGenerator.injectId(pythonGenerator.STATEMENT_PREFIX, block);
  }

  const varName = this.variableDB_.getName(block.getFieldValue('VARIABLE'), ScratchBlocks.Variables.NAME_TYPE);
  const valueCode = this.valueToCode(block, 'VALUE', this.ORDER_NONE) || 0;
  code += `${varName} = num(${varName}) + num(${valueCode})\n`;
  return code;
};

pythonGenerator['data_listcontents'] = function (block) {
  const listName =
    this.variableDB_.getName(block.getFieldValue('LIST'), ScratchBlocks.Variables.NAME_TYPE) +
    '_' +
    ScratchBlocks.LIST_VARIABLE_TYPE;
  return [listName, this.ORDER_ATOMIC];
};

pythonGenerator['data_addtolist'] = function (block) {
  let code = '';
  if (this.STATEMENT_PREFIX) {
    code += this.injectId(this.STATEMENT_PREFIX, block);
  }

  const listName =
    this.variableDB_.getName(block.getFieldValue('LIST'), ScratchBlocks.Variables.NAME_TYPE) +
    '_' +
    ScratchBlocks.LIST_VARIABLE_TYPE;
  const itemValue = this.valueToCode(block, 'ITEM', this.ORDER_NONE) || '""';
  code += `${listName}.append(${itemValue})\n`;
  return code;
};

pythonGenerator['data_deleteoflist'] = function (block) {
  let code = '';
  if (this.STATEMENT_PREFIX) {
    code += this.injectId(this.STATEMENT_PREFIX, block);
  }

  const listName =
    this.variableDB_.getName(block.getFieldValue('LIST'), ScratchBlocks.Variables.NAME_TYPE) +
    '_' +
    ScratchBlocks.LIST_VARIABLE_TYPE;
  const indexCode = this.valueToCode(block, 'INDEX', this.ORDER_NONE) || 1;
  code += `${listName}.remove(runtime.index(${indexCode}, len(${listName})))\n`;
  return code;
};

pythonGenerator['data_deletealloflist'] = function (block) {
  let code = '';
  if (this.STATEMENT_PREFIX) {
    code += this.injectId(this.STATEMENT_PREFIX, block);
  }

  const listName =
    this.variableDB_.getName(block.getFieldValue('LIST'), ScratchBlocks.Variables.NAME_TYPE) +
    '_' +
    ScratchBlocks.LIST_VARIABLE_TYPE;
  code += `${listName} = []\n`;
  return code;
};

pythonGenerator['data_insertatlist'] = function (block) {
  let code = '';
  if (this.STATEMENT_PREFIX) {
    code += this.injectId(this.STATEMENT_PREFIX, block);
  }

  const listName =
    this.variableDB_.getName(block.getFieldValue('LIST'), ScratchBlocks.Variables.NAME_TYPE) +
    '_' +
    ScratchBlocks.LIST_VARIABLE_TYPE;
  const indexCode = this.valueToCode(block, 'INDEX', this.ORDER_NONE) || 1;
  const itemValue = this.valueToCode(block, 'ITEM', this.ORDER_NONE) || '""';
  code += `${listName}.insert(runtime.index(${indexCode}, len(${listName})), ${itemValue})\n`;
  return code;
};

pythonGenerator['data_replaceitemoflist'] = function (block) {
  let code = '';
  if (this.STATEMENT_PREFIX) {
    code += this.injectId(this.STATEMENT_PREFIX, block);
  }

  const listName =
    this.variableDB_.getName(block.getFieldValue('LIST'), ScratchBlocks.Variables.NAME_TYPE) +
    '_' +
    ScratchBlocks.LIST_VARIABLE_TYPE;
  const indexCode = this.valueToCode(block, 'INDEX', this.ORDER_NONE) || 1;
  const itemValue = this.valueToCode(block, 'ITEM', this.ORDER_NONE) || '""';
  code += `${listName}[runtime.index(${indexCode}, len(${listName}))] = ${itemValue}\n`;
  return code;
};

pythonGenerator['data_itemoflist'] = function (block) {
  const listName =
    this.variableDB_.getName(block.getFieldValue('LIST'), ScratchBlocks.Variables.NAME_TYPE) +
    '_' +
    ScratchBlocks.LIST_VARIABLE_TYPE;
  const indexCode = this.valueToCode(block, 'INDEX', this.ORDER_NONE) || 1;
  const code = `${listName}[runtime.index(${indexCode}, len(${listName}))]`;
  return [code, this.ORDER_CONDITIONAL];
};

pythonGenerator['data_itemnumoflist'] = function (block) {
  const listName =
    this.variableDB_.getName(block.getFieldValue('LIST'), ScratchBlocks.Variables.NAME_TYPE) +
    '_' +
    ScratchBlocks.LIST_VARIABLE_TYPE;
  const itemValue = this.valueToCode(block, 'ITEM', this.ORDER_NONE) || 0;
  return [`(${listName}.index(${itemValue}) + 1)`, this.ORDER_NONE];
};

pythonGenerator['data_lengthoflist'] = function (block) {
  const listName =
    this.variableDB_.getName(block.getFieldValue('LIST'), ScratchBlocks.Variables.NAME_TYPE) +
    '_' +
    ScratchBlocks.LIST_VARIABLE_TYPE;
  return [`len(${listName})`, this.ORDER_FUNCTION_CALL];
};

pythonGenerator['data_listcontainsitem'] = function (block) {
  const listName =
    this.variableDB_.getName(block.getFieldValue('LIST'), ScratchBlocks.Variables.NAME_TYPE) +
    '_' +
    ScratchBlocks.LIST_VARIABLE_TYPE;
  const itemValue = this.valueToCode(block, 'ITEM', this.ORDER_NONE) || 0;
  return [`bool(${listName}.count(${itemValue}))`, this.ORDER_FUNCTION_CALL];
};
