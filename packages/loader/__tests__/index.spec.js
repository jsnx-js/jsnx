import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createFsFromVolume, Volume } from 'memfs';
import webpack from 'webpack';
import path from 'path';

const transform = (fixture, options) => {
  const compiler = webpack({
    context: __dirname,
    entry: `../__fixtures__/${fixture}`,
    mode: 'none',
    module: {
      rules: [
        {
          test: /\.jsnx$/,
          use: [
            {
              loader: 'babel-loader',
              options: {
                plugins: [
                  '@babel/plugin-transform-runtime',
                  '@babel/plugin-syntax-jsx',
                  '@babel/plugin-transform-react-jsx',
                ],
              },
            },
            { loader: path.resolve(__dirname, '..'), options },
          ],
        },
      ],
    },
  });

  compiler.outputFileSystem = createFsFromVolume(new Volume());
  compiler.outputFileSystem.join = path.join.bind(path);

  return new Promise((resolve, reject) => {
    compiler.run((err, stats) => {
      if (err) reject(err);
      if (stats.hasErrors()) reject(stats.toJson().errors);

      resolve(
        stats
          .toJson({ source: true })
          .modules.find(m => m.name === `../__fixtures__/${fixture}`)
      );
    });
  });
};

const run = value => {
  const val = value
    .replace(/import React from 'react';/, '')
    .replace(/export default/, 'return');

  // eslint-disable-next-line no-new-func
  return new Function('React', val)(React);
};

describe('@jsnx-js/loader', () => {
  it('should support a file', async () => {
    const file = await transform('greeting.fixture.jsnx');
    const Content = run(file.source);

    expect(renderToStaticMarkup(<Content />)).toEqual('<h1>Hello, world!</h1>');
  });
});
