var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');

var app = express();

app.use(morgan('combined', {
	skip: function(req, res) {
		return res.statusCode < 400
	}
}));
app.use(bodyParser.json());

var hn = require('./routes/hnroute');
let story = require('./routes/storyroute');

app.get('/', function(req, res) {
	res.json('Manhattan Project');
});

app.use('/hn', hn);
app.use('/stories', story);

app.listen(3000, function() {
	// news.getNews();
	console.log("Server Listening at 3000 port");
});