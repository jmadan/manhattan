const express = require('express')
const router = express.Router()
const feed = require('../modules/feed/feedparser');
const article = require('../modules/feed/article');
const category = require('../modules/category');
const nlp = require('../modules/nlp/aggregate_data');
const tdata = require('../modules/nlp/trainingdata');

router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

router.get('/', function(req, res) {
  res.json({message: "done"})
})

router.get('/feeds',function(req, res) {
  feed.getRSSFeedList().then((feedList)=>{
    res.json({feeds: feedList});
  }).catch((err)=>{
    res.json({error: err});
  })
});

router.get('/feeds/:name',function(req, res) {
  res.json({message: "it needs to be Implemented"});
});

router.get('/articles/:id',function(req, res) {
  article.getItem(req.params.id).then((response)=>{
    res.json({article: response});
  });
});

router.get('/article/edit/:id', (req, res) => {
	article.getItem(req.params.id).then((result) => {
		if(result.error) {
			res.render('error', {message: result.error});
		}
		res.render('article', {article: result.list});
	});
});

router.get('/category', function(req, res) {
  category.getCategories().then((docs)=>{
    res.json(docs);
  }).catch(err=>console.log(err));
})

router.get('/nlp/data/refresh', (req,res)=>{
  nlp.groupStemWordsByCategories().then((result) => {
    res.send(result);
  })
})

router.get('/nlp/data/category/:category', (req,res)=>{
  nlp.getStemWordsByCategory(req.params.category).then((result) => {
    res.send(result);
  })
})

router.get('/nlp/trainingdata', async(req,res)=>{
  let data = await tdata.fetchTrainingData();
  res.json(data);
})

router.get('/feed/getproviders', (req, res) => {
  feed.getRSSFeedProviders().then((result)=>{
    res.json(result);
  })
})

router.get('/feed/getprovidersfeed', (req, res) => {
  feed.getFeedForProviders().then((result)=>{
    res.json(result);
  })
})
module.exports = router