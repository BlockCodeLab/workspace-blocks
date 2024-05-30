import { ScratchBlocks } from '@blockcode/blocks-editor';
import { pythonGenerator } from './generator';

pythonGenerator['data_variable'] = (block) => {
  const varName = pythonGenerator.variableDB_.getName(
    block.getFieldValue('VARIABLE'),
    ScratchBlocks.Variables.NAME_TYPE,
  );
  return [varName, pythonGenerator.ORDER_ATOMIC];
};

pythonGenerator['data_setvariableto'] = (block) => {
  let code = '';
  if (javascriptGenerator.STATEMENT_PREFIX) {
    code += javascriptGenerator.injectId(javascriptGenerator.STATEMENT_PREFIX, block);
  }

  const varName = pythonGenerator.variableDB_.getName(
    block.getFieldValue('VARIABLE'),
    ScratchBlocks.Variables.NAME_TYPE,
  );
  const valueCode = pythonGenerator.valueToCode(block, 'VALUE', pythonGenerator.ORDER_NONE) || '""';
  code += `${varName} = ${valueCode}\n`;
  return code;
};

pythonGenerator['data_changevariableby'] = (block) => {
  let code = '';
  if (javascriptGenerator.STATEMENT_PREFIX) {
    code += javascriptGenerator.injectId(javascriptGenerator.STATEMENT_PREFIX, block);
  }

  const varName = pythonGenerator.variableDB_.getName(
    block.getFieldValue('VARIABLE'),
    ScratchBlocks.Variables.NAME_TYPE,
  );
  const valueCode = pythonGenerator.valueToCode(block, 'VALUE', pythonGenerator.ORDER_NONE) || 0;
  code += `${varName} = num(${varName}) + num(${valueCode})\n`;
  return code;
};

pythonGenerator['data_listcontents'] = (block) => {
  const listName =
    pythonGenerator.variableDB_.getName(block.getFieldValue('LIST'), ScratchBlocks.Variables.NAME_TYPE) +
    '_' +
    ScratchBlocks.LIST_VARIABLE_TYPE;
  return [listName, pythonGenerator.ORDER_ATOMIC];
};

pythonGenerator['data_addtolist'] = (block) => {
  let code = '';
  if (pythonGenerator.STATEMENT_PREFIX) {
    code += pythonGenerator.injectId(pythonGenerator.STATEMENT_PREFIX, block);
  }

  const listName =
    pythonGenerator.variableDB_.getName(block.getFieldValue('LIST'), ScratchBlocks.Variables.NAME_TYPE) +
    '_' +
    ScratchBlocks.LIST_VARIABLE_TYPE;
  const itemValue = pythonGenerator.valueToCode(block, 'ITEM', pythonGenerator.ORDER_NONE) || '""';
  code += `${listName}.append(${itemValue})\n`;
  return code;
};

pythonGenerator['data_deleteoflist'] = (block) => {
  let code = '';
  if (pythonGenerator.STATEMENT_PREFIX) {
    code += pythonGenerator.injectId(pythonGenerator.STATEMENT_PREFIX, block);
  }

  const listName =
    pythonGenerator.variableDB_.getName(block.getFieldValue('LIST'), ScratchBlocks.Variables.NAME_TYPE) +
    '_' +
    ScratchBlocks.LIST_VARIABLE_TYPE;
  const indexCode = pythonGenerator.valueToCode(block, 'INDEX', pythonGenerator.ORDER_NONE) || 1;
  code += `${listName}.remove(runtime.index(${indexCode}, len(${listName})))\n`;
  return code;
};

pythonGenerator['data_deletealloflist'] = (block) => {
  let code = '';
  if (pythonGenerator.STATEMENT_PREFIX) {
    code += pythonGenerator.injectId(pythonGenerator.STATEMENT_PREFIX, block);
  }

  const listName =
    pythonGenerator.variableDB_.getName(block.getFieldValue('LIST'), ScratchBlocks.Variables.NAME_TYPE) +
    '_' +
    ScratchBlocks.LIST_VARIABLE_TYPE;
  code += `${listName} = []\n`;
  return code;
};

