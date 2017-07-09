let express = require('express');
let router = express.Router();
import admin from '../modules/admin';
import * as cron from '../app';
import * as cronjob from '../modules/cronjobs';

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
		case 'start':
			console.log("starting all the cron jobs...");
			break;
		case 'startfeed':
			console.log("starting the Job");
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
			cron.getHNFeedDetail.stop();
			taskStatus.hnFeedDetail = false;
			break;
		case 'startfeeditembody':
			cron.getFeedItemBody.start();
			taskStatus.feedItemBody = true;
			break;
		case 'stopfeeditembody':
			cron.getFeedItemBody.stop();
			taskStatus.feedItemBody = false;
			break;
		default:
			console.log("your command is not my wish!");
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

module.exports = router;
