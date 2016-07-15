var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
let docDB = require('./modules/docDB');
let HNRoute = require('./routes/hnroute');
var app = express();

app.use(morgan('combined', {
	skip: function(req, res) {
		return res.statusCode < 400
	}
}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
	res.json("{message: 'Hello Manhattan'}");
});
app.get('/api/', function(req, res) {
	res.json({
		message: 'Manhattan API Home'
	});
});

app.use('/api/stories', HNRoute);

app.listen(3000, function() {
	// news.getNews();
	docDB.connectDB();
	console.log("Server Listening at 3000 port");
});