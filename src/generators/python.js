import './python/color';
import './python/control';
import './python/data';
import './python/event';
import './python/math';
import './python/operators';
import './python/procedures';
import './python/sensing';
import './python/text';

import { PythonGenerator } from './python/generator';

class DefaultPythonGenerator extends PythonGenerator {
  init(workspace) {
    super.init(workspace);
    this.definitions_['import_blocks'] = 'from blocks import *';
  }
}

export { PythonGenerator, DefaultPythonGenerator };
