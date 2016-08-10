let webpack = require('webpack');
let path = require('path');

module.exports = {
	devtool: 'source-map',
	entry: ['webpack/hot/dev-server','webpack-hot-middleware/client','./client/manhattan.js'],
	output: {
		path: '/',
		filename: 'application.js',
		publicPath: 'http://localhost:3000/js/',
	},
	module: {
		loaders: [
			{
				test: /client\/.+.js$/,
				exclude: /node_modules/,
				loader: 'babel-loader',
				query: {
					"presets": [
						"react", "es2015", "stage-0"
					]
				}
			}
		]
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin()
	]
};