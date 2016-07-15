var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
let rp = require('request-promise');
let cheerio = require('cheerio');
let Story = require('../models/story');
let fs = require('fs');
let rq = require('request');


router.use((req, res, next) => {
	console.log('story route - time: ', Date.now());
	next();
});

router.get('/getMaxHNStory', (req, res) => {
	let maxItem;
	getHackerNewsMaxStory().then((doc) => {
		// console.log(JSON.stringify(doc));
		res.json("maxItem: " + doc[0].storyId);
	}).catch((err) => {
		console.log(err.message)
	});
});

router.get('/getHNDelta', (req, res) => {
	getHackerNewsMaxStory().then((doc) => {
		return doc[0].storyId;
	}).then((maxItem) => {
		console.log("maxItem: ", maxItem);
		rq("https://hacker-news.firebaseio.com/v0/maxitem.json\?print\=pretty", (err, response, body) => {
			if (!err && response.statusCode == 200) {
				let currentMax = body;
				// for (i = maxItem; i < currentMax; i++) {
				// 	var url = "https://hacker-news.firebaseio.com/v0/item/" + i + ".json?print=pretty";
				// 	rq(url, (err, response, body) => {
				// 		if (!err && response.statusCode == 200) {
				// 			var st = JSON.parse(body);
				// 			if (st.type === 'story') {
				// 				story.saveDocuments(st.id, st.title, st.url, st.type, st.time, st.score);
				// 			}
				// 		}
				// 	});
				// }
				res.json("{'maxItem':" + maxItem + ", 'currentItem':" + currentMax + "}");
			}
		})
	}).catch((err) => {
		console.log(err.message)
	});
});

router.get('/gethnlist', (req, res) => {
	rp("https://hacker-news.firebaseio.com/v0/newstories.json?print=pretty").then((jsonBody) => {
		var storyArray = JSON.parse(jsonBody);
		return storyArray;
	}).then((jsonArray) => {
		for (i = 0; i < jsonArray.length; i++) {
			var url = "https://hacker-news.firebaseio.com/v0/item/" + jsonArray[i] + ".json?print=pretty";
			rq(url, (err, response, body) => {
				if (!err && response.statusCode == 200) {
					var st = JSON.parse(body);
					if (st.type && st.type === 'story') {
						saveDocuments(st.id, st.title, st.url, st.type, st.time, st.score);
					} else {
						console.log("check this ID: ", st.storyId);
					}
				}
			});
		}

	}).catch((err) => {
		console.log(err.message);
	})

});

router.get('/getStoryData', (req, res) => {
	console.log(req.url);
	getDocuments().then((docs) => {
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
			let script_pattern = [/<script((.|\W)+?)\<\/script\>/g, /<script(.+?)\>(.+?)\<\/script\>/g, /<script\>(.+?)\<\/script\>/g];
			// let script_pattern_2 = /<script\>(.+?)\<\/script\>/g;
			script_pattern.forEach((pattern) => {
				body = body.replace(pattern, '');
			});
			// let txt = body.replace(script_pattern_1, '');
			// txt = txt.replace(script_pattern_2, '');
			var $ = cheerio.load(body);
			// let bodyTxt = $('body').text();

			doc.bodyText = $('body').text().trim();
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

//1.  (<script(.+?)\>)(.+?)\/script>
// /<script(.+?)\>(.+?)\<\/script\>/g
//<script\>([\s\S]+?)<\/script\>

getDocuments = (options) => {
	if (options == null) {
		options = {}
	}
	var query = Story.find(options);
	return query.exec();
}

saveDocuments = (storyId, title, url, storyType, timeSubmitted, score, bodyText, category) => {
	var st = new Story({
		storyId: storyId,
		title: title,
		url: url,
		storyType: storyType,
		timeSubmitted: timeSubmitted,
		score: score,
		bodyText: bodyText,
		category: category
	});
	st.save((err) => {
		if (err) {
			console.log("error saving this document: ", st.storyId);
		}
	});
}

getHackerNewsMaxStory = () => {
	var query = Story.find().sort({
		storyId: -1
	}).limit(1);
	return query.exec();
}

module.exports = router;