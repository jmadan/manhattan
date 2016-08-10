let express = require('express');
let path = require('path');
let bodyParser = require('body-parser');
let webpack = require('webpack');
let config = require('../config/webpack.config.dev.js');

let exphbs = require('express-handlebars');
let webpackDevMiddleware = require('webpack-dev-middleware');
let webpackHotMiddleware = require('webpack-hot-middleware');

let app = express();
let compiler = webpack(config);

app.use(webpackDevMiddleware(compiler, {
	noInfo: true,
	lazy: true,
	quite: false,
	publicPath: config.output.publicPath,
	stats: {colors: true}
}));

app.use(webpackHotMiddleware(compiler,{
	log: console.log
}));

app.engine('hbs', exphbs({
	layoutsDir: './app/views',
	partialsDir: './app/views/partials',
	extname: '.hbs'
}));

app.set('views', './app/views');
app.set('view engine', 'hbs');

app.use('/',express.static('app/public'));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({extended: true}));

app.use(function(req, res, next) {
    // Set permissive CORS header - this allows this server to be used only as
    // an API server in conjunction with something like webpack-dev-server.
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Disable caching so we'll always get the latest comments.
    res.setHeader('Cache-Control', 'no-cache');
    next();
});

app.get('/', (req, res) => {
	res.render('index');
});

server = app.listen(3000, 'localhost', function(err) {
	if(err) {
		console.log(err);
		return;
	}

	console.log("Server started http://localhost:3000");
});