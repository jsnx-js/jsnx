import estreeToJs from './estree-to-js';

function createJSONImport(specifiers, path) {
  return {
    type: 'ImportDeclaration',
    specifiers,
    source: {
      type: 'Literal',
      value: path,
      raw: JSON.stringify(path),
    },
    importKind: 'value',
  };
}

function createJSONImports(imports, options) {
  if (imports.length) {
    return imports.map(({ name, exception }) => {
      const { source, rename } = exception;
      if (source) {
        const defaultSpecifier = {
          type: 'ImportDefaultSpecifier',
          local: { type: 'Identifier', optional: false, name },
        };

        return createJSONImport([defaultSpecifier], source);
      }

      const specifier = {
        type: 'ImportSpecifier',
        imported: { type: 'Identifier', optional: false, name },
        local: { type: 'Identifier', optional: false, name: rename || name },
      };

      return createJSONImport([specifier], options.componentsPath);
    });
  }

  return [];
}

function createJSONProgram() {
  return {
    type: 'Program',
    body: [],
  };
}

function createJSONComponent(component, hasChildren) {
  if (!component) return null;

  if (typeof component === 'string') {
    return {
      type: 'JSXText',
      value: component,
      raw: component,
    };
  }

  const { children, ...props } = component?.props || {};
  const { rename } = component?.exception || {};
  const attributes = Object.keys(props).map(name => ({
    type: 'JSXAttribute',
    name: { type: 'JSXIdentifier', name },
    value: {
      type: 'Literal',
      value: props[name],
      raw: JSON.stringify(props[name]),
    },
  }));

  return {
    type: 'JSXElement',
    openingElement: {
      type: 'JSXOpeningElement',
      name: {
        type: 'JSXIdentifier',
        name: rename || component.name,
      },
      attributes: [
        {
          type: 'JSXSpreadAttribute',
          argument: { type: 'Identifier', name: 'props' },
        },
        ...attributes,
      ],
      selfClosing: !hasChildren,
    },
    ...(hasChildren && {
      closingElement: {
        type: 'JSXClosingElement',
        name: {
          type: 'JSXIdentifier',
          name: rename || component.name,
        },
      },
    }),
    children: Array.isArray(children)
      ? children.map(child => createJSONComponent(child, child?.props?.children))
      : [createJSONComponent(children)],
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

function getImports(components) {
  return components.reduce((memo, component) => {
    if (
      (component?.exception?.type === 'module' || component?.exception?.source) &&
      !memo.find(
        ({ name }) => name === component.name && name === component?.exception?.rename
      )
    ) {
      memo.push(component);
    }

    if (Array.isArray(component?.props?.children)) {
      memo.push(...getImports(component.props.children));
    }

    return memo;
  }, []);
}

function compile(options = {}) {
  function parse(tree) {
    const { components } = JSON.parse(tree);
    const imports = getImports(components);

    const JSONComponents = components.map(component => {
      return createJSONComponent(component, !!component?.props?.children);
    });

    const estree = createJSONProgram();

    estree.body = [
      ...estree.body,
      ...createJSONImports(imports, options),
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

export default compile;
