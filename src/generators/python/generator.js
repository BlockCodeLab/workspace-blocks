import { ScratchBlocks } from '@blockcode/blocks-editor';

export const pythonGenerator = new ScratchBlocks.Generator('Python');

/**
 * List of illegal variable names.
 * This is not intended to be a security feature.  Blockly is 100% client-side,
 * so bypassing this list is trivial.  This is intended to prevent users from
 * accidentally clobbering a built-in object or function.
 * @private
 */
pythonGenerator.addReservedWords(
  // import keyword
  // print(','.join(sorted(keyword.kwlist)))
  // https://docs.python.org/3/reference/lexical_analysis.html#keywords
  // https://docs.python.org/2/reference/lexical_analysis.html#keywords
  'False,None,True,and,as,assert,break,class,continue,def,del,elif,else,' +
    'except,exec,finally,for,from,global,if,import,in,is,lambda,nonlocal,not,' +
    'or,pass,print,raise,return,try,while,with,yield,' +
    // https://docs.python.org/3/library/constants.html
    // https://docs.python.org/2/library/constants.html
    'NotImplemented,Ellipsis,__debug__,quit,exit,copyright,license,credits,' +
    // >>> print(','.join(sorted(dir(__builtins__))))
    // https://docs.python.org/3/library/functions.html
    // https://docs.python.org/2/library/functions.html
    'ArithmeticError,AssertionError,AttributeError,BaseException,' +
    'BlockingIOError,BrokenPipeError,BufferError,BytesWarning,' +
    'ChildProcessError,ConnectionAbortedError,ConnectionError,' +
    'ConnectionRefusedError,ConnectionResetError,DeprecationWarning,EOFError,' +
    'Ellipsis,EnvironmentError,Exception,FileExistsError,FileNotFoundError,' +
    'FloatingPointError,FutureWarning,GeneratorExit,IOError,ImportError,' +
    'ImportWarning,IndentationError,IndexError,InterruptedError,' +
    'IsADirectoryError,KeyError,KeyboardInterrupt,LookupError,MemoryError,' +
    'ModuleNotFoundError,NameError,NotADirectoryError,NotImplemented,' +
    'NotImplementedError,OSError,OverflowError,PendingDeprecationWarning,' +
    'PermissionError,ProcessLookupError,RecursionError,ReferenceError,' +
    'ResourceWarning,RuntimeError,RuntimeWarning,StandardError,' +
    'StopAsyncIteration,StopIteration,SyntaxError,SyntaxWarning,SystemError,' +
    'SystemExit,TabError,TimeoutError,TypeError,UnboundLocalError,' +
    'UnicodeDecodeError,UnicodeEncodeError,UnicodeError,' +
    'UnicodeTranslateError,UnicodeWarning,UserWarning,ValueError,Warning,' +
    'ZeroDivisionError,_,__build_class__,__debug__,__doc__,__import__,' +
    '__loader__,__name__,__package__,__spec__,abs,all,any,apply,ascii,' +
    'basestring,bin,bool,buffer,bytearray,bytes,callable,chr,classmethod,cmp,' +
    'coerce,compile,complex,copyright,credits,delattr,dict,dir,divmod,' +
    'enumerate,eval,exec,execfile,exit,file,filter,float,format,frozenset,' +
    'getattr,globals,hasattr,hash,help,hex,id,input,int,intern,isinstance,' +
    'issubclass,iter,len,license,list,locals,long,map,max,memoryview,min,' +
    'next,object,oct,open,ord,pow,print,property,quit,range,raw_input,reduce,' +
    'reload,repr,reversed,round,set,setattr,slice,sorted,staticmethod,str,' +
    'sum,super,tuple,type,unichr,unicode,vars,xrange,zip',
);

/**
 * Order of operation ENUMs.
 * http://docs.python.org/reference/expressions.html#summary
 */
