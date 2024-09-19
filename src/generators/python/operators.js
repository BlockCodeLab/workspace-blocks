import { pythonGenerator } from './generator';

pythonGenerator['operator_add'] = (block) => {
  const num1Code = pythonGenerator.valueToCode(block, 'NUM1', pythonGenerator.ORDER_NONE) || 0;
  const num2Code = pythonGenerator.valueToCode(block, 'NUM2', pythonGenerator.ORDER_NONE) || 0;
  const code = `(num(${num1Code}) + num(${num2Code}))`;
  return [code, pythonGenerator.ORDER_SUBTRACTION];
};

pythonGenerator['operator_subtract'] = (block) => {
  const num1Code = pythonGenerator.valueToCode(block, 'NUM1', pythonGenerator.ORDER_NONE) || 0;
  const num2Code = pythonGenerator.valueToCode(block, 'NUM2', pythonGenerator.ORDER_NONE) || 0;
  const code = `(num(${num1Code}) - num(${num2Code}))`;
  return [code, pythonGenerator.ORDER_SUBTRACTION];
};

pythonGenerator['operator_multiply'] = (block) => {
  const num1Code = pythonGenerator.valueToCode(block, 'NUM1', pythonGenerator.ORDER_NONE) || 0;
  const num2Code = pythonGenerator.valueToCode(block, 'NUM2', pythonGenerator.ORDER_NONE) || 0;
  const code = `(num(${num1Code}) * num(${num2Code}))`;
  return [code, pythonGenerator.ORDER_SUBTRACTION];
};

pythonGenerator['operator_divide'] = (block) => {
  const num1Code = pythonGenerator.valueToCode(block, 'NUM1', pythonGenerator.ORDER_NONE) || 0;
  const num2Code = pythonGenerator.valueToCode(block, 'NUM2', pythonGenerator.ORDER_NONE) || 0;
  const code = `(num(${num1Code}) / num(${num2Code}))`;
  return [code, pythonGenerator.ORDER_SUBTRACTION];
};

pythonGenerator['operator_random'] = (block) => {
  const minCode = pythonGenerator.valueToCode(block, 'FROM', pythonGenerator.ORDER_NONE) || 0;
  const maxCode = pythonGenerator.valueToCode(block, 'TO', pythonGenerator.ORDER_NONE) || 0;
  const code = `runtime.random(${minCode}, ${maxCode})`;
  return [code, pythonGenerator.ORDER_FUNCTION_CALL];
};

pythonGenerator['operator_gt'] = (block) => {
  // >
  const operand1Code = pythonGenerator.valueToCode(block, 'OPERAND1', pythonGenerator.ORDER_NONE) || 0;
  const operand2Code = pythonGenerator.valueToCode(block, 'OPERAND2', pythonGenerator.ORDER_NONE) || 0;
  const code = `(num(${operand1Code}) > num(${operand2Code}))`;
  return [code, pythonGenerator.ORDER_RELATIONAL];
};

pythonGenerator['operator_lt'] = (block) => {
  // <
  const operand1Code = pythonGenerator.valueToCode(block, 'OPERAND1', pythonGenerator.ORDER_NONE) || 0;
  const operand2Code = pythonGenerator.valueToCode(block, 'OPERAND2', pythonGenerator.ORDER_NONE) || 0;
  const code = `(num(${operand1Code}) < num(${operand2Code}))`;
  return [code, pythonGenerator.ORDER_RELATIONAL];
};

pythonGenerator['operator_equals'] = (block) => {
  const operand1Code = pythonGenerator.valueToCode(block, 'OPERAND1', pythonGenerator.ORDER_NONE) || 0;
  const operand2Code = pythonGenerator.valueToCode(block, 'OPERAND2', pythonGenerator.ORDER_NONE) || 0;
  const code = `equals(${operand1Code}, ${operand2Code})`;
  return [code, pythonGenerator.ORDER_FUNCTION_CALL];
};

pythonGenerator['operator_and'] = (block) => {
  const operand1Code = pythonGenerator.valueToCode(block, 'OPERAND1', pythonGenerator.ORDER_NONE) || 'False';
  const operand2Code = pythonGenerator.valueToCode(block, 'OPERAND2', pythonGenerator.ORDER_NONE) || 'False';
  const code = `(${operand1Code} and ${operand2Code})`;
  return [code, pythonGenerator.ORDER_LOGICAL_AND];
};

