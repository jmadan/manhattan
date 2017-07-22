var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
let rp = require('request-promise');
let cheerio = require('cheerio');
let Story = require('../models/story');
let rq = require('request');
let fs = require('fs');
let natural = require('natural');

stemmer = natural.PorterStemmer;
stemmer.attach();

router.use((req, res, next) => {
	console.log('story route - time: ', Date.now());
	console.log(req.path);
	next();
});

router.get('/getstory/:storyid', (req, res) => {
	Story.find({
		storyId: req.params.storyid
	}, (err, doc) => {
		if (!err) {
			if (doc.length != 0) {
				res.json({
					status: 'success',
					data: doc
				});
			} else {
				res.json({
					status: 'Not Found',
					error: 'ID does not exists!'
				});
			}
		} else {
			res.json({
				status: 'failed',
				error: err.message
			});
		}
	});
});

router.get('/delete/:storyid', (req, res) => {
	Story.remove({
		storyId: req.params.storyid
	}, (err) => {
		if (!err) {
			res.json({
				status: 'success',
				data: 'Deleted'
			});
		} else {
			res.json({
				status: 'Error',
				error: 'Try again you Maggot!'
			});
		}
	});
});

router.get('/getbody/:storyid', (req, res) => {
	Story.find({
		storyId: req.params.storyid
	}, (err, doc) => {
		if (!err) {
			if (doc.length > 0 && doc[0].url) {
				console.log(doc[0].url);
				rp(doc[0].url).then((html) => {
					var parsedHTML = cheerio.load(html, {
						normalizeWhitespace: true
					});
					// console.log(parsedHTML('div').text());

					// txt = S($).collapseWhitespace().s;
					// let script_pattern = [/<style((.|\W)+?)\<\/style\>/g, /<noscript((.|\W)+?)\<\/noscript\>/g, /<script(.+?)\>(.+?)\<\/script\>/g, /<script\>(.+?)\<\/script\>/g, /<script((.|\W)+?)\<\/script\>/g];
					// let script_pattern = [/<style((.|\W)+?)\<\/style\>/g, /<noscript((.|\W)+?)\<\/noscript\>/g, /<script type=\"text\/javascript\"\>((.|\W)+?)\<\/script\>/g, /<script\>(.+?)\<\/script\>/g, /<script(.+?)\>(.+?)\<\/script\>/g];
					// script_pattern.forEach((pat) => {
					// 	console.log(pat);
					// 	txt = txt.replace(pat, '');
					// });
					res.json({
						status: 'success',
						data: parsedHTML('p').text().tokenizeAndStem()
					});
				}).catch((err) => {
					res.json({
						status: 'error',
						error: err.message
					});
				});
			} else {
				res.json({
					status: 'Error',
					error: 'Something wrong with URL or it does not exists!'
				});
			}
		} else {
			res.json({
				status: 'failed',
				error: err.message
			});
		}
	});
});

router.get('/category/:category', (req, res) => {
	Story.find({
		category: req.params.category
	}, (err, docs) => {
		if (!err) {
			if (docs.length != 0) {
				res.json({
					status: 'success',
					data: docs
				});
			} else {
				res.json({
					status: 'Not Found',
					error: 'Search got nothing'
				});
			}
		} else {
			res.json({
				status: 'failed',
				error: err.message
			});
		}
	});
});

router.get('/categorized', (req, res) => {
	console.log("I am here");
	Story.find({
		category: {
			$ne: 'uncategorized'
		}
	}, (err, docs) => {
		if (!err) {
			if (docs.length != 0) {
				res.json({
					status: 'success',
					data: docs
				});
			} else {
				res.json({
					status: 'Not Found',
					error: 'Search got nothing'
				});
			}
		} else {
			res.json({
				status: 'failed',
				error: err.message
			});
		}
	});
});

router.put('/update', (req, res) => {
	if (req.body) {
		Story.findById(req.body.id, (err, doc) => {
			if (!err) {
				doc.category = req.body.category;
				doc.save((err) => {
					if (err) {
						res.json({
							status: 'error',
							error: err.message
						});
					} else {
						res.json({
							status: 'success',
							data: doc
						});
					}
				});
			}
		});
	} else {
		res.json({
			status: 'error',
			error: 'Empty request body'
		});
	}
});

