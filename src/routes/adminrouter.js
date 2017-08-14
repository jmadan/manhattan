const express = require('express');
const router = express.Router();
import * as admin from '../modules/admin';
import * as article from '../modules/article';

router.use((req, res, next) => {
	console.log('Request Time: ', Date.now());
	console.log(req.path);
	next();
});

router.get('/', (req, res) => {
	res.render('admin', {homepage: true});
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
					res.render('articlelist', payload);
				}
		});
	}
});

router.get('/article/:id', (req, res) => {
	article.getDocument(req.params.id).then((result) => {
		if(result.error) {
			res.render('error', {message: result.error});
		}
		res.render('article', {article: result, error: req.query.err, msg: req.query.msg, err: req.query.err});
	});
});

router.get('/article/edit/:id', (req, res) => {
	article.getDocument(req.params.id).then((result) => {
		if(result.error) {
			res.render('error', {message: result.error});
		}
		res.render('article', {article: result});
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
	let item = {
		_id: req.body.id,
		category: req.body.category,
		itembody: req.body.articleBody,
		keywords: req.body.keywrds,
		stemwords: req.body.stemwords
	}
	article.updateDocument(item, 'category').then((response) => {
		if(response.error == false){
			setTimeout(res.redirect(req.originalUrl+"/"+item._id+"?msg=updated"), 1000);
		} else {
			console.log(response.error);
			setTimeout(res.redirect(req.originalUrl+"/"+item._id+"?err=error"), 1000);
		}
	});
});

router.get('/article/body/:id', async(req, res) => {
	let doc = await(article.getDocument(req.params.id));
	let docWithBody = await(article.getDocumentBody(doc));
	let docStatus = await(article.updateDocument(docWithBody, 'body'))
	res.redirect('/admin/article/edit/'+docStatus.docID+"?msg="+docStatus.message);
});

router.get('/article/stem/:id', async(req, res) => {
		let doc = await(article.getDocument(req.params.id));
		let stemmedDoc = await(article.getStemmedDoc(doc));
		let docStatus = await(article.updateDocument(stemmedDoc, 'stem'))
		res.redirect('/admin/article/edit/'+docStatus.docID+"?msg="+docStatus.message);
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
