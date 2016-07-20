'use strict;'

let express = require('express');
let bayes = require('bayes');
let Story = require('../models/story');
var router = express.Router();
let classifier = bayes();

router.use((req, res, next) => {
	console.log('story route - time: ', Date.now());
	console.log(req.path);
	next();
});

router.get('/trainingdata', (req, res) => {
	Story.find({
		category: {
			$ne: 'uncategorized'
		}
	}, (err, docs) => {
		if (!err) {
			var tx = '';
			docs.forEach((doc) => {
				console.log(doc.title + "-------" + doc.category);
				classifier.learn(doc.bodyText, doc.category);
			});

			// for (count = 0; count < docs.length; count++) {
			// 	let script_pattern = [/(\\n|\\r)+/g, /(\\\")/g, /<script((.|\W)+?)\<\/script\>/g, /<script(.+?)\>(.+?)\<\/script\>/g, /<script\>(.+?)\<\/script\>/g];
			// 	script_pattern.forEach((pattern) => {
			// 		let text = docs[count].body.replace(pattern, '');
			// 	});
			// 	classifier.learn(text, docs[count].category);
			// }
			// res.json(classifier.toJson());
			res.json(classifier.toJson());
		}
	});
});

module.exports = router;