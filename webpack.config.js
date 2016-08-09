let webpack = require('webpack');
let path = require('path');

module.exports = {
	devtool: 'source-map',
	entry: ['./client/manhattan'],
	output: {
		path: __dirname + '/app/public/js',
		filename: 'superman.js',
		publicPath: __dirname + '/app/public/js',
	},
	module: {
		loaders: [
			{
				test: /client\/.+.js$/,
				exclude: /node_modules/,
				loader: 'babel-loader'
			}
		]
	}
};