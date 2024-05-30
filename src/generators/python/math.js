import { pythonGenerator } from './generator';

// If any new block imports any library, add that library name here.
pythonGenerator.addReservedWords('math,random,Number');

pythonGenerator['math_number'] = (block) => {
  let code = parseFloat(block.getFieldValue('NUM'));
  let order;
  if (code === Infinity) {
    code = 'float("inf")';
    order = pythonGenerator.ORDER_FUNCTION_CALL;
  } else if (code === -Infinity) {
    code = '-float("inf")';
    order = pythonGenerator.ORDER_UNARY_SIGN;
  } else if (Number.isNaN(code)) {
    code = 'float("nan")';
    order = pythonGenerator.ORDER_UNARY_SIGN;
  } else {
    order = code < 0 ? pythonGenerator.ORDER_UNARY_SIGN : pythonGenerator.ORDER_ATOMIC;
  }
  return [code, order];
};

pythonGenerator['math_integer'] = (block) => {
  const code = parseInt(block.getFieldValue('NUM'));
  const order = code < 0 ? pythonGenerator.ORDER_UNARY_SIGN : pythonGenerator.ORDER_ATOMIC;
  return [code, order];
};

pythonGenerator['math_whole_number'] = (block) => {
  const code = Math.abs(parseInt(block.getFieldValue('NUM')));
  return [code, pythonGenerator.ORDER_ATOMIC];
};

pythonGenerator['math_positive_number'] = (block) => {
  let code = parseFloat(block.getFieldValue('NUM'));
  let order;
  if (code === Infinity) {
    code = 'float("inf")';
    order = pythonGenerator.ORDER_FUNCTION_CALL;
  } else if (code === -Infinity) {
    code = '-float("inf")';
    order = pythonGenerator.ORDER_FUNCTION_CALL;
  } else if (Number.isNaN(code)) {
    code = 'float("nan")';
    order = pythonGenerator.ORDER_FUNCTION_CALL;
  } else {
    code = code < 0 ? 0 : code;
    order = pythonGenerator.ORDER_ATOMIC;
  }
  return [code, order];
};

pythonGenerator['math_angle'] = (block) => {
  let code = parseFloat(block.getFieldValue('NUM'));
  let order;
  if (code == Infinity) {
    code = 'float("inf")';
    order = pythonGenerator.ORDER_FUNCTION_CALL;
  } else if (code == -Infinity) {
    code = '-float("inf")';
    order = pythonGenerator.ORDER_UNARY_SIGN;
  } else {
    code = code % 360;
    code = code < 0 ? code + 360 : code;
    order = pythonGenerator.ORDER_ATOMIC;
  }
  return [code, order];
};
