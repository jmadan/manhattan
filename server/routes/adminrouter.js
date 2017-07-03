let express = require('express');
let router = express.Router();
import admin from '../modules/admin';

router.use((req, res, next) => {
	console.log('Request Time: ', Date.now());
	console.log(req.path);
	next();
});

router.get('/', (req, res) => {
	res.render('admin');
});

router.get('/all-articles', (req, res) => {
	admin.getalldocuments(req.query.docs).then((result) => {
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