router.get('/updatestorydb', (req, res) => {
	var startItem, currentMax;
	getHNMaxStoryInDB().then((doc) => {
		startItem = parseInt(doc[0].storyId, 10) + 1;
		rq("https://hacker-news.firebaseio.com/v0/maxitem.json?print=pretty", (err, response, maxItem) => {
			if (!err) {
				currentMax = parseInt(maxItem, 10);
				console.log("{'maxItemInDB':" + startItem + ", 'currentItem':" + currentMax + "}");
				console.log("difference: ", currentMax - startItem);
				console.log(typeof currentMax);
				console.log(typeof startItem);
				for (var i = startItem; i < startItem + 20; i++) {
					let url = "https://hacker-news.firebaseio.com/v0/item/" + i + ".json?print=pretty";
					console.log(url);
					rq(url, (err, response, itemBody) => {
						if (!err) {
							if (itemBody.type == "story" && itemBody.url) {
								console.log(itemBody);
								// rq(body.url, (err, response, html) => {
								// 	if (!err && response.statusCode == 200) {
								// 		var parsedHTML = cheerio.load(html, {
								// 			normalizeWhitespace: true
								// 		});
								// 		console.log("Item: ", body.id);
								saveDocuments(itemBody.id, itemBody.title, itemBody.url, itemBody.type, itemBody.time, itemBody.score, 'No Body', 'uncategorized');
								// 	}
								// });
							} else {
								console.log(itemBody.type);
							}
						} else {
							console.log(err);
						}
					});
				}

			}
		});
	}).catch((err) => {
		console.log(err);
	});
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

router.get('/gethndata', (req, res) => {
	// Get the max item from the DB abd compare it against what the feed gives to get the delta items
	// getHNMaxStoryInDB().then((maxdoc) => {
	// 	return maxdoc[0].storyId;
	// }).catch((err) => {
	// 	console.log(err.message)
	// });

	// let maxStoryAtHN = rp("https://hacker-news.firebaseio.com/v0/maxitem.json\?print\=pretty").then((response) => {
	// 	return ({
	// 		status: 'success',
	// 		data: response
	// 	});
	// }).catch((err) => {
	// 	console.log(err);
	// });



	// rp("https://hacker-news.firebaseio.com/v0/newstories.json?print=pretty").then((jsonBody) => {
	// 	var storyArray = JSON.parse(jsonBody);
	// 	return storyArray;
	// }).then((jsonArray) => {
	// 	for (i = 0; i < jsonArray.length; i++) {
	// 		var url = "https://hacker-news.firebaseio.com/v0/item/" + jsonArray[i] + ".json?print=pretty";
	// 		rq(url, (err, response, body) => {
	// 			if (!err && response.statusCode == 200) {
	// 				var st = JSON.parse(body);
	// 				if (st.type && st.type === 'story') {
	// 					saveDocuments(st.id, st.title, st.url, st.type, st.time, st.score);
	// 				} else {
	// 					console.log("check this ID: ", st.storyId);
	// 				}
	// 			}
	// 		});
	// 	}

	// }).catch((err) => {
	// 	console.log(err.message);
	// })
});

router.get('/getStoryData', (req, res) => {
	getDocuments().then((docs) => {
		for (i = 0; i < docs.length; i++) {
			if (docs[i].bodyText == 'No Body' && docs[i].url != null) {
				getDocumentBody(docs[i]);
			} else {
				console.log("nothing to do for: ", docs[i].storyId);
			}
		}
	}).catch((err) => {
		console.log("reported by me: ", err);
	});
});

router.get('/gettokens', (req, res) => {
	Story.find({
		category: {
			$ne: 'uncategorized'
		}
	}, (err, docs) => {
		if (!err && docs.length != 0) {
			for (i = 0; i < docs.length; i++) {
				docs[i].features = docs[i].bodyText.tokenizeAndStem();
				docs[i].save((err) => {
					if (err) {
						console.log(err);
					}
				});
			}
			res.json({
				status: 'success',
				data: "all saved"
			});
		} else {
			res.json({
				status: 'failed',
				error: err.message
			});
		}
	});
});

function getDocumentBody(doc) {
	console.log(doc.url + " --- " + doc.storyId);
	rq(doc.url, (err, response, html) => {
		if (!err) {
			var parsedHTML = cheerio.load(html, {
				normalizeWhitespace: true
			});

			// let script_pattern = [/<style((.|\W)+?)\<\/style\>/g, /<noscript((.|\W)+?)\<\/noscript\>/g, /<script((.|\W)+?)\<\/script\>/g, /<script(.+?)\>(.+?)\<\/script\>/g, /<script\>(.+?)\<\/script\>/g];
			doc.bodyText = parsedHTML('p').text();
			doc.features = parsedHTML('p').text().tokenizeAndStem();
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
		features: features,
		category: category
	});
	st.save((err) => {
		if (err) {
			console.log("error saving this document: ", st.storyId);
		}
	});
}

getHNMaxStoryInDB = () => {
	var query = Story.find().sort({
		storyId: -1
	}).limit(1);
	return query.exec();
}

getHNLatestStory = () => {
	rp("https://hacker-news.firebaseio.com/v0/maxitem.json\?print\=pretty").then((response) => {
		return ({
			status: 'success',
			data: response
		});
	}).catch((err) => {
		console.log(err);
	});
}

module.exports = router;