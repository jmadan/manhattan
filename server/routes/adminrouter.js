let express = require('express');
let router = express.Router();
import admin from '../modules/admin';
import * as cron from '../app';

router.use((req, res, next) => {
	console.log('Request Time: ', Date.now());
	console.log(req.path);
	next();
});

router.get('/', (req, res) => {

	let taskStatus={
		'initialHNFeed': false,
		'hnFeedDetail': false,
		'feedItemBody': false
	};

	switch (req.query.task) {
		case 'startfeed':
			cron.getinitialHNFeed.start();
			taskStatus.initialHNFeed = true;
			break;
		case 'stopfeed':
			cron.getinitialHNFeed.stop();
			taskStatus.initialHNFeed = false;
			break;
		case 'startfeeddetail':
			cron.getHNFeedDetail.start();
			taskStatus.hnFeedDetail = true;
			break;
		case 'stopfeeddetail':
			cron.getHNFeedDetail.start();
			taskStatus.hnFeedDetail = false;
			break;
		case 'startfeeditembody':
			cron.getFeedItemBody.start();
			taskStatus.feedItemBody = true;
			break;
		case 'stopfeeditembody':
			cron.getFeedItemBody.start();
			taskStatus.feedItemBody = false;
			break;
	}
	res.render('admin', {homepage: true, task_status: taskStatus});
});

router.get('/articles', (req, res) => {
	let cat = req.query.category;
	let article_limit = req.query.limit;
	admin.getdocuments(article_limit, cat).then((result) => {
		if(result.error) {
			res.render('error', {message: result.error});
		} else{
			res.render('admin', { article_list: result.article_list});
		}
	});
});

router.get('/article/:id', (req, res) => {
	admin.getdocument(req.params.id).then((result) => {
		if(result.error) {
			res.render('error', {message: result.error});
		}
		res.render('article', {article: result.article_list});
	});
});

router.get('/feed/:category', (req, res) => {
	Feed.getFeed(req.params.category).then(feed => res.json({
		message: "Feed based on the category",
		success: true,
		feed: feed
	}));
});

router.post('/feed/update/story', (req, res) => {
	Feed.updateStory(req.body.storyId, req.body.category).then(doc => res.json({
		message: "Story Updated!",
		success: true,
		story: doc
	}));
});

router.delete('/feed/delete/:storyId', (req, res) => {
	let result = Feed.deleteStory(req.params.storyId);
	if (result == undefined) {
		res.json({
			message: "story deleted",
			success: true
		});
	} else {
		res.json({
			message: result,
			error: true
		});
	}
});

router.get('/category/all', (req, res) => {
	Category.getCategories().then((categories) => {
		res.json({
			message: "All Categories",
			success: true,
			categories: categories
		});
	});
});

router.post('/category/create', (req, res) => {
	Category.createCategory(req.body.category, req.body.description).then((category) => {
		res.json({
			message: "Category saved!",
			success: true,
			category: category
		});
	});
});

module.exports = router;