pythonGenerator.ORDER_ATOMIC = 0; // 0 "" ...
pythonGenerator.ORDER_COLLECTION = 1; // tuples, lists, dictionaries
pythonGenerator.ORDER_STRING_CONVERSION = 1; // `expression...`
pythonGenerator.ORDER_MEMBER = 2.1; // . []
pythonGenerator.ORDER_FUNCTION_CALL = 2.2; // ()
pythonGenerator.ORDER_EXPONENTIATION = 3; // **
pythonGenerator.ORDER_UNARY_SIGN = 4; // + -
pythonGenerator.ORDER_BITWISE_NOT = 4; // ~
pythonGenerator.ORDER_MULTIPLICATIVE = 5; // * / // %
pythonGenerator.ORDER_ADDITIVE = 6; // + -
pythonGenerator.ORDER_BITWISE_SHIFT = 7; // << >>
pythonGenerator.ORDER_BITWISE_AND = 8; // &
pythonGenerator.ORDER_BITWISE_XOR = 9; // ^
pythonGenerator.ORDER_BITWISE_OR = 10; // |
pythonGenerator.ORDER_RELATIONAL = 11; // in, not in, is, is not,
//     <, <=, >, >=, <>, !=, ==
pythonGenerator.ORDER_LOGICAL_NOT = 12; // not
pythonGenerator.ORDER_LOGICAL_AND = 13; // and
pythonGenerator.ORDER_LOGICAL_OR = 14; // or
pythonGenerator.ORDER_CONDITIONAL = 15; // if else
pythonGenerator.ORDER_LAMBDA = 16; // lambda
pythonGenerator.ORDER_NONE = 99; // (...)

/**
 * List of outer-inner pairings that do NOT require parentheses.
 * @type {!Array.<!Array.<number>>}
 */
pythonGenerator.ORDER_OVERRIDES = [
  // (foo()).bar -> foo().bar
  // (foo())[0] -> foo()[0]
  [pythonGenerator.ORDER_FUNCTION_CALL, pythonGenerator.ORDER_MEMBER],
  // (foo())() -> foo()()
  [pythonGenerator.ORDER_FUNCTION_CALL, pythonGenerator.ORDER_FUNCTION_CALL],
  // (foo.bar).baz -> foo.bar.baz
  // (foo.bar)[0] -> foo.bar[0]
  // (foo[0]).bar -> foo[0].bar
  // (foo[0])[1] -> foo[0][1]
  [pythonGenerator.ORDER_MEMBER, pythonGenerator.ORDER_MEMBER],
  // (foo.bar)() -> foo.bar()
  // (foo[0])() -> foo[0]()
  [pythonGenerator.ORDER_MEMBER, pythonGenerator.ORDER_FUNCTION_CALL],

  // not (not foo) -> not not foo
  [pythonGenerator.ORDER_LOGICAL_NOT, pythonGenerator.ORDER_LOGICAL_NOT],
  // a and (b and c) -> a and b and c
  [pythonGenerator.ORDER_LOGICAL_AND, pythonGenerator.ORDER_LOGICAL_AND],
  // a or (b or c) -> a or b or c
  [pythonGenerator.ORDER_LOGICAL_OR, pythonGenerator.ORDER_LOGICAL_OR],
];

/**
 * Initialise the database of variable names.
 * @param {!ScratchBlocks.Workspace} workspace Workspace to generate code from.
 */
