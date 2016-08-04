var https = require('https');

var Story = require('../models/story');

var Server = mongodb.Server,
	Db = mongodb.Db,
	BSON = mongodb.BSONPure;

var server = new Server('localhost', 27017, {
	auto_reconnect: true
});
db = new Db('niteowl', server);

db.open(function(err, db) {
	if (!err) {
		console.log("Connected to 'niteowl' database");
		db.collection('stories', {
			strict: true
		}, function(err, collection) {
			if (err) {
				console.log("The 'stories' collection doesn't exist. Please create some sample data");
			}
		});
	}
});

var populateDB = (news) => {

	var hnNews = db.collection('stories');

	hnNews.insert(news, (err, result) => {
		if (err) {
			console.log(err);
		} else {
			console.log('Document inserted in stories collection');
		}
	});

};

exports.getNews = () => {

	var stories = [];
	var news = [];
	var hnNews = db.collection('stories');
	https.get("https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty", (res) => {
		res.on('data', (d) => {
			stories = JSON.parse(d);
			for (i = 0; i < stories.length; i++) {
				https.get("https://hacker-news.firebaseio.com/v0/item/" + i + ".json?print=pretty", function(res) {
					res.on('data', (d) => {
						var data = JSON.stringify(d);
						var news = Story.story(data.id, data.title, data.url, data.type, data.time, data.score);
						hnNews.insert(news, (err, result) => {
							if (err) {
								console.log(err);
							}
						});
					});
				});
			}
			console.log("Documents added!")
			db.close();
		});
		res.on('error', (e) => {
			console.log(e.message);
		});
	});

}