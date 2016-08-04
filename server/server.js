var express = require('express');
var path = require('path');
var morgan = require('morgan');
var bodyParser = require('body-parser');
let docDB = require('./modules/docDB');
let storyRoute = require('./routes/hnroute');
let bayesRoute = require('./routes/bayesroute');
let expressHbs = require('express-handlebars');
var app = express();

app.use(morgan('combined', {
	skip: function(req, res) {
		return res.statusCode < 400
	}
}));

app.set('view engine', 'hbs');

app.use(express.static('app/public'));

app.engine('hbs', expressHbs({
	extname: '.hbs',
	layoutsDir: './app/views/layouts/',
	partialsDir: './app/views/partials/',
	defaultLayout: 'main'
}));

app.set('views', path.resolve('app/views'));

app.use(bodyParser.json());

app.get('/', (req, res) => {
	res.render('index');
});
app.get('/api/', function(req, res) {
	res.json({
		message: 'Manhattan API Home'
	});
});

app.use('/api/story', storyRoute);
app.use('/api/bayes', bayesRoute);

app.listen(3000, function() {
	// news.getNews();
	docDB.connectDB();
	console.log("Server Listening at 3000 port");
});