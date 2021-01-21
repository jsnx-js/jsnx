# JNSX JS

> Parse json structure file to react component/next page

### How to use

```javascript
const withJSNX = require('@jsnx-js/with-jsnx')();

module.exports = withJSNX({
  pageExtensions: ['js', 'jsx', 'jsnx'],
});
```
#### Options

```javascript
const withJSNX = require('@jsnx-js/with-jsnx')({
  options: {
    componentsPath: '@material-ui/core',
  }
});

module.exports = withJSNX({
  pageExtensions: ['js', 'jsx', 'jsnx'],
});
