// const webpack = require('./webpack');
const { resolve } = require('path');
const { name, version } = require('../package.json');
const externals = require('./externals')
const nonCssModuleRegex = /\.(less|css)$/;
const cssModuleRegex = /\.module\.(less|css)$/;

const getStyleLoader = enableCssModule => {
  const moduleOption = enableCssModule ? {
    modules: true,
    localIdentName: '[local]___[hash:base64:5]',
  } : {}

  return ([
    {
      loader: 'style-loader',
      options: { injectType: 'singletonStyleTag' }
    },
    {
      loader: 'css-loader',
      options: {
        sourceMap: true,
        ...moduleOption,
      }
    },
    // { loader: 'postcss-loader' },
    {
      loader: 'less-loader',
      options: {
        sourceMap: true,
        // javascriptEnabled: true,
        ...moduleOption,
      },
    },
  ]
  )
}

const base = {
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    alias: {
      "@": resolve(__dirname, '../src'),
    }
  },
  output: {
    library: name,
    libraryTarget: 'umd',
    filename: '[name].js',
    path: resolve(__dirname, '../lib')
  },
  module: {
    rules: [
      {
        test: /\.(jsx|tsx|js|ts)?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              babelrc: false,
              cacheDirectory: true,
              presets: [
                '@babel/preset-env',
                '@babel/preset-react',
                '@babel/preset-typescript',
              ],
              plugins: [
                ["@babel/proposal-decorators", { "legacy": true }],
                '@babel/plugin-proposal-class-properties',
                '@babel/plugin-proposal-object-rest-spread',
                '@babel/plugin-proposal-async-generator-functions',
                "@babel/plugin-proposal-optional-chaining",
                ['@babel/plugin-transform-runtime', {
                  'regenerator': true,
                  'helpers': false
                }],
              ]
            }
          }
        ]
      },
      {
        oneOf: [
          {
            test: nonCssModuleRegex,
            exclude: cssModuleRegex,
            use: getStyleLoader(false)
          },
          {
            test: cssModuleRegex,
            use: getStyleLoader(true)
          }
        ]
      }
    ],
  },
  externals,

  plugins: [
    // new webpack.BannerPlugin({banner: `${name}@${version}`}),
  ],
}

module.exports = base
