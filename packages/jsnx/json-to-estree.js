const estreeToJs = require('./estree-to-js');

function createJSONImports(imports, options) {
  if (imports.length) {
    return {
      type: 'ImportDeclaration',
      specifiers: [
        imports.map(name => ({
          type: 'ImportSpecifier',
          imported: {
            type: 'Identifier',
            name,
          },
          local: {
            type: 'Identifier',
            name,
          },
        })),
      ],
      source: {
        type: 'Literal',
        value: '@components',
        raw: JSON.stringify(options.componentsPath || '@components'),
      },
    };
  }

  return null;
}

function createJSONProgram() {
  return {
    type: 'Program',
    body: [],
  };
}

function createJSONComponent(component) {
  if (typeof component === 'string') {
    return {
      type: 'JSXText',
      value: component,
      raw: component,
    };
  }

  return {
    type: 'JSXElement',
    openingElement: {
      type: 'JSXOpeningElement',
      name: {
        type: 'JSXIdentifier',
        name: component.name,
      },
      attributes: [],
      selfClosing: !component.props.children,
    },
    ...(component.props.children && {
      closingElement: {
        type: 'JSXClosingElement',
        name: {
          type: 'JSXIdentifier',
          name: component.name,
        },
      },
    }),
    children: Array.isArray(component.props.children)
      ? component.props.children.map(child => createJSONComponent(child))
      : [createJSONComponent(component.props.children)],
  };
}

function createJSONContent(children) {
  return {
    type: 'FunctionDeclaration',
    id: { type: 'Identifier', name: 'JSNXContent', optional: false },
    expression: false,
    generator: false,
    async: false,
    params: [
      {
        type: 'Identifier',
        name: 'props',
        optional: false,
      },
    ],
    body: {
      type: 'BlockStatement',
      body: [
        {
          type: 'ReturnStatement',
          argument:
            children.length > 1
              ? {
                  type: 'JSXFragment',
                  openingFragment: { type: 'JSXOpeningFragment' },
                  closingFragment: { type: 'JSXClosingFragment' },
                  children,
                }
              : children[0],
        },
      ],
    },
  };
}

function serializeEstree(estree) {
  return estreeToJs(estree);
}

function compile(options = {}) {
  function parse(tree) {
    const { components } = JSON.parse(tree);
    const imports = [];

    const JSONComponents = components.map(component => {
      if (component.imported) {
        imports.push(component);
      }

      return createJSONComponent(component);
    });

    const estree = createJSONProgram();

    estree.body = [
      ...estree.body,
      createJSONImports(imports, options),
      createJSONContent(JSONComponents),
      !options.skipExport
        ? {
            type: 'ExportDefaultDeclaration',
            declaration: {
              type: 'Identifier',
              name: 'JSNXContent',
            },
            exportKind: 'value',
          }
        : null,
    ];

    estree.body = estree.body.filter(state => state !== null);

    return estree;
  }

  function compiler(tree) {
    return serializeEstree(tree);
  }

  this.Compiler = compiler;
  this.Parser = parse;
}

module.exports = compile;
compile.default = compile;
