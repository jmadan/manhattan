var express = require('express');
var router = express.Router();
var hackerNews = require('../models/story');
var mongoose = require('mongoose');
var Q = require('q');
var https = require('https');
var fs = require('fs');

router.use((req, res, next) => {
	console.log('time: ', Date.now());
	next();
});

router.get('/', (req, res) => {
	hackerNews.getDocuments().then((docs) => {
		console.log(docs);
		res.json(docs);
	}).done(() => {
		mongoose.disconnect();
	});
});

router.get('/gethn', (req, res) => {
	https.get("https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty", (results) => {
		results.on('data', (d) => {
			var storyArray = JSON.parse(d);
			for (i = 0; i < storyArray.length - 100; i++) {
				var url = "https://hacker-news.firebaseio.com/v0/item/" + storyArray[i] + ".json?print=pretty";
				console.log("url: ", url);
				https.get(url, function(res) {
					res.on('data', (data) => {
						var story = JSON.parse(data);
						if (story.type === 'story') {
							hackerNews.saveDocuments(story.id, story.title, story.url, story.type, story.time, story.score);
						}
					});
				});
			}
		});
	});
	res.json("done");
});


module.exports = router;