import React from 'react';
import { render } from '@testing-library/react';
import { transformAsync } from '@babel/core';

import jsnx, { sync } from '../src';

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

const component = {
  name: 'p',
  props: {
    children: 'Hello, World!',
  },
};

describe('JSNX', () => {
  const mockComponent = <p>Hello, World!</p>;

  it('should contruct correct jsx', async () => {
    const result = await jsnx(
      JSON.stringify({
        components: [component],
      })
    );

    expect(result).toEqual(
      `/* @jsxRuntime classic */\nfunction JSNXContent(props) {\n  return <p {...props}>Hello, World!</p>;\n}\nexport default JSNXContent;\n`
    );
  });

  it('should contruct correct jsx when sync', () => {
    const result = sync(
      JSON.stringify({
        components: [component],
      })
    );

    expect(result).toEqual(
      `/* @jsxRuntime classic */\nfunction JSNXContent(props) {\n  return <p {...props}>Hello, World!</p>;\n}\nexport default JSNXContent;\n`
    );
  });

  it('should render correctly', async () => {
    const Greeting = await run(
      JSON.stringify({
        components: [component],
      })
    );
    const { container } = render(<Greeting />);
    expect(container).toEqual(render(mockComponent).container);
  });

  it('should render correctly with filepath', async () => {
    const Greeting = await run(
      JSON.stringify({
        components: [component],
      }),
      {
        filepath: 'index.jsnx',
      }
    );
    const { container } = render(<Greeting />);
    expect(container).toEqual(render(mockComponent).container);
  });
});
