import { pythonGenerator } from './generator';

const NEXT_LOOP = '  await runtime.next_frame()\n';

pythonGenerator['control_wait'] = function (block) {
  let code = '';
  if (this.STATEMENT_PREFIX) {
    code += this.injectId(this.STATEMENT_PREFIX, block);
  }
  const durationCode = this.valueToCode(block, 'DURATION', this.ORDER_NONE) || 0;
  code += `await runtime.wait_for(num(${durationCode}))\n`;
  return code;
};

pythonGenerator['control_repeat'] = function (block) {
  let code = '';
  if (this.STATEMENT_PREFIX) {
    code += this.injectId(this.STATEMENT_PREFIX, block);
  }

  let branchCode = this.statementToCode(block, 'SUBSTACK') || this.PASS;
  if (this.STATEMENT_SUFFIX) {
    branchCode = this.prefixLines(this.injectId(this.STATEMENT_SUFFIX, block), this.INDENT) + branchCode;
  }

  const timesCode = this.valueToCode(block, 'TIMES', this.ORDER_NONE) || 10;
  code += `for _ in range(num(${timesCode})):\n${branchCode}${NEXT_LOOP}`;
  return code;
};

pythonGenerator['control_forever'] = function (block) {
  let code = '';
  if (this.STATEMENT_PREFIX) {
    code += this.injectId(this.STATEMENT_PREFIX, block);
  }

  let branchCode = this.statementToCode(block, 'SUBSTACK') || this.PASS;
  if (this.STATEMENT_SUFFIX) {
    branchCode = this.prefixLines(this.injectId(this.STATEMENT_SUFFIX, block), this.INDENT) + branchCode;
  }

  code += `while True:\n${branchCode}${NEXT_LOOP}`;
  return code;
};

pythonGenerator['control_if'] = function (block) {
  let code = '';
  if (this.STATEMENT_PREFIX) {
    code += this.injectId(this.STATEMENT_PREFIX, block);
  }

  let branchCode = this.statementToCode(block, 'SUBSTACK') || this.PASS;
  if (this.STATEMENT_SUFFIX) {
    branchCode = this.prefixLines(this.injectId(this.STATEMENT_SUFFIX, block), this.INDENT) + branchCode;
  }

  const conditionCode = this.valueToCode(block, 'CONDITION', this.ORDER_NONE) || 'False';
  code += `if ${conditionCode}:\n${branchCode}`;

  // else branch.
  if (block.getInput('SUBSTACK2')) {
    branchCode = this.statementToCode(block, 'SUBSTACK2') || this.PASS;
    if (this.STATEMENT_SUFFIX) {
      branchCode = this.prefixLines(this.injectId(this.STATEMENT_SUFFIX, block), this.INDENT) + branchCode;
    }
    code += `else:\n${branchCode}`;
  }
  return code;
};

pythonGenerator['control_if_else'] = pythonGenerator['control_if'];

pythonGenerator['control_wait_until'] = function (block) {
  let code = '';
  if (this.STATEMENT_PREFIX) {
    code += this.injectId(this.STATEMENT_PREFIX, block);
  }

  const conditionCode = this.valueToCode(block, 'CONDITION', this.ORDER_NONE) || 'False';
  code += `while not ${conditionCode}:\n${NEXT_LOOP}`;
  return code;
};

pythonGenerator['control_repeat_until'] = function (block) {
  let code = '';
  if (this.STATEMENT_PREFIX) {
    code += this.injectId(this.STATEMENT_PREFIX, block);
  }

  let branchCode = this.statementToCode(block, 'SUBSTACK') || this.PASS;
  if (this.STATEMENT_SUFFIX) {
    branchCode = this.prefixLines(this.injectId(this.STATEMENT_SUFFIX, block), this.INDENT) + branchCode;
  }

  const conditionCode = this.valueToCode(block, 'CONDITION', this.ORDER_NONE) || 'False';
  code += `while not ${conditionCode}:\n${branchCode}${NEXT_LOOP}`;
  return code;
};

pythonGenerator['control_while'] = function (block) {
  let code = '';
  if (this.STATEMENT_PREFIX) {
    code += this.injectId(this.STATEMENT_PREFIX, block);
  }

  let branchCode = this.statementToCode(block, 'SUBSTACK') || this.PASS;
  if (this.STATEMENT_SUFFIX) {
    branchCode = this.prefixLines(this.injectId(this.STATEMENT_SUFFIX, block), this.INDENT) + branchCode;
  }

  const conditionCode = this.valueToCode(block, 'CONDITION', this.ORDER_NONE) || 'False';
  code += `while ${conditionCode}:\n${branchCode}${NEXT_LOOP}`;
  return code;
};

pythonGenerator['control_stop'] = function (block) {
  let code = '';
  if (this.STATEMENT_PREFIX) {
    code += this.injectId(this.STATEMENT_PREFIX, block);
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