pythonGenerator.init = (workspace) => {
  /**
   * Empty loops or conditionals are not allowed in Python.
   */
  pythonGenerator.PASS = pythonGenerator.INDENT + 'pass\n';
  // Create a dictionary of definitions to be printed before the code.
  pythonGenerator.definitions_ = Object.create(null);
  // Create a dictionary mapping desired function names in definitions_
  // to actual function names (to avoid collisions with user functions).
  pythonGenerator.functionNames_ = Object.create(null);

  if (!pythonGenerator.variableDB_) {
    pythonGenerator.variableDB_ = new ScratchBlocks.Names(pythonGenerator.RESERVED_WORDS_);
  } else {
    pythonGenerator.variableDB_.reset();
  }

  pythonGenerator.variableDB_.setVariableMap(workspace.getVariableMap());

  const defvars = [];
  const variables = workspace.getAllVariables();
  for (let i = 0; i < variables.length; i++) {
    if (variables[i].type === ScratchBlocks.BROADCAST_MESSAGE_VARIABLE_TYPE) {
      continue;
    }
    let varName = pythonGenerator.variableDB_.getName(variables[i].getId(), ScratchBlocks.Variables.NAME_TYPE);
    let varValue = '';
    if (variables[i].type === ScratchBlocks.LIST_VARIABLE_TYPE) {
      varName = `${varName}_${ScratchBlocks.LIST_VARIABLE_TYPE}`;
      varValue = '[]';
    }
    defvars.push(`${varName} = ${varValue}`);
  }

  // Add developer variables (not created or named by the user).
  const devVarList = ScratchBlocks.Variables.allDeveloperVariables(workspace);
  for (let i = 0; i < devVarList.length; i++) {
    let varName = pythonGenerator.variableDB_.getName(devVarList[i], ScratchBlocks.Names.DEVELOPER_VARIABLE_TYPE);
    let varValue = '';
    if (variables[i].type === ScratchBlocks.LIST_VARIABLE_TYPE) {
      varName = `${varName}_${ScratchBlocks.LIST_VARIABLE_TYPE}`;
      varValue = '[]';
    }
    defvars.push(`${varName} = ${varValue}`);
  }

  if (defvars.length) {
    pythonGenerator.definitions_['variables'] = defvars.join('\n');
  }

  // import blocks for micropython library
  pythonGenerator.definitions_['import_blocks'] = 'from blocks import *';
};

/**
 * Prepend the generated code with the variable definitions.
 * @param {string} code Generated code.
 * @return {string} Completed code.
 */
pythonGenerator.finish = (code) => {
  // Convert the definitions dictionary into a list.
  const imports = [];
  const definitions = [];
  for (let name in pythonGenerator.definitions_) {
    const def = pythonGenerator.definitions_[name];
    if (def.match(/^(from\s+\S+\s+)?import\s+\S+/)) {
      imports.push(def);
    } else {
      definitions.push(def);
    }
  }
  // Clean up temporary data.
  delete pythonGenerator.definitions_;
  delete pythonGenerator.functionNames_;
  pythonGenerator.variableDB_.reset();
  const allDefs = imports.join('\n') + '\n\n' + definitions.join('\n\n');
  return allDefs.replace(/\n\n+/g, '\n\n').replace(/\n*$/, '\n\n\n') + code;
};

/**
 * Naked values are top-level blocks with outputs that aren't plugged into
 * anything.
 * @param {string} line Line of generated code.
 * @return {string} Legal line of code.
 */
pythonGenerator.scrubNakedValue = (line) => {
  return line + '\n';
};

/**
 * Encode a string as a properly escaped Python string, complete with quotes.
 * @param {string} string Text to encode.`
 * @return {string} Python string.
 * @private
 */
