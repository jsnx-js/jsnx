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
    return imports.map(({ name, custom }) => {
      const { source, name: rename } = custom || {};

      const specifier = {
        type: 'ImportSpecifier',
        imported: { type: 'Identifier', optional: false, name },
        local: { type: 'Identifier', optional: false, name: rename || name },
      };

      if (source) {
        specifier.type = 'ImportDefaultSpecifier';
      }

      return createJSONImport([specifier], source || options.componentsPath);
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
  const { name: rename } = component?.custom || {};
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

function createJSONContent(children, name) {
  return {
    type: 'FunctionDeclaration',
    id: { type: 'Identifier', name, optional: false },
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
      (component?.type === 'module' || component?.custom?.source) &&
      !memo.find(
        ({ name }) => name === component.name && name === component?.custom?.name
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
    const { components, name = 'JSNXContent' } = JSON.parse(tree);
    const imports = getImports(components);

    const JSONComponents = components.map(component => {
      return createJSONComponent(component, !!component?.props?.children);
    });

    const estree = createJSONProgram();

    estree.body = [
      ...estree.body,
      ...createJSONImports(imports, options),
      createJSONContent(JSONComponents, name),
      !options.skipExport
        ? {
            type: 'ExportDefaultDeclaration',
            declaration: {
              type: 'Identifier',
              name,
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
