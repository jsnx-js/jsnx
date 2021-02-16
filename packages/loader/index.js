import { existsSync } from 'fs';
import { getOptions } from 'loader-utils';
import jsnx from '@jsnx-js/jsnx';

const CONFIG_FILE_NAME = 'jsnx.config.js';
const DEFAULT_RENDERER = `import React from 'react';`;

async function getConfig() {
  let path = `${process.cwd()}/${CONFIG_FILE_NAME}`;

  if (!existsSync(path)) {
    path = `${__dirname}/${CONFIG_FILE_NAME}`;
  }

  return import(path);
}

async function loader(content) {
  if (this.cacheable) this.cacheable();
  const callback = this.async();
  const config = await getConfig();
  const options = { ...getOptions(this), ...config.default, filepath: this.resourcePath };

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

export default loader;
