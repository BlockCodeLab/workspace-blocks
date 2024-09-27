import { ScratchBlocks, blockSeparator } from '@blockcode/blocks-editor';

const OUTPUT_SHAPE_HEXAGONAL = 1;
const OUTPUT_SHAPE_ROUND = 2;
const OUTPUT_SHAPE_SQUARE = 3;
const THEME_COLOR = '#0FBD8C';
const INPUT_COLOR = '#0DA57A';
const OTHER_COLOR = '#0B8E69';

const xmlEscape = (unsafe) => {
  if (typeof unsafe !== 'string') {
    if (Array.isArray(unsafe)) {
      unsafe = String(unsafe);
    } else {
      return unsafe;
    }
  }
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '&':
        return '&amp;';
      case "'":
        return '&apos;';
      case '"':
        return '&quot;';
    }
  });
};

const ShadowTypes = {
  number: 'math_number',
  angle: 'math_angle',
  text: 'text',
  string: 'text',
  color: 'colour_picker',
  matrix: 'matrix',
  note: 'note',
};

const FieldTypes = {
  number: 'NUM',
  angle: 'NUM',
  text: 'TEXT',
  string: 'TEXT',
  matrix: 'MATRIX',
  note: 'NOTE',
};

export default function (pythonGenerator, extensionObject, isStage, maybeLocaleText, buttonWrapper) {
  const { id: extensionId } = extensionObject;

  const extensionName = maybeLocaleText(extensionObject.name);

  let categoryXML = `<category name="${xmlEscape(extensionName)}" id="${xmlEscape(extensionId)}"`;
  categoryXML += ` colour="${xmlEscape(extensionObject.themeColor || THEME_COLOR)}"`;
  categoryXML += ` secondaryColour="${xmlEscape(extensionObject.inputColor || INPUT_COLOR)}"`;
  if (extensionObject.connectionConfig) {
    categoryXML += ` showStatusButton="true"`;
  }
  if (extensionObject.iconURI) {
    categoryXML += ` iconURI="${xmlEscape(extensionObject.iconURI)}"`;
  }
  categoryXML += `>`;

  extensionObject.blocks.forEach((block) => {
    if (block === '---') {
      categoryXML += `${blockSeparator}`;
      return;
    }

    if (block.button) {
      categoryXML += `<button text="${maybeLocaleText(block.text)}" callbackKey="${block.button}"></button>`;
      const workspace = ScratchBlocks.getMainWorkspace();
      if (workspace) {
        const flyout = workspace.getFlyout();
        if (flyout) {
          const toolboxWorkspace = flyout.getWorkspace();
          if (toolboxWorkspace) {
            toolboxWorkspace.registerButtonCallback(block.button, buttonWrapper(block.onClick));
          }
        }
      }
      return;
    }

    // the block only for sprite
    if (isStage && block.useStage === false) return;
    // the block only for stage
    if (!isStage && block.useSprite === false) return;

    const blockId = `${extensionId}_${block.id.toLowerCase()}`;
    const blockJson = {
      message0: maybeLocaleText(block.text),
      category: extensionId,
      outputShape: OUTPUT_SHAPE_SQUARE,
      colour: extensionObject.themeColor || THEME_COLOR,
      colourSecondary: extensionObject.inputColor || INPUT_COLOR,
      colourTertiary: extensionObject.otherColor || OTHER_COLOR,
    };

    let argsIndexStart = 1;
    if (extensionObject.iconURI) {
      blockJson.message0 = `%1 %2 ${blockJson.message0}`;
      blockJson.args0 = [
        {
          type: 'field_image',
          src: extensionObject.iconURI,
          width: 40,
          height: 40,
        },
        {
          type: 'field_vertical_separator',
        },
      ];
      blockJson.extensions = ['scratch_extension'];
      argsIndexStart += 2;
    }

    if (block.hat) {
      blockJson.nextStatement = null;
    } else if (block.output) {
      if (block.output === 'boolean') {
        blockJson.output = 'Boolean';
        blockJson.outputShape = OUTPUT_SHAPE_HEXAGONAL;
      } else {
        blockJson.output = 'String'; // TODO: text or nubmer
        blockJson.outputShape = OUTPUT_SHAPE_ROUND;
      }
      blockJson.checkboxInFlyout = block.monitoring !== false;
    } else {
      blockJson.previousStatement = null;
      blockJson.nextStatement = null;
    }

    let blockXML = `<block type="${xmlEscape(blockId)}">`;

    if (block.inputs) {
      blockJson.checkboxInFlyout = false;
      blockJson.args0 = [].concat(
        blockJson.args0 || [],
        Object.entries(block.inputs).map(([name, arg]) => {
          const argObject = {
            name,
            type: 'input_value',
          };

          if (arg.menu) {
            argObject.type = 'field_dropdown';
            argObject.options = arg.menu.map(([text, value]) => [maybeLocaleText(text), value]);
          } else if (arg.type === 'boolean') {
            argObject.check = 'Boolean';
          } else {
            blockXML += `<value name="${xmlEscape(name)}">`;
            if (ShadowTypes[arg.type]) {
              blockXML += `<shadow type="${ShadowTypes[arg.type]}">`;
              if (arg.default && FieldTypes[arg.type]) {
                blockXML += `<field name="${FieldTypes[arg.type]}">${xmlEscape(maybeLocaleText(arg.default))}</field>`;
              }
              blockXML += '</shadow>';
            }
            blockXML += '</value>';
          }

          blockJson.message0 = blockJson.message0.replace(`[${name}]`, `%${argsIndexStart++}`);
          return argObject;
        }),
      );
    }

    ScratchBlocks.Blocks[blockId] = {
      init() {
        this.jsonInit(blockJson);
      },
    };

    // generate python
    if (block.python) {
      pythonGenerator[blockId] = block.python.bind(pythonGenerator);
    } else {
      pythonGenerator[blockId] = () => '';
    }

    blockXML += '</block>';
    categoryXML += blockXML;
  });

  categoryXML += '</category>';
  return categoryXML;
}
