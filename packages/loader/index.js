const { getOptions } = require('loader-utils');
const jsnx = require('../jsnx');

const DEFAULT_RENDERER = `import React from 'react';`;

async function loader(content) {
  if (this.cacheable) this.cacheable();
  const callback = this.async();
  const options = { ...getOptions(this), filepath: this.resourcePath };

  let value = typeof content === 'string' ? JSON.parse(content) : content;

  value = JSON.stringify(value)
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');

  let result;

  try {
    result = await jsnx(value, options);
  } catch (err) {
    return callback(err);
  }

  const { renderer = DEFAULT_RENDERER } = options;
  const code = `${renderer}\n${result}`;
  return callback(null, code);
}

module.exports = loader;
