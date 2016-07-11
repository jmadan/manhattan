var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
let rp = require('request-promise');
let cheerio = require('cheerio');
let story = require('../models/story');
let fs = require('fs');
let rq = require('request');


router.use((req, res, next) => {
	console.log('story route - time: ', Date.now());
	next();
});

router.get('/gethnlist', (req, res) => {
	story.connectDB();
	rp("https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty").then((jsonBody) => {
		var storyArray = JSON.parse(jsonBody);
		return storyArray;
	}).then((jsonArray) => {
		for (i = 0; i < jsonArray.length - 100; i++) {
			var url = "https://hacker-news.firebaseio.com/v0/item/" + jsonArray[i] + ".json?print=pretty";
			rp(url).then((data) => {
				var st = JSON.parse(data);
				if (st.type === 'story') {
					story.saveDocuments(st.id, st.title, st.url, st.type, st.time, st.score);
				}
			});
		}
	}).catch((err) => {
		console.log(err.message);
	})

});

router.get('/getStoryData', (req, res) => {
	console.log(req.url);
	story.getDocuments().then((docs) => {
		for (i = 0; i < docs.length; i++) {
			if (docs[i].bodyText == 'No Body' && docs[i].url != null) {
				getDocumentBody(docs[i]);
			} else {
				console.log("nothing to do for: ", docs[i].storyId);
			}
		}
	}).catch((err) => {
		console.log(err);
	}).done(() => {
		res.json("finished");
	});
});

function getDocumentBody(doc) {
	console.log(doc.url + " --- " + doc.storyId);
	rq(doc.url, (err, response, body) => {
		if (!err && response.statusCode == 200) {
			var $ = cheerio.load(body);
			doc.bodyText = $('body').text();
			doc.save((err) => {
				if (err) {
					console.log(err);
					return err.message;
				}
				return "saved";
			});
		} else {
			return "something fishy: " + doc.storyId;
		}
	});
}
// (<([^>]+))([^>])
// /<(script)[^\n\r]+>/

module.exports = router;