pythonGenerator.quote_ = (string) => {
  // Can't use goog.string.quote since % must also be escaped.
  string = string.replace(/\\/g, '\\\\').replace(/\n/g, '\\\n').replace(/\%/g, '\\%');

  // Follow the CPython behaviour of repr() for a non-byte string.
  let quote = '"';
  if (string.indexOf('"') !== -1) {
    if (string.indexOf("'") === -1) {
      quote = "'";
    } else {
      string = string.replace(/"/g, '\\"');
    }
  }
  return quote + string + quote;
};

/**
 * Common tasks for generating Python from blocks.
 * Handles comments for the specified block and any connected value blocks.
 * Calls any statements following this block.
 * @param {!ScratchBlocks.Block} block The current block.
 * @param {string} code The Python code created for this block.
 * @return {string} Python code with comments and subsequent blocks added.
 * @private
 */
pythonGenerator.scrub_ = (block, code) => {
  let commentCode = '';
  // Only collect comments for blocks that aren't inline.
  if (!block.outputConnection?.targetConnection) {
    // Collect comment for this block.
    let comment = block.getCommentText();
    comment = ScratchBlocks.utils.wrap(comment, pythonGenerator.COMMENT_WRAP - 3);
    if (comment) {
      if (block.getProcedureDef) {
        // Use a comment block for function comments.
        commentCode += '"""' + comment + '\n"""\n';
      } else {
        commentCode += pythonGenerator.prefixLines(comment + '\n', '# ');
      }
    }
    // Collect comments for all value arguments.
    // Don't collect comments for nested statements.
    for (let i = 0; i < block.inputList.length; i++) {
      if (block.inputList[i].type == ScratchBlocks.INPUT_VALUE) {
        const childBlock = block.inputList[i].connection.targetBlock();
        if (childBlock) {
          const comment = pythonGenerator.allNestedComments(childBlock);
          if (comment) {
            commentCode += pythonGenerator.prefixLines(comment, '# ');
          }
        }
      }
    }
  }

  if (block.startHat_) {
    const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    let nextCode = pythonGenerator.blockToCode(nextBlock);
    if (nextCode) {
      nextCode = pythonGenerator.prefixLines(nextCode, pythonGenerator.INDENT);
      code = code.replace(`\n${pythonGenerator.PASS}`, `\n${nextCode}`);
    }
    return commentCode + code;
  }

  if (block.parentBlock_) {
    const nextBlock = block.nextConnection && block.nextConnection.targetBlock();
    const nextCode = pythonGenerator.blockToCode(nextBlock);
    return commentCode + code + nextCode;
  }
};

/**
 * Gets a property and adjusts the value, taking into account indexing, and
 * casts to an integer.
 * @param {!ScratchBlocks.Block} block The block.
 * @param {string} atId The property ID of the element to get.
 * @param {number=} opt_delta Value to add.
 * @param {boolean=} opt_negate Whether to negate the value.
 * @return {string|number}
 */
pythonGenerator.getAdjustedInt = (block, atId, opt_delta, opt_negate) => {
  let delta = opt_delta || 0;
  if (block.workspace.options.oneBasedIndex) {
    delta--;
  }
  const defaultAtIndex = block.workspace.options.oneBasedIndex ? '1' : '0';
  const atOrder = delta ? pythonGenerator.ORDER_ADDITIVE : pythonGenerator.ORDER_NONE;
  let at = pythonGenerator.valueToCode(block, atId, atOrder) || defaultAtIndex;

  if (ScratchBlocks.isNumber(at)) {
    // If the index is a naked number, adjust it right now.
    at = parseInt(at, 10) + delta;
    if (opt_negate) {
      at = -at;
    }
  } else {
    // If the index is dynamic, adjust it in code.
    if (delta > 0) {
      at = 'int(' + at + ' + ' + delta + ')';
    } else if (delta < 0) {
      at = 'int(' + at + ' - ' + -delta + ')';
    } else {
      at = 'int(' + at + ')';
    }
    if (opt_negate) {
      at = '-' + at;
    }
  }
  return at;
};

pythonGenerator.hatToCode = (name = '', ...args) => {
  if (!pythonGenerator.functionNames_[name]) {
    pythonGenerator.functionNames_[name] = 0;
  }
  pythonGenerator.functionNames_[name] += 1;
  const functionName = `${name}_${pythonGenerator.functionNames_[name]}`;
  pythonGenerator.HAT_FUNCTION_PLACEHOLDER = functionName;
  return `async def ${functionName}(${args.join(', ')}):\n  this_func = ${functionName}\n${pythonGenerator.PASS}\n`;
};
