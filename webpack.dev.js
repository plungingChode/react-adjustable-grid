'use strict';
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');
const webpack = require('webpack');

module.exports = {
  mode: 'development',
  context: __dirname,
  entry: './examples/index.tsx',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
    sourceMapFilename: '[file].map',
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          cacheDirectory: true
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'examples/index.html'),
      filename: 'index.html',
    }),
  ],
  devtool: 'eval',
  devServer: {
    compress: true,
    port: 3000,
    open: 'index.html',
    client: {
      overlay: true,
    },
    static: {
      directory: '.'
    }
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  }
}