pythonGenerator['data_insertatlist'] = (block) => {
  let code = '';
  if (pythonGenerator.STATEMENT_PREFIX) {
    code += pythonGenerator.injectId(pythonGenerator.STATEMENT_PREFIX, block);
  }

  const listName =
    pythonGenerator.variableDB_.getName(block.getFieldValue('LIST'), ScratchBlocks.Variables.NAME_TYPE) +
    '_' +
    ScratchBlocks.LIST_VARIABLE_TYPE;
  const indexCode = pythonGenerator.valueToCode(block, 'INDEX', pythonGenerator.ORDER_NONE) || 1;
  const itemValue = pythonGenerator.valueToCode(block, 'ITEM', pythonGenerator.ORDER_NONE) || '""';
  code += `${listName}.insert(runtime.index(${indexCode}, len(${listName})), ${itemValue})\n`;
  return code;
};

pythonGenerator['data_replaceitemoflist'] = (block) => {
  let code = '';
  if (pythonGenerator.STATEMENT_PREFIX) {
    code += pythonGenerator.injectId(pythonGenerator.STATEMENT_PREFIX, block);
  }

  const listName =
    pythonGenerator.variableDB_.getName(block.getFieldValue('LIST'), ScratchBlocks.Variables.NAME_TYPE) +
    '_' +
    ScratchBlocks.LIST_VARIABLE_TYPE;
  const indexCode = pythonGenerator.valueToCode(block, 'INDEX', pythonGenerator.ORDER_NONE) || 1;
  const itemValue = pythonGenerator.valueToCode(block, 'ITEM', pythonGenerator.ORDER_NONE) || '""';
  code += `${listName}[runtime.index(${indexCode}, len(${listName}))] = ${itemValue}\n`;
  return code;
};

pythonGenerator['data_itemoflist'] = (block) => {
  const listName =
    pythonGenerator.variableDB_.getName(block.getFieldValue('LIST'), ScratchBlocks.Variables.NAME_TYPE) +
    '_' +
    ScratchBlocks.LIST_VARIABLE_TYPE;
  const indexCode = pythonGenerator.valueToCode(block, 'INDEX', pythonGenerator.ORDER_NONE) || 1;
  const code = `${listName}[runtime.index(${indexCode}, len(${listName}))]`;
  return [code, pythonGenerator.ORDER_CONDITIONAL];
};

pythonGenerator['data_itemnumoflist'] = (block) => {
  const listName =
    pythonGenerator.variableDB_.getName(block.getFieldValue('LIST'), ScratchBlocks.Variables.NAME_TYPE) +
    '_' +
    ScratchBlocks.LIST_VARIABLE_TYPE;
  const itemValue = pythonGenerator.valueToCode(block, 'ITEM', pythonGenerator.ORDER_NONE) || 0;
  return [`(${listName}.index(${itemValue}) + 1)`, pythonGenerator.ORDER_NONE];
};

pythonGenerator['data_lengthoflist'] = (block) => {
  const listName =
    pythonGenerator.variableDB_.getName(block.getFieldValue('LIST'), ScratchBlocks.Variables.NAME_TYPE) +
    '_' +
    ScratchBlocks.LIST_VARIABLE_TYPE;
  return [`len(${listName})`, pythonGenerator.ORDER_FUNCTION_CALL];
};

pythonGenerator['data_listcontainsitem'] = (block) => {
  const listName =
    pythonGenerator.variableDB_.getName(block.getFieldValue('LIST'), ScratchBlocks.Variables.NAME_TYPE) +
    '_' +
    ScratchBlocks.LIST_VARIABLE_TYPE;
  const itemValue = pythonGenerator.valueToCode(block, 'ITEM', pythonGenerator.ORDER_NONE) || 0;
  return [`bool(${listName}.count(${itemValue}))`, pythonGenerator.ORDER_FUNCTION_CALL];
};
