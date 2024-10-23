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

export default function (generators, extensionObject, isStage, maybeLocaleText, buttonWrapper) {
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

  extensionObject.menus = extensionObject.menus || {};
  extensionObject.blocks
    .filter((block) => !block.hidden)
    .forEach((block) => {
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

      const blockId = `${extensionId}_${block.id}`;
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
              let menu = arg.menu;
              let menuName = arg.name || name;
              let inputMode = arg.inputMode || false;
              let inputType = arg.type || 'string';
              let inputDefault = arg.default || '';
              if (typeof arg.menu === 'string') {
                menuName = arg.menu;
                menu = extensionObject.menus[menuName];
              }
              if (!Array.isArray(menu)) {
                inputMode = menu.inputMode || inputMode;
                inputType = menu.type || inputType;
                inputDefault = menu.default || inputDefault;
                menu = menu.items;
              }
              if (inputMode) {
                if (!extensionObject.menus[menuName]) {
                  extensionObject.menus[menuName] = {
                    inputMode,
                    type: inputType,
                    items: menu,
                  };
                }
                blockXML += `<value name="${xmlEscape(name)}">`;
                blockXML += `<shadow type="${extensionId}_menu_${menuName}">`;
                if (inputDefault) {
                  blockXML += `<field name="${menuName}">${xmlEscape(maybeLocaleText(inputDefault))}</field>`;
                }
                blockXML += '</shadow></value>';
              } else if (menu) {
                argObject.type = 'field_dropdown';
                argObject.options = menu.map((item) => {
                  if (Array.isArray(item)) {
                    const [text, value] = item;
                    return [maybeLocaleText(text), value];
                  }
                  item = `${item}`;
                  return [item, item];
                });
              }
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

      // generate code
      for (const generator of generators) {
        const codeName = generator.name_.toLowerCase();
        if (block[codeName]) {
          generator[blockId] = block[codeName].bind(generator);
        } else {
          generator[blockId] = () => '';
        }
      }

      blockXML += '</block>';
      categoryXML += blockXML;
    });

  // menu input blocks
  Object.entries(extensionObject.menus).forEach(([menuName, menu]) => {
    if (!menu.inputMode) return;

    const blockId = `${extensionId}_menu_${menuName}`;
    const outputType = menu.type === 'number' ? 'output_number' : 'output_string';
    const blockJson = {
      message0: '%1',
      args0: [
        {
          type: 'field_dropdown',
          name: menuName,
          options: menu.items.map((item) => {
            if (Array.isArray(item)) {
              const [text, value] = item;
              return [maybeLocaleText(text), value];
            }
            item = `${item}`;
            return [item, item];
          }),
        },
      ],
      category: extensionId,
      colour: extensionObject.themeColor || THEME_COLOR,
      colourSecondary: extensionObject.inputColor || INPUT_COLOR,
      colourTertiary: extensionObject.otherColor || OTHER_COLOR,
      extensions: [outputType],
    };

    ScratchBlocks.Blocks[blockId] = {
      init() {
        this.jsonInit(blockJson);
      },
    };

    // generate code
    for (const generator of generators) {
      generator[blockId] = (block) => {
        const value = block.getFieldValue(menuName);
        return [value, generator.ORDER_ATOMIC];
      };
    }
  });

  categoryXML += '</category>';
  return categoryXML;
}