pythonGenerator['operator_or'] = (block) => {
  const operand1Code = pythonGenerator.valueToCode(block, 'OPERAND1', pythonGenerator.ORDER_NONE) || 'False';
  const operand2Code = pythonGenerator.valueToCode(block, 'OPERAND2', pythonGenerator.ORDER_NONE) || 'False';
  const code = `(${operand1Code} or ${operand2Code})`;
  return [code, pythonGenerator.ORDER_LOGICAL_OR];
};

pythonGenerator['operator_not'] = (block) => {
  const operandValue = pythonGenerator.valueToCode(block, 'OPERAND', pythonGenerator.ORDER_NONE) || 'False';
  const code = `(not ${operandValue})`;
  return [code, pythonGenerator.ORDER_LOGICAL_NOT];
};

pythonGenerator['operator_join'] = (block) => {
  const string1Code = pythonGenerator.valueToCode(block, 'STRING1', pythonGenerator.ORDER_NONE) || '""';
  const string2Code = pythonGenerator.valueToCode(block, 'STRING2', pythonGenerator.ORDER_NONE) || '""';
  const code = `(str(${string1Code}) + str(${string2Code}))`;
  return [code, pythonGenerator.ORDER_ATOMIC];
};

pythonGenerator['operator_letter_of'] = (block) => {
  const letterValue = pythonGenerator.valueToCode(block, 'LETTER', pythonGenerator.ORDER_NONE) || 0;
  const stringValue = pythonGenerator.valueToCode(block, 'STRING', pythonGenerator.ORDER_NONE) || '""';
  const code = `(str(${stringValue})[num(${letterValue}) - 1] || "")`;
  return [code, pythonGenerator.ORDER_MEMBER];
};

pythonGenerator['operator_length'] = (block) => {
  const stringValue = pythonGenerator.valueToCode(block, 'STRING', pythonGenerator.ORDER_NONE) || '""';
  const code = `len(str(${stringValue}))`;
  return [code, pythonGenerator.ORDER_FUNCTION_CALL];
};

pythonGenerator['operator_contains'] = (block) => {
  const string1Code = pythonGenerator.valueToCode(block, 'STRING1', pythonGenerator.ORDER_NONE) || '""';
  const string2Code = pythonGenerator.valueToCode(block, 'STRING2', pythonGenerator.ORDER_NONE) || '""';
  const code = `(str(${string1Code}).count(str(${string2Code})) > 0)`;
  return [code, pythonGenerator.ORDER_FUNCTION_CALL];
};

pythonGenerator['operator_mod'] = (block) => {
  const num1Code = pythonGenerator.valueToCode(block, 'NUM1', pythonGenerator.ORDER_NONE) || 0;
  const num2Code = pythonGenerator.valueToCode(block, 'NUM2', pythonGenerator.ORDER_NONE) || 0;
  const code = `(num(${num1Code}) % num(${num2Code}))`;
  return [code, pythonGenerator.ORDER_MODULUS];
};

pythonGenerator['operator_round'] = (block) => {
  pythonGenerator.definitions_['import_math'] = 'import math';
  const numCode = pythonGenerator.valueToCode(block, 'NUM', pythonGenerator.ORDER_NONE) || 0;
  const code = `math.round(num(${numCode}))`;
  return [code, pythonGenerator.ORDER_FUNCTION_CALL];
};

pythonGenerator['operator_mathop'] = (block) => {
  pythonGenerator.definitions_['import_math'] = 'import math';
  const numCode = pythonGenerator.valueToCode(block, 'NUM', pythonGenerator.ORDER_NONE) || 0;
  const operatorValue = block.getFieldValue('OPERATOR');
  let code = '';
  if (operatorValue === 'ceiling') {
    code += `math.ceil(num(${numCode}))`;
  } else if (operatorValue === 'sin' || operatorValue === 'cos' || operatorValue === 'tan') {
    code += `math.${operatorValue}(math.radians(num(${numCode})))`;
  } else if (operatorValue === 'asin' || operatorValue === 'acos' || operatorValue === 'atan') {
    code += `math.degrees(math.${operatorValue}(num(${numCode})))`;
  } else if (operatorValue === 'ln') {
    code += `(math.log(num(${numCode}))`;
  } else if (operatorValue === 'log') {
    code += `(math.log10(num(${numCode}))`;
  } else if (operatorValue === 'e ^') {
    code += `math.exp(num(${numCode}))`;
  } else if (operatorValue === '10 ^') {
    code += `math.pow(10, num(${numCode}))`;
  } else {
    code += `math.${operatorValue}(num(${numCode}))`;
  }
  return [code, pythonGenerator.ORDER_FUNCTION_CALL];
};
