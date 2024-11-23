import { pythonGenerator } from './generator';

pythonGenerator['sensing_timer'] = function () {
  return ['runtime.time', this.ORDER_MEMBER];
};

pythonGenerator['sensing_resettimer'] = function () {
  return 'runtime.reset_timer()\n';
};

pythonGenerator['sensing_debug'] = function (block) {
  const valueCode = this.valueToCode(block, 'VALUE', this.ORDER_NONE) || '"debug"';
  return `print(${valueCode})\n`;
};
