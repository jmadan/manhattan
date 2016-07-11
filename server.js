var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
let docDB = require('./modules/docDB');
let story = require('./routes/storyroute');
var app = express();

app.use(morgan('combined', {
	skip: function(req, res) {
		return res.statusCode < 400
	}
}));
app.use(bodyParser.json());

app.get('/', function(req, res) {
	res.json('Manhattan Project');
});

app.use('/stories', story);

app.listen(3000, function() {
	// news.getNews();
	docDB.connectDB();
	console.log("Server Listening at 3000 port");
});