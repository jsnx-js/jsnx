<h1 align="center">JNSX JS</h1>

<div align="center">
Parse json structure file to react component.

[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/jsnx-js/jsnx/blob/main/LICENSE)

</div>

# Usage

Here is a quick example to get you started, **it's all you need**:

```javascript
const withJSNX = require('@jsnx-js/with-jsnx')();

module.exports = withJSNX({
  pageExtensions: ['js', 'jsx', 'jsnx'],
});
```
Here is a quick example with **options**:

```javascript
const withJSNX = require('@jsnx-js/with-jsnx')({
  options: {
    componentsPath: '@material-ui/core',
  }
});

module.exports = withJSNX({
  pageExtensions: ['js', 'jsx', 'jsnx'],
});
```

**File**: will returns a [React](https://reactjs.org/) functional component:

```json
{
  "components": [
    {
      "name": "LinearProgress",
      "imported": true
    },
    {
      "name": "Breadcrumbs",
      "imported": "default",
      "from": "@material-ui/core/Breadcrumbs",
      "props": {
        "aria-label": "breadcrumb",
        "children": [
          {
            "name": "Link",
            "imported": "default",
            "from": "next/link",
            "props": {
              "href": "/",
              "children": "Material-UI"
            }
          },
          {
            "name": "Link",
            "imported": true,
            "asName": "MaterialLink",
            "props": {
              "href": "/getting-started/installation/",
              "children": "Core"
            }
          },
          {
            "name": "Typography",
            "imported": "default",
            "props": {
              "color": "textPrimary",
              "children": "Breadcrumb"
            }
          }
        ]
      }
    }
  ]
}
