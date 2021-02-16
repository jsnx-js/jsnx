module.exports = {
  babelrcRoots: ['./packages/*', './examples/*'],
  plugins: [
    [
      'module-resolver',
      {
        alias: {
          '@jsnx-js/jsnx': './packages/jsnx',
          '@jsnx-js/loader': './packages/loader',
          '@jsnx-js/nextjs': './packages/nextjs',
        },
      },
    ],
  ],
};
