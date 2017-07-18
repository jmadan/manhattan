let webpack = require('webpack');
let path = require('path');
const nodeExternals = require('webpack-node-externals');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const PATHS = {
    build: path.join(__dirname, '/build')
};

module.exports = {
	devtool: 'source-map',
  target: 'node',
  externals: [nodeExternals()],
  context: path.resolve(__dirname, './src'),
	entry: './index.js',
	output: {
		path: PATHS.build,
		filename: 'bundle.js'
	},
  module:{
    rules: [
      {test: /\.(js)$/, exclude: /node_modules/, include: path.resolve('./src'), use: [{loader: 'babel-loader', options: {presets: ['es2015']}}]},
      {test: /\.css$/,use: ['style-loader','css-loader']},
      {test: /\.(png|svg|jpg|gif)$/, use: ['file-loader']},
      {test: /\.(woff|woff2|eot|ttf|otf)$/, use: ['file-loader']}
    ]
  },
  resolve: {
    modules: [path.resolve(__dirname, './src'), 'node_modules']
  },
	plugins: [
        new CleanWebpackPlugin([PATHS.build], {
            root: process.cwd()
        })
    ]
};
