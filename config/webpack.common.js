const HtmlWebpackPlugin = require('html-webpack-plugin');

const paths = require('./paths');

module.exports = {
  entry: [paths.src + '/index.ts'],

  output: {
    assetModuleFilename: 'img/[name].[hash:8][ext]',
  },

  plugins: [
    new HtmlWebpackPlugin({
      template: paths.public + '/index.html',
      filename: 'index.html',
      favicon: paths.public + '/img/favicon.svg',
    }),
  ],

  module: {
    rules: [
      {
        test: /\.ts?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },

      { test: /\.(?:ico|gif|png|jpg|jpeg|svg|mp4)$/i, type: 'asset/resource' },
    ],
  },

  resolve: {
    extensions: ['.ts', '...'],
  },
};
