var express = require('express');
var router = express.Router();
import * as Feed from '../modules/feed';
import * as User from '../modules/user';
import * as Category from '../modules/category';

router.use((req, res, next) => {
	console.log('story route - time: ', Date.now());
	console.log(req.path);
	next();
});

router.get('/', (req, res) => {
	res.json({
		message: "Need to call specific end points to get data",
		error: true
	});
});

router.get('/user/:userEmail', (req, res) => {
	res.json({
		user: {},
		message: "user info",
		success: true
	});
});

router.post('/user/saveinterest', (req, res) => {
	res.json({
		message: "User interest saved!",
		success: true,
		user: {}
	});
});

router.post('/user/updateinterest', (req, res) => {
	res.json({
		message: "User interest updated!",
		success: true,
		user: {}
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

export default router;
