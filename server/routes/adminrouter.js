let express = require('express');
let router = express.Router();
import * as admin from '../modules/admin';
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
			cronjob.getinitialHNFeed.start();
			cronjob.getHNFeedDetail.start();
			cronjob.getFeedItemBody.start();
			break;
		case 'stop':
			console.log("Stopping all the cron jobs...");
			cronjob.getinitialHNFeed.stop();
			cronjob.getHNFeedDetail.stop();
			cronjob.getFeedItemBody.stop();
			break;
		case 'startfeed':
			console.log("starting initial HN Feed job");
			cronjob.getinitialHNFeed.start();
			taskStatus.initialHNFeed = true;
			break;
		case 'stopfeed':
			console.log("stopping initial HN Feed job");
			cronjob.getinitialHNFeed.stop();
			taskStatus.initialHNFeed = false;
			break;
		case 'startfeeddetail':
			console.log("starting get HN Feed detail job");
			cronjob.getHNFeedDetail.start();
			taskStatus.hnFeedDetail = true;
			break;
		case 'stopfeeddetail':
			console.log("stopping get initial HN Feed detail job");
			cronjob.getHNFeedDetail.stop();
			taskStatus.hnFeedDetail = false;
			break;
		case 'startfeeditembody':
			console.log("starting Feed Item Body HN job");
			cronjob.getFeedItemBody.start();
			taskStatus.feedItemBody = true;
			break;
		case 'stopfeeditembody':
			console.log("stopping Feed Item Body HN job");
			cronjob.getFeedItemBody.stop();
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
	admin.getdocuments(list_limit, category).then((result) => {
			if(result.error) {
				res.render('error', {message: result.error});
			} else{
				res.render('admin', { article_list: result.list});
			}
	});
});

router.get('/article/:id', (req, res) => {
	admin.getdocument(req.params.id).then((result) => {
		if(result.error) {
			res.render('error', {message: result.error});
		}
		res.render('article', {article: result.list});
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
	admin.deletedocument(req.params.id).then((result) => {
		if(result.error) {
			res.render('error', {message: result.error});
		}
		res.redirect('/admin/articles?limit=10&category=false');
	});
});

router.post('/article', (req, res) => {
	let articleId = req.body.articleId;
	let category = req.body.category;
	admin.updatedocument(articleId, category).then((response) => {
		if(response.error != true){
			let uri = '/admin/article/'+ articleId;
			setTimeout(res.redirect(uri), 1000);
		}
	});
});

module.exports = router;
