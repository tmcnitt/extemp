var path = require('path');
var webpack = require('webpack');
module.exports = {
  entry: './src/index.js',
  output: {
    path: __dirname,
    filename: '../build/bundle.js'
  },

  target: 'electron-renderer',
  externals: {
	  bindings: 'require("bindings")'
  },

  mode: 'development',

  devtool: 'source-map',
  module: {
    rules: [{
      test: /\.js$/,
      loader: 'babel-loader',
	  exclude: /node_modules/,
      query: {
        presets: ['@babel/preset-env', '@babel/react'],
      }
    }]
  },
};
