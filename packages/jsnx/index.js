const unified = require('unified');
const jsonToEstree = require('./json-to-estree');

const pragma = `/* @jsxRuntime classic */`;

function createCompiler(options) {
  return unified().use(jsonToEstree, options);
}

function createConfig(json, options) {
  const config = { contents: json };

  if (options.filepath) {
    config.path = options.filepath;
  }

  return config;
}

function sync(json, options = {}) {
  const file = createCompiler(options).processSync(createConfig(json, options));
  return `${pragma}\n${String(file)}`;
}

async function compile(json, options = {}) {
  const file = await createCompiler(options).process(createConfig(json, options));
  return `${pragma}\n${String(file)}`;
}

module.exports = compile;
compile.sync = sync;
compile.createCompiler = createCompiler;
