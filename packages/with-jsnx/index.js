const path = require('path');

module.exports = (nextConfig = {}) => {
  return {
    ...nextConfig,
    webpack(config, options) {
      if (!options.defaultLoaders) {
        throw new Error(
          'This plugin is not compatible with Next.js versions below 5.0.0 https://err.sh/next-plugins/upgrade'
        );
      }

      // eslint-disable-next-line no-param-reassign
      options.defaultLoaders.jsnx = {
        loader: path.resolve(__dirname, '../loader'),
        options: {
          skipExport: false,
        },
      };

      config.module.rules.push({
        test: /\.jsnx$/,
        use: [options.defaultLoaders.babel, options.defaultLoaders.jsnx],
      });

      if (typeof nextConfig.webpack === 'function') {
        return nextConfig.webpack(config, options);
      }

      return config;
    },
  };
};
