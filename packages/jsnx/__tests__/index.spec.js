import React from 'react';
import { render } from '@testing-library/react';
import { transformAsync } from '@babel/core';

import jsnx from '..';

async function run(value, options = {}) {
  const doc = await jsnx(value, { ...options, skipExport: true });

  // …and that into serialized JS.
  const { code } = await transformAsync(doc, {
    plugins: ['@babel/plugin-transform-react-jsx'],
  });

  // …and finally run it, returning the component.
  // eslint-disable-next-line no-new-func
  return new Function('React', `${code}; return JSNXContent`)(React);
}

describe('JSNX', () => {
  it('should contruct correct jsx', async () => {
    const result = await jsnx(
      JSON.stringify({
        components: [
          {
            name: 'p',
            props: {
              children: 'Hello World!',
            },
          },
        ],
      })
    );

    expect(result).toEqual(
      `/* @jsxRuntime classic */\nfunction JSNXContent(props) {\n  return <p>Hello World!</p>;\n}\nexport default JSNXContent;\n`
    );
  });

  it('should render correctly', async () => {
    const Greeting = await run(
      JSON.stringify({
        components: [
          {
            name: 'p',
            props: {
              children: 'Hello, World!',
            },
          },
        ],
      })
    );
    const { container } = render(<Greeting />);
    expect(container).toEqual(render(<p>Hello, World!</p>).container);
  });
});
