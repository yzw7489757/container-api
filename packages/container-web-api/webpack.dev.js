const { resolve } = require('path')
const baseConfig = require('../../.script/webpack.base');
const { name } = require('./package.json');

const IN_HTTPS = !!process.env.HTTPS;

const devBaseConfig = {
  ...baseConfig,
  mode: 'development',
  devServer: {
    disableHostCheck: true,
    historyApiFallback: true,
    contentBase: [
      resolve(__dirname, './demo'),
    ],
    https: IN_HTTPS,
    port: 7105,
    host: '0.0.0.0',
    stats: 'minimal',
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },

  devtool: 'cheap-module-source-map',
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
    path: resolve(__dirname, '../lib')
  },
}]
