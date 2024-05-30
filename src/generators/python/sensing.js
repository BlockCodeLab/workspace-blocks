import { pythonGenerator } from './generator';

pythonGenerator['sensing_timer'] = () => {
  return ['runtime.time', pythonGenerator.ORDER_MEMBER];
};

pythonGenerator['sensing_resettimer'] = () => {
  return 'runtime.reset_timer()\n';
};
