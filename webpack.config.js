let webpack = require('webpack');
let path = require('path');
const CleanWebpackPlugin = require('clean-webpack-plugin');

const PATHS = {
    build: path.join(__dirname, '/build')
};

module.exports = {
	devtool: 'source-map',
	entry: './server/index.js',
	output: {
		path: PATHS.build,
		filename: 'server.js'
	},
	module: {
		loaders: [{
			test: /\.js$/,
			exclude: /node_modules/,
			loader: 'babel'
		}]
	},
	plugins: [
        new CleanWebpackPlugin([PATHS.build], {
            root: process.cwd()
        })
    ]
};