const { resolve } = require('path')
const baseConfig = require('../../.script/webpack.base');

const devBaseConfig = {
  ...baseConfig,
  mode: 'development',

  devtool: 'none',
  resolve: {
    ...baseConfig.resolve,
    alias: {
      ...baseConfig.resolve.alias,
      "@": resolve(__dirname, './src'),
      "@Utils": resolve(__dirname, './src/utils'),
    }
  },
};

module.exports = [{
  ...devBaseConfig,

  entry: {
    index: resolve(__dirname, './src/index.ts'),
  },

  output: {
    library: "@iron-man/container-api",
    libraryTarget: 'umd',
    filename: '[name].js',
    path: resolve(__dirname, './lib')
  },
}]
