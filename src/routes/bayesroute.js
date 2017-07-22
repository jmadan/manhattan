'use strict;'

let express = require('express');
let bayes = require('bayes');
let Story = require('../models/story');
var router = express.Router();
let natural = require('natural');
// let classifier = bayes({
// 	tokenizer: function(text) {
// 		return text.split(' ')
// 	}
// });
stemmer = natural.PorterStemmer;
stemmer.attach();

let classifier = new natural.BayesClassifier();

router.use((req, res, next) => {
	console.log('story route - time: ', Date.now());
	console.log(req.path);
	next();
});

router.get('/reloadmodel', (req, res) => {
	Story.find({
		category: {
			$ne: 'uncategorized'
		}
	}, (err, docs) => {
		if (!err) {
			console.log(docs.length);
			docs.forEach((doc) => {
				let temp = doc.category.split(',');
				for (i = 0; i < temp.length; i++) {
					console.log(doc.title + "-------" + temp[i]);
					// classifier.learn(doc.bodyText, temp[i].trim());
					classifier.addDocument(doc.features, temp[i].trim());
				}
			});
			classifier.train();
			res.json({
				status: 'success',
				data: 'Model Trained!'
			});
		}
	});
});


router.post('/classifystory', (req, res) => {
	Story.find({
		storyId: req.body.storyid
	}, (err, doc) => {
		if (!err) {
			// doc[0].category = classifier.categorize(doc[0].bodyText);
			doc[0].category = classifier.classify(doc[0].bodyText.tokenizeAndStem());
			console.log(classifier.getClassifications(doc[0].bodyText.tokenizeAndStem()));
			res.json({
				status: "success",
				data: doc[0]
			});
		} else {
			res.json({
				status: 'error',
				error: err.message
			});
		}
	});
});

module.exports = router;