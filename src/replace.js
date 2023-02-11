const path = require('path');
const minimatch = require('minimatch');

module.exports = {
  meta: {
    type: 'layout',
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          ignore: {
            type: 'array',
            items: {
              type: 'string'
            }
          },
          method: {
            type: 'string',
            enum: ['all', 'only-parent']
          },
          aliases: {
            type: 'array',
            minItems: 1,
            items: {
              properties: {
                name: {
                  type: 'string',
                },
                path: {
                  type: 'string'
                }
              },
              required: ['name', 'path'],
              additionalProperties: false
            },
          }
        },
        required: ['aliases'],
        additionalProperties: false
      }
    ],
    messages: {
      'can-replace': 'Run autofix to replace these relative imports!',
      'cannot-replace': 'No alias has been defined which matches this import path'
    }
  },
  create: context => {
    return {
      ImportDeclaration: node => {
        const config = getConfiguration(context);

        if (config.ignorePatterns.some(pattern => minimatch(context.getFilename(), pattern))) {
          return;
        }

        evaluateImport(node, config, context);
      }
    }
  }
}

function evaluateImport(node, config, context) {
  const { source: { value, range, loc } } = node;
  if (value.startsWith('./') && config.replaceMethod === 'only-parent') {
    return;
  } else if (!value.startsWith('../')) {
    return;
  }

  let canFix = false;
  const currentFileDirectory = path.dirname(context.getFilename());
  for (const alias of config.replaceAliases) {
    const { replaceDir, replaceWith } = alias;
    const fullImportPath = path.resolve(currentFileDirectory, value);

    if (fullImportPath.startsWith(replaceDir)) {
      canFix = true;
      const replacedImportPath = fullImportPath.replace(replaceDir, replaceWith).split(path.sep).join("/")

      context.report({
        messageId: 'can-replace',
        loc,
        fix: fixer => fixer.replaceTextRange(range, `'${replacedImportPath}'`),
      });

      break;
    }
  }

  if (!canFix) {
    context.report({
      messageId: 'cannot-replace',
      loc,
    });
  }
}

function getConfiguration(context) {
  const options = {
    ignore: [],
    method: 'only-parent',
    ...context.options[0],
  };

  return {
    ignorePatterns: options.ignore,
    replaceMethod: options.method,
    replaceAliases: options.aliases.map(alias => ({
      replaceDir: path.resolve(alias.path),
      replaceWith: alias.name,
    })),
  }
}
