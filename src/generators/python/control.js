import { pythonGenerator } from './generator';

const NEXT_LOOP = '  await runtime.next_frame()\n';

pythonGenerator['control_wait'] = (block) => {
  let code = '';
  if (pythonGenerator.STATEMENT_PREFIX) {
    code += pythonGenerator.injectId(pythonGenerator.STATEMENT_PREFIX, block);
  }
  const durationCode = pythonGenerator.valueToCode(block, 'DURATION', pythonGenerator.ORDER_NONE) || 0;
  code += `await runtime.wait_for(num(${durationCode}))\n`;
  return code;
};

pythonGenerator['control_repeat'] = (block) => {
  let code = '';
  if (pythonGenerator.STATEMENT_PREFIX) {
    code += pythonGenerator.injectId(pythonGenerator.STATEMENT_PREFIX, block);
  }

  let branchCode = pythonGenerator.statementToCode(block, 'SUBSTACK') || pythonGenerator.PASS;
  if (pythonGenerator.STATEMENT_SUFFIX) {
    branchCode =
      pythonGenerator.prefixLines(
        pythonGenerator.injectId(pythonGenerator.STATEMENT_SUFFIX, block),
        pythonGenerator.INDENT,
      ) + branchCode;
  }

  const timesCode = pythonGenerator.valueToCode(block, 'TIMES', pythonGenerator.ORDER_NONE) || 10;
  code += `for _ in range(num(${timesCode})):\n${branchCode}${NEXT_LOOP}`;
  return code;
};

pythonGenerator['control_forever'] = (block) => {
  let code = '';
  if (pythonGenerator.STATEMENT_PREFIX) {
    code += pythonGenerator.injectId(pythonGenerator.STATEMENT_PREFIX, block);
  }

  let branchCode = pythonGenerator.statementToCode(block, 'SUBSTACK') || pythonGenerator.PASS;
  if (pythonGenerator.STATEMENT_SUFFIX) {
    branchCode =
      pythonGenerator.prefixLines(
        pythonGenerator.injectId(pythonGenerator.STATEMENT_SUFFIX, block),
        pythonGenerator.INDENT,
      ) + branchCode;
  }

  code += `while True:\n${branchCode}${NEXT_LOOP}`;
  return code;
};

pythonGenerator['control_if'] = (block) => {
  let code = '';
  if (pythonGenerator.STATEMENT_PREFIX) {
    code += pythonGenerator.injectId(pythonGenerator.STATEMENT_PREFIX, block);
  }

  let branchCode = pythonGenerator.statementToCode(block, 'SUBSTACK') || pythonGenerator.PASS;
  if (pythonGenerator.STATEMENT_SUFFIX) {
    branchCode =
      pythonGenerator.prefixLines(
        pythonGenerator.injectId(pythonGenerator.STATEMENT_SUFFIX, block),
        pythonGenerator.INDENT,
      ) + branchCode;
  }

  const conditionCode = pythonGenerator.valueToCode(block, 'CONDITION', pythonGenerator.ORDER_NONE) || 'False';
  code += `if ${conditionCode}:\n${branchCode}`;

  // else branch.
  if (block.getInput('SUBSTACK2')) {
    branchCode = pythonGenerator.statementToCode(block, 'SUBSTACK2') || pythonGenerator.PASS;
    if (pythonGenerator.STATEMENT_SUFFIX) {
      branchCode =
        pythonGenerator.prefixLines(
          pythonGenerator.injectId(pythonGenerator.STATEMENT_SUFFIX, block),
          pythonGenerator.INDENT,
        ) + branchCode;
    }
    code += `else:\n${branchCode}`;
  }
  return code;
};

pythonGenerator['control_if_else'] = pythonGenerator['control_if'];

pythonGenerator['control_wait_until'] = (block) => {
  let code = '';
  if (pythonGenerator.STATEMENT_PREFIX) {
    code += pythonGenerator.injectId(pythonGenerator.STATEMENT_PREFIX, block);
  }

  const conditionCode = pythonGenerator.valueToCode(block, 'CONDITION', pythonGenerator.ORDER_NONE) || 'False';
  code += `while not ${conditionCode}:\n${NEXT_LOOP}`;
  return code;
};

pythonGenerator['control_repeat_until'] = (block) => {
  let code = '';
  if (pythonGenerator.STATEMENT_PREFIX) {
    code += pythonGenerator.injectId(pythonGenerator.STATEMENT_PREFIX, block);
  }

  let branchCode = pythonGenerator.statementToCode(block, 'SUBSTACK') || pythonGenerator.PASS;
  if (pythonGenerator.STATEMENT_SUFFIX) {
    branchCode =
      pythonGenerator.prefixLines(
        pythonGenerator.injectId(pythonGenerator.STATEMENT_SUFFIX, block),
        pythonGenerator.INDENT,
      ) + branchCode;
  }

  const conditionCode = pythonGenerator.valueToCode(block, 'CONDITION', pythonGenerator.ORDER_NONE) || 'False';
  code += `while not ${conditionCode}:\n${branchCode}${NEXT_LOOP}`;
  return code;
};

pythonGenerator['control_while'] = (block) => {
  let code = '';
  if (pythonGenerator.STATEMENT_PREFIX) {
    code += pythonGenerator.injectId(pythonGenerator.STATEMENT_PREFIX, block);
  }

  let branchCode = pythonGenerator.statementToCode(block, 'SUBSTACK') || pythonGenerator.PASS;
  if (pythonGenerator.STATEMENT_SUFFIX) {
    branchCode =
      pythonGenerator.prefixLines(
        pythonGenerator.injectId(pythonGenerator.STATEMENT_SUFFIX, block),
        pythonGenerator.INDENT,
      ) + branchCode;
  }

  const conditionCode = pythonGenerator.valueToCode(block, 'CONDITION', pythonGenerator.ORDER_NONE) || 'False';
  code += `while ${conditionCode}:\n${branchCode}${NEXT_LOOP}`;
  return code;
};

pythonGenerator['control_stop'] = (block) => {
  let code = '';
  if (pythonGenerator.STATEMENT_PREFIX) {
    code += pythonGenerator.injectId(pythonGenerator.STATEMENT_PREFIX, block);
  }

  const stopValue = block.getFieldValue('STOP_OPTION');
  switch (stopValue) {
    case 'all':
      code += 'runtime.stop()\n';
      break;
    case 'this script':
      code += 'return\n';
      break;
    case 'other scripts in sprite':
      code += 'runtime.stop_tasks(this_func)\n';
      break;
  }
  return code;
};
