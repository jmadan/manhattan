let webpack = require('webpack');
let path = require('path');

module.exports = {
	entry: './client/app.js',
	output: {
		path: './app/public/js',
		filename: 'bundle.js'
	},
	module: {
		loaders: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
			},
			{
				test: /\.css$/,
				loader: 'style!css'
			}
		]
	}
};