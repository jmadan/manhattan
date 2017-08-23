const express = require('express')
const router = express.Router()
const feed = require('../modules/feed/feedparser');
const article = require('../modules/article');
const category = require('../modules/category');
const nlp = require('../modules/nlp/aggregate_data');
const tdata = require('../modules/nlp/trainingdata');

router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

router.get('/', function(req, res) {
  res.json({message: "You need to call a specific endpoint to get anything back"})
})

router.get('/articles/:id',function(req, res) {
  let stem = req.query.stem != undefined ? true : false;
  article.getItem(req.params.id).then((response)=>{
    if(result.error) {
			res.render('error', {message: result.error});
		}
    if(stem){
      article.getArticleStemWords(item).then((article) =>{
        res.json({article: article});
      })
    } else {
      res.json({article: article});
    }
  });
});

router.get('/articles/stem/:id', (req,res)=>{
  article.getItem(req.params.id).then((item)=>{
     article.getArticleStemWords(item).then((article) =>{
       res.json({article: article});
     })
  })
})

router.get('/articles/categories/:category', (req, res)=>{
  article.getArticleBasedOnCategory(req.params.category).then((result) => {
    console.log(result);
  })
})

router.get('/categories', function(req, res) {
  category.getCategories().then((docs)=>{
    res.json({categories: docs});
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

router.get('/feed/providers/list', (req, res) => {
  feed.getRSSFeedProviders().then((result)=>{
    res.json(result);
  })
})

router.get('/feed/providers/:name', (req, res) => {
  let topic = req.query.topic != undefined ? req.query.topic : 'all';
  console.log("topic: ", topic);
  feed.getRSSFeedProviders().then((result)=>{
    return result.list.filter((provider) => {
      if(provider.name === req.params.name && provider.topic === topic){
        return provider;
      } else {
        return null;
      }
    });
  }).then((provider)=>{
    if(!provider.length){
      res.json({
        "error": "No Feed found with given name and topic",
        "name":req.params.name,
        "topic": topic
      })
    } else{
      res.json({
        "provider": provider,
        "name": provider.name,
        "topic": provider.topic
      })
    }
  });
})


module.exports = router
