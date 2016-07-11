var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var https = require('https');
let cheerio = require('cheerio');
let story = require('../models/story');


router.use((req, res, next) => {
	console.log('time: ', Date.now());
	next();
});

router.get('/getMetaData', (req, res) => {
	readMetaData();
	res.json('getting Meta Data');
});

function readMetaData() {
	story.connectDB();
	story.getMetaDataByID("12057192").then((doc) => {
		if (!doc.metaData) {
			console.log("doc: ", doc[0]);
			console.log('MetaData does not exists');
			https.get(doc[0].url, (result) => {
				result.on('data', (d) => {
					var $ = cheerio.load(d);
					console.log($('meta'));
				});
			});
		}
	}).done(() => {
		story.disconnectDB();
	});
}


module.exports = router;