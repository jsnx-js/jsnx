const withJSNX = require('../../packages/with-jsnx')({
  options: {
    componentsPath: '@material-ui/core',
  },
});

module.exports = withJSNX({
  pageExtensions: ['js', 'jsx', 'jsnx'],
});
