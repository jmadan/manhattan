let express = require('express');
let router = express.Router();
import * as admin from '../modules/admin';
import * as article from '../modules/article';
import * as cronjob from '../modules/cronjobs';

router.use((req, res, next) => {
	console.log('Request Time: ', Date.now());
	console.log(req.path);
	next();
});

router.get('/', (req, res) => {

	let taskStatus={
		'name': '',
		'status': '',
		'initialHNFeed': false,
		'hnFeedDetail': false,
		'feedItemBody': false
	};

	switch (req.query.task) {
		case 'start':
			console.log("Starting all the cron jobs...");
			cronjob.getHackerNewsFeed.start();
			cronjob.getHackerNewsFeedMetaData.start();
			cronjob.gethackerNewsFeedItemBody.start();
			break;
		case 'stop':
			console.log("Stopping all the cron jobs...");
			cronjob.getHackerNewsFeed.stop();
			cronjob.getHackerNewsFeedMetaData.stop();
			cronjob.gethackerNewsFeedItemBody.stop();
			break;
		case 'startfeed':
			console.log("starting initial HN Feed job");
			cronjob.getHackerNewsFeed.start();
			taskStatus.initialHNFeed = true;
			break;
		case 'stopfeed':
			console.log("stopping initial HN Feed job");
			cronjob.getHackerNewsFeed.stop();
			taskStatus.initialHNFeed = false;
			break;
		case 'startfeeddetail':
			console.log("starting get HN Feed detail job");
			cronjob.getHackerNewsFeedMetaData.start();
			taskStatus.hnFeedDetail = true;
			break;
		case 'stopfeeddetail':
			console.log("stopping get initial HN Feed detail job");
			cronjob.getHackerNewsFeedMetaData.stop();
			taskStatus.hnFeedDetail = false;
			break;
		case 'startfeeditembody':
			console.log("starting Feed Item Body HN job");
			cronjob.gethackerNewsFeedItemBody.start();
			taskStatus.feedItemBody = true;
			break;
		case 'stopfeeditembody':
			console.log("stopping Feed Item Body HN job");
			cronjob.gethackerNewsFeedItemBody.stop();
			taskStatus.feedItemBody = false;
			break;
		default:
			console.log("your command is not my wish!");
	}
	res.render('admin', {homepage: true, task_status: taskStatus});
});

//route - return list of articles based on the list limit and if they have been classified or not
router.get('/articles', (req, res) => {
	let category = req.query.category;
	let list_limit = req.query.limit;
	if(!category) {
		res.render('error', {message: 'Invalid url!'});
	} else {
		admin.getdocuments(list_limit, category).then((result) => {
				if(result.error) {
					res.render('error', {message: result.error});
				} else{
					let payload = {article_list: result.list, list_empty: result.list.length == 0 ? true : false};
					res.render('admin', payload);
				}
		});
	}
});

router.get('/article/:id', (req, res) => {
	admin.getdocument(req.params.id).then((result) => {
		if(result.error) {
			res.render('error', {message: result.error});
		}
		res.render('article', {article: result.list, error: req.query.err, msg: req.query.msg, err: req.query.err});
	});
});

router.get('/article/edit/:id', (req, res) => {
	admin.getdocument(req.params.id).then((result) => {
		if(result.error) {
			res.render('error', {message: result.error});
		}
		res.render('article', {article: result.list});
	});
});

router.get('/article/delete/:id', (req, res) => {
	article.deleteDocument(req.params.id).then((result) => {
		if(result.error) {
			res.render('error', {message: result.error});
		}
		res.redirect('/admin/articles?limit=10&category=false');
	});
});

router.post('/article', (req, res) => {
	article.updateDocument(req.body).then((response) => {
		if(response.error == false){
			setTimeout(res.redirect(req.originalUrl+"/"+req.body.hn_id+"?msg=updated"), 1000);
		} else {
			console.log(response.error);
			setTimeout(res.redirect(req.originalUrl+"/"+req.body.hn_id+"?err=error"), 1000);
		}
	});
});

router.get('/article/body/:id', (req, res) => {
	res.send("this has to be implemented");
});

router.get('/article/stem/:id', (req, res) => {
	res.send("this has to be implemented");
});

router.get('/neural', (req, res) => {
	res.render('neural');
});

router.get('/article/later/:id', (req, res) => {
	let articleId = req.params.id;
	if(articleId !== undefined) {
		article.changeStatus(articleId, 'refresh').then((result) => {
			if(result.error) {
				res.render('error', {message: result.error});
			} else {
				res.redirect('/admin/articles?limit=10&category=false');
			}
		});
	}
});


module.exports = router